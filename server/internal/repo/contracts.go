package repo

import (
	"context"

	"github.com/ryl1k/NT20H-test-task-server/internal/entity"
)

type (
	OrderRepo interface {
		Create(ctx context.Context, order entity.Order) (int, error)
		BatchCreate(ctx context.Context, orders []entity.Order) error
	}
	TaxRepo interface {
		GetTaxByLocation(ctx context.Context, lat, lon float64) (*entity.JurisdictionTax, bool)
	}
)
