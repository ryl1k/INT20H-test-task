package v1

import (
	"encoding/csv"
	"net/http"

	"github.com/ryl1k/NT20H-test-task-server/internal/controller/http/response"
	"github.com/ryl1k/NT20H-test-task-server/internal/entity"
	"github.com/ryl1k/NT20H-test-task-server/internal/repo/dto"
	"github.com/ryl1k/NT20H-test-task-server/internal/usecase"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog"
)

const (
	fileName = "orders"

	allowedFileFormat = "text/csv"
)

type OrdersControllers struct {
	orderService  usecase.OrderService
	maxFileSizeMb int64
	logger        zerolog.Logger
}

func NewOrdersController(orderService usecase.OrderService, maxFileSizeMb int64, logger zerolog.Logger) *OrdersControllers {
	l := logger.With().Str("controller", "order_controller").Logger()
	return &OrdersControllers{
		orderService:  orderService,
		maxFileSizeMb: maxFileSizeMb,
		logger:        l,
	}
}

func (c *OrdersControllers) BatchCreate(ctx echo.Context) error {
	l := c.logger.With().Str("method", "batch_create").Logger()

	fileHeader, err := ctx.FormFile(fileName)
	if err != nil {
		l.Warn().Err(err).Msg("failed to get file")

		if err == http.ErrMissingFile {
			return response.NewErrorResponse(ctx, entity.ErrFileNotFound)
		}
		return response.NewErrorResponse(ctx, err)
	}

	contentType := fileHeader.Header.Get("Content-Type")
	if contentType != allowedFileFormat {
		l.Warn().Str("got_type", contentType).Msg("invalid file format")
		return response.NewErrorResponse(ctx, entity.ErrInvalidFileFormat)
	}

	fileSize := fileHeader.Size
	if fileSize > c.maxFileSizeMb {
		err := entity.ErrFileToLarge
		l.Warn().Err(err).Send()
		return response.NewErrorResponse(ctx, err)
	}

	src, err := fileHeader.Open()
	if err != nil {
		l.Error().Err(err).Msg("failed to open file")
		return response.NewErrorResponse(ctx, err)
	}
	reader := csv.NewReader(src)

	go c.orderService.AsyncBatchCreate(reader, src)

	return response.NewSuccessResponse(ctx, nil, http.StatusAccepted)
}

func (c *OrdersControllers) Create(ctx echo.Context) error {
	l := c.logger.With().Str("method", "create").Logger()

	var req dto.Order

	err := ctx.Bind(&req)
	if err != nil {
		l.Warn().Err(err).Msg("failed to parse request")
		return response.NewErrorResponse(ctx, entity.ErrBadRequest)
	}

	err = ctx.Validate(req)
	if err != nil {
		l.Warn().Err(err).Msg("failed to validate request")
		return response.NewErrorResponse(ctx, entity.ErrBadRequest)
	}

	order, err := c.orderService.Create(ctx.Request().Context(), req)
	if err != nil {
		l.Error().Err(err).Msg("failed to create order")
		return response.NewErrorResponse(ctx, entity.ErrBadRequest)
	}

	return response.NewSuccessResponse(ctx, order, http.StatusOK)
}
