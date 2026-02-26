package usecase

import (
	"context"
	"encoding/csv"
	"io"

	"github.com/ryl1k/NT20H-test-task-server/internal/entity"
	"github.com/ryl1k/NT20H-test-task-server/internal/repo/dto"
)

type (
	OrderService interface {
		Create(ctx context.Context, order dto.Order) (entity.Order, error)
		AsyncBatchCreate(reader *csv.Reader, closer io.Closer)
	}
)
