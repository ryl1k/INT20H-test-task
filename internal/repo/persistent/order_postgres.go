package persistent

import (
	"context"
	"fmt"

	"github.com/ryl1k/INT20H-test-task-server/internal/entity"
	"github.com/ryl1k/INT20H-test-task-server/internal/repo/dto"

	"github.com/goccy/go-json"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// OrderRepo implements persistence logic for orders using PostgreSQL.
// It provides CRUD operations and batch insertion functionality.
// The repository relies on pgx connection pooling.
type OrderRepo struct {
	pool *pgxpool.Pool
}

func NewOrderRepo(pool *pgxpool.Pool) *OrderRepo {
	return &OrderRepo{pool: pool}
}

// Create inserts a single order into the database.
// It serializes jurisdictions into JSON format,
// executes an INSERT query with RETURNING id,
// and returns the generated primary key.
func (r *OrderRepo) Create(ctx context.Context, order entity.Order) (int, error) {
	jurisdictionsJSON, err := json.Marshal(order.Jurisdictions)
	if err != nil {
		return 0, fmt.Errorf("marshal jurisdictions: %w", err)
	}

	query := `
INSERT INTO orders (
	latitude, longitude, total_amount, tax_amount, 
	composite_tax_rate, state_rate, county_rate, city_rate, 
	special_rates, jurisdictions, reporting_code, status, created_at, updated_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
RETURNING id`

	var generatedID int
	err = r.pool.QueryRow(ctx, query,
		order.Latitude,
		order.Longitude,
		order.TotalAmount,
		order.TaxAmount,
		order.CompositeTaxRate,
		order.Breakdown.StateRate,
		order.Breakdown.CountyRate,
		order.Breakdown.CityRate,
		order.Breakdown.SpecialRate,
		jurisdictionsJSON,
		order.ReportingCode,
		order.Status,
		order.CreatedAt,
		order.UpdatedAt,
	).Scan(&generatedID)

	if err != nil {
		return 0, fmt.Errorf("query row insert: %w", err)
	}

	return generatedID, nil
}

// BatchCreate performs bulk insertion of orders using PostgreSQL COPY protocol.
// It serializes jurisdictions for each order and streams
// data efficiently using pgx.CopyFrom.
// This method is optimized for high-volume inserts.
func (r *OrderRepo) BatchCreate(ctx context.Context, orders []entity.Order) error {
	columns := []string{
		"latitude", "longitude", "total_amount", "tax_amount",
		"composite_tax_rate", "state_rate", "county_rate", "city_rate",
		"special_rates", "jurisdictions", "reporting_code", "status", "created_at", "updated_at",
	}

	_, err := r.pool.CopyFrom(
		ctx,
		pgx.Identifier{"orders"},
		columns,
		pgx.CopyFromSlice(len(orders), func(i int) ([]any, error) {
			jurisdictionsJSON, err := json.Marshal(orders[i].Jurisdictions)
			if err != nil {
				return nil, fmt.Errorf("marshal jurisdictions at index %d: %w", i, err)
			}

			return []any{
				orders[i].Latitude,
				orders[i].Longitude,
				orders[i].TotalAmount,
				orders[i].TaxAmount,
				orders[i].CompositeTaxRate,
				orders[i].Breakdown.StateRate,
				orders[i].Breakdown.CountyRate,
				orders[i].Breakdown.CityRate,
				orders[i].Breakdown.SpecialRate,
				jurisdictionsJSON,
				orders[i].ReportingCode,
				string(orders[i].Status),
				orders[i].CreatedAt,
				orders[i].UpdatedAt,
			}, nil
		}),
	)

	if err != nil {
		return fmt.Errorf("copy from orders: %w", err)
	}

	return nil
}

// GetAll retrieves a paginated list of orders based on filter criteria.
// It dynamically builds a WHERE clause depending on provided filters,
// applies sorting with a whitelist of allowed columns,
// and returns both the result set and total row count
// using a window function (COUNT(*) OVER()).
func (r *OrderRepo) GetAll(ctx context.Context, filter dto.OrderFilters) (entity.OrderList, error) {
	query := `
SELECT 
	id, latitude, longitude, total_amount, tax_amount, 
	composite_tax_rate, state_rate, county_rate, city_rate, 
	special_rates, jurisdictions, reporting_code, status, 
	created_at, updated_at, 
	COUNT(*) OVER() AS total_count
FROM orders
WHERE 1=1` // initial setup for where statement so following should not care

	args := []any{}
	argID := 1

	if filter.Status != "" {
		query += fmt.Sprintf(" AND status = $%d", argID)
		args = append(args, filter.Status)
		argID++
	}

	if filter.ReportingCode != "" {
		query += fmt.Sprintf(" AND reporting_code = $%d", argID)
		args = append(args, filter.ReportingCode)
		argID++
	}

	if filter.TotalAmountMin != "" {
		query += fmt.Sprintf(" AND total_amount >= $%d", argID)
		args = append(args, filter.TotalAmountMin)
		argID++
	}

	if filter.TotalAmountMax != "" {
		query += fmt.Sprintf(" AND total_amount <= $%d", argID)
		args = append(args, filter.TotalAmountMax)
		argID++
	}

	if filter.FromDate != "" {
		query += fmt.Sprintf(" AND created_at >= $%d", argID)
		args = append(args, filter.FromDate)
		argID++
	}

	if filter.ToDate != "" {
		query += fmt.Sprintf(" AND created_at <= $%d", argID)
		args = append(args, filter.ToDate)
		argID++
	}

	allowedSortColumns := map[string]string{
		"created_at":   "created_at",
		"total_amount": "total_amount",
		"id":           "id",
		"status":       "status",
	}

	sortBy, ok := allowedSortColumns[filter.SortBy]
	if !ok {
		sortBy = "created_at"
	}

	sortOrder := "DESC"
	if filter.SortOrder == "asc" {
		sortOrder = "ASC"
	}
	query += fmt.Sprintf(" ORDER BY %s %s", sortBy, sortOrder)

	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argID, argID+1)
	args = append(args, filter.Limit, filter.Offset)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return entity.OrderList{}, fmt.Errorf("failed to query: %w", err)
	}
	defer rows.Close()

	var orders []entity.Order
	var total int

	for rows.Next() {
		var o entity.Order
		var jurisdictionsJSON []byte

		err := rows.Scan(
			&o.Id, &o.Latitude, &o.Longitude, &o.TotalAmount, &o.TaxAmount,
			&o.CompositeTaxRate, &o.Breakdown.StateRate, &o.Breakdown.CountyRate,
			&o.Breakdown.CityRate, &o.Breakdown.SpecialRate, &jurisdictionsJSON,
			&o.ReportingCode, &o.Status, &o.CreatedAt, &o.UpdatedAt,
			&total,
		)
		if err != nil {
			return entity.OrderList{}, fmt.Errorf("failed to scan order: %w", err)
		}

		if err := json.Unmarshal(jurisdictionsJSON, &o.Jurisdictions); err != nil {
			return entity.OrderList{}, fmt.Errorf("failed to unmarshal jurisdictions: %w", err)
		}

		orders = append(orders, o)
	}

	return entity.OrderList{
		Orders: orders,
		Total:  total,
	}, nil
}

