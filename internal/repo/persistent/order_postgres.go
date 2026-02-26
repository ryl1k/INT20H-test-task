package persistent

import (
	"context"
	"fmt"

	"github.com/ryl1k/NT20H-test-task-server/internal/entity"

	"github.com/goccy/go-json"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OrderRepo struct {
	pool *pgxpool.Pool
}

func NewOrderRepo(pool *pgxpool.Pool) *OrderRepo {
	return &OrderRepo{pool: pool}
}

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
