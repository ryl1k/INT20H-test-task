package order

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"time"

	"github.com/ryl1k/NT20H-test-task-server/internal/entity"
	"github.com/ryl1k/NT20H-test-task-server/internal/repo"
	"github.com/ryl1k/NT20H-test-task-server/internal/repo/dto"

	"github.com/rs/zerolog"
)

type UseCase struct {
	outerCtx          context.Context
	taxRepo           repo.TaxRepo
	orderRepo         repo.OrderRepo
	processingTimeout time.Duration
	logger            zerolog.Logger
}

func New(
	outerCtx context.Context,
	taxRepo repo.TaxRepo,
	orderRepo repo.OrderRepo,
	processingTimeout time.Duration,
	logger zerolog.Logger,
) *UseCase {
	l := logger.With().Str("usecase", "order").Logger()
	return &UseCase{
		logger:            l,
		outerCtx:          outerCtx,
		orderRepo:         orderRepo,
		taxRepo:           taxRepo,
		processingTimeout: processingTimeout,
	}
}
func (uc *UseCase) AsyncBatchCreate(reader *csv.Reader, closer io.Closer) {
	defer closer.Close()

	now := time.Now()
	l := uc.logger.With().Str("method", "async_batch_create").Logger()
	ctx, cancel := context.WithTimeout(uc.outerCtx, uc.processingTimeout)
	defer cancel()

	var orders []entity.Order

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
		}
	}

	if len(orders) > 0 {
		if err := uc.orderRepo.BatchCreate(ctx, orders); err != nil {
			l.Error().Err(err).Msg("failed to create batch order")
		}
	}

	l.Debug().Dur("time since start", time.Since(now)).Send()
}

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