// DeleteAll removes all records from the orders table.
// Intended primarily for administrative or testing use cases.
func (r *OrderRepo) DeleteAll(ctx context.Context) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM orders`)
	if err != nil {
		return fmt.Errorf("failed to delete all orders: %w", err)
	}
	return nil
}

// GetById retrieves a single order by its identifier.
// If no record is found, it returns a domain-level ErrOrderNotFound error.
// Jurisdictions are deserialized from JSON into the domain model.
func (r *OrderRepo) GetById(ctx context.Context, id int) (entity.Order, error) {
	query := `
SELECT 
	id, latitude, longitude, total_amount, tax_amount, 
	composite_tax_rate, state_rate, county_rate, city_rate, 
	special_rates, jurisdictions, reporting_code, status, 
	created_at, updated_at
FROM orders
WHERE id = $1`

	var o entity.Order
	var jurisdictionsJSON []byte

	err := r.pool.QueryRow(ctx, query, id).Scan(
		&o.Id, &o.Latitude, &o.Longitude, &o.TotalAmount, &o.TaxAmount,
		&o.CompositeTaxRate, &o.Breakdown.StateRate, &o.Breakdown.CountyRate,
		&o.Breakdown.CityRate, &o.Breakdown.SpecialRate, &jurisdictionsJSON,
		&o.ReportingCode, &o.Status, &o.CreatedAt, &o.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return entity.Order{}, entity.ErrOrderNotFound
		}
		return entity.Order{}, fmt.Errorf("failed to query and scan row: %w", err)
	}

	if err := json.Unmarshal(jurisdictionsJSON, &o.Jurisdictions); err != nil {
		return entity.Order{}, fmt.Errorf("failed to unmarshal jurisdictions: %w", err)
	}

	return o, nil
}
