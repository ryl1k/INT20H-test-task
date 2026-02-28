package repo

import (
	"context"

	"github.com/ryl1k/INT20H-test-task-server/internal/entity"
	"github.com/ryl1k/INT20H-test-task-server/internal/repo/dto"
)

//go:generate mockgen -source=contracts.go -destination=./mocks/mocks.go -package=repomocks
type (
	OrderRepo interface {
		Create(ctx context.Context, order entity.Order) (int, error)
		BatchCreate(ctx context.Context, orders []entity.Order) error
		GetById(ctx context.Context, id int) (entity.Order, error)
		GetAll(ctx context.Context, filter dto.OrderFilters) (entity.OrderList, error)
		DeleteAll(ctx context.Context) error
	}
	TaxRepo interface {
		GetTaxByLocation(ctx context.Context, lat, lon float64) (*entity.JurisdictionTax, bool)
	}
)
