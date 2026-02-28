package order

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"time"

	"github.com/ryl1k/INT20H-test-task-server/internal/entity"
	"github.com/ryl1k/INT20H-test-task-server/internal/repo"
	"github.com/ryl1k/INT20H-test-task-server/internal/repo/dto"

	"github.com/rs/zerolog"
)

// UseCase implements business logic for order processing.
// It orchestrates tax calculation, order creation, batch CSV processing,
// and delegates persistence operations to repositories.
type UseCase struct {
	// outerCtx is the parent context used for long-running operations
	// such as asynchronous batch processing.
	outerCtx context.Context

	taxRepo   repo.TaxRepo
	orderRepo repo.OrderRepo

	// processingTimeout defines the maximum duration allowed
	// for asynchronous batch processing.
	processingTimeout time.Duration

	// ordersBatchSize defines how many orders are accumulated
	// before performing a batch insert into storage.
	ordersBatchSize int
	logger          zerolog.Logger
}

func New(
	outerCtx context.Context,
	taxRepo repo.TaxRepo,
	orderRepo repo.OrderRepo,
	processingTimeout time.Duration,
	ordersBatchSize int,
	logger zerolog.Logger,
) *UseCase {
	l := logger.With().Str("usecase", "order").Logger()
	return &UseCase{
		logger:            l,
		outerCtx:          outerCtx,
		orderRepo:         orderRepo,
		taxRepo:           taxRepo,
		ordersBatchSize:   ordersBatchSize,
		processingTimeout: processingTimeout,
	}
}

// AsyncBatchCreate processes orders from a CSV reader asynchronously.
// It reads records one by one, maps them to domain entities,
// calculates taxes based on coordinates, and inserts them in batches.
// Processing stops when the timeout is reached or EOF occurs.
// Invalid rows are skipped and logged.
// Remaining buffered orders are flushed before completion.
func (uc *UseCase) AsyncBatchCreate(reader *csv.Reader, closer io.Closer) {
	defer closer.Close()

	now := time.Now()
	l := uc.logger.With().Str("method", "async_batch_create").Logger()

	ctx, cancel := context.WithTimeout(uc.outerCtx, uc.processingTimeout)
	defer cancel()

	orders := make([]entity.Order, 0, uc.ordersBatchSize)

	processedCount := 0
	failedCount := 0

loop:
	for {
		select {
		case <-ctx.Done():
			l.Error().Msg("processing timeout reached")
			return
		default:
			rec, err := reader.Read()
			if err == io.EOF {
				break loop
			}
			if err != nil {
				l.Error().Err(err).Msg("failed to read line")
				break loop
			}

			parsedOrder, err := uc.mapCSVToEntity(rec)
			if err != nil {
				l.Warn().Err(err).Interface("record", rec).Msg("skipping invalid row")
				failedCount++
				continue
			}

			tax, ok := uc.taxRepo.GetTaxByLocation(ctx, parsedOrder.Latitude, parsedOrder.Longitude)

			var order entity.Order
			if !ok {
				order = uc.buildOutOfScopeOrder(parsedOrder)
			} else {
				order = uc.buildCompletedOrder(parsedOrder, *tax)
			}

			orders = append(orders, order)
			processedCount++

			if len(orders) >= uc.ordersBatchSize {
				if err := uc.orderRepo.BatchCreate(ctx, orders); err != nil {
					l.Error().Err(err).Int("batch_size", len(orders)).Msg("failed to create batch order")
				}

				orders = orders[:0]
			}
		}
	}

	if len(orders) > 0 {
		if err := uc.orderRepo.BatchCreate(ctx, orders); err != nil {
			l.Error().Err(err).Int("remaining_size", len(orders)).Msg("failed to create remaining batch order")
		}
	}

	l.Info().
		Int("total_processed", processedCount).
		Int("total_failed", failedCount).
		Dur("duration", time.Since(now)).
		Msg("async batch processing finished")
}

// Create handles single order creation.
// It retrieves tax information by coordinates,
// builds either a completed or out-of-scope order,
// persists it, and returns the resulting entity.
func (uc *UseCase) Create(ctx context.Context, orderDto dto.Order) (entity.Order, error) {

	tax, ok := uc.taxRepo.GetTaxByLocation(ctx, orderDto.Latitude, orderDto.Longitude)
	var order entity.Order
	if !ok {
		order = uc.buildOutOfScopeOrder(orderDto)
	} else {
		order = uc.buildCompletedOrder(orderDto, *tax)
	}

	id, err := uc.orderRepo.Create(ctx, order)
	if err != nil {
		return entity.Order{}, fmt.Errorf("failed to create order: %w", err)
	}
	order.Id = id
	return order, nil
}

// GetById returns an order by its identifier.
// It delegates retrieval to the order repository.
func (uc *UseCase) GetById(ctx context.Context, id int) (entity.Order, error) {
	return uc.orderRepo.GetById(ctx, id)
}

// GetAll returns a filtered list of orders.
// Filtering logic is delegated to the repository layer.
func (uc *UseCase) GetAll(ctx context.Context, filter dto.OrderFilters) (entity.OrderList, error) {
	return uc.orderRepo.GetAll(ctx, filter)
}

// DeleteAll removes all orders from storage.
// Intended primarily for administrative or testing purposes.
func (uc *UseCase) DeleteAll(ctx context.Context) error {
	return uc.orderRepo.DeleteAll(ctx)
}

// buildOutOfScopeOrder constructs an order entity
// when no tax jurisdiction matches the provided coordinates.
// Such orders are marked as OutOfScope and contain no tax data.
func (uc *UseCase) buildOutOfScopeOrder(p dto.Order) entity.Order {
	return entity.Order{
		Latitude:      p.Latitude,
		Longitude:     p.Longitude,
		TotalAmount:   p.Subtotal,
		Status:        entity.OrderStatusOutOfScope,
		Jurisdictions: []string{},
		CreatedAt:     p.Timestamp,
		UpdatedAt:     p.Timestamp,
	}
}

// buildCompletedOrder constructs a fully calculated order entity
// when tax information is available.
// It computes tax amount using the composite tax rate
// and fills detailed tax breakdown and reporting metadata.
func (uc *UseCase) buildCompletedOrder(p dto.Order, tax entity.JurisdictionTax) entity.Order {
	return entity.Order{
		Latitude:         p.Latitude,
		Longitude:        p.Longitude,
		TotalAmount:      p.Subtotal,
		TaxAmount:        p.Subtotal * tax.CompositeRate,
		CompositeTaxRate: tax.CompositeRate,
		Breakdown: entity.TaxRateBreakdown{
			StateRate:   tax.Breakdown.State,
			CountyRate:  tax.Breakdown.County,
			CityRate:    tax.Breakdown.City,
			SpecialRate: tax.Breakdown.Special,
		},
		Jurisdictions: tax.Names,
		ReportingCode: tax.Code,
		Status:        entity.OrderStatusCompleted,
		CreatedAt:     p.Timestamp,
		UpdatedAt:     p.Timestamp,
	}
}

// mapCSVToEntity converts a CSV record into a DTO order.
// It validates column count, parses coordinates, timestamp,
// and subtotal amount. Invalid records return an error.
func (uc *UseCase) mapCSVToEntity(rec []string) (dto.Order, error) {
	if len(rec) < 5 {
		return dto.Order{}, fmt.Errorf("invalid column count")
	}

	lon, err := strconv.ParseFloat(rec[1], 64)
	lat, err := strconv.ParseFloat(rec[2], 64)
	if err != nil {
		return dto.Order{}, err
	}

	const layout = "2006-01-02 15:04:05.999999999"
	ts, err := time.Parse(layout, rec[3])
	sub, err := strconv.ParseFloat(rec[4], 64)
	if err != nil {
		return dto.Order{}, err
	}

	return dto.Order{
		Longitude: lon,
		Latitude:  lat,
		Subtotal:  sub,
		Timestamp: ts,
	}, nil
}
