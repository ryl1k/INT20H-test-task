package v1

import (
	"encoding/csv"
	"net/http"
	"strconv"

	"github.com/ryl1k/INT20H-test-task-server/internal/controller/http/response"
	"github.com/ryl1k/INT20H-test-task-server/internal/entity"
	"github.com/ryl1k/INT20H-test-task-server/internal/repo/dto"
	"github.com/ryl1k/INT20H-test-task-server/internal/usecase"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog"
)

const (
	fileName = "orders"

	idParam = "id"

	allowedFileFormat = "text/csv"

	statusQueryParam         = "status"
	reportingCodeQueryParam  = "reporting_code"
	totalAmountMinQueryParam = "total_amount_min"
	totalAmountMaxQueryParam = "total_amount_max"
	fromDateQueryParam       = "from_date"
	toDateQueryParam         = "to_date"
	sortByQueryParam         = "sort_by"
	sortOrderQueryParam      = "sort_order"
)

// OrdersControllers handles HTTP operations related to orders.
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

// BatchCreate godoc
// @Summary      Batch create orders from CSV
// @Description  Uploads a CSV file, validates format and size, and processes orders asynchronously.
// @Tags         orders
// @Accept       multipart/form-data
// @Produce      json
// @Param        orders  formData  file  true  "CSV file containing orders data"
// @Success      202  {object}  response.Response  "Successfully accepted for processing"
// @Failure      400  {object}  response.Response    "Invalid file format or file too large"
// @Failure      404  {object}  response.Response    "File not found"
// @Security     ApiKeyAuth
// @Router       /v1/orders/import [post]
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

	l.Info().Msg("successfully pushed orders for process")

	return response.NewSuccessResponse(ctx, nil, http.StatusAccepted)
}

// Create godoc
// @Summary      Create a single order
// @Description  Manually create a new order with tax rates and jurisdictions.
// @Tags         orders
// @Accept       json
// @Produce      json
// @Param        request  body      dto.Order  true  "Order data"
// @Success      200      {object}  entity.Order
// @Failure      400      {object}  response.Response  "Invalid request body or validation failed"
// @Failure      500      {object}  response.Response  "Internal server error"
// @Security     ApiKeyAuth
// @Router       /v1/orders [post]
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
	l.Info().Int("id", order.Id).Str("status", string(order.Status)).Msg("successfully created order")

	return response.NewSuccessResponse(ctx, order, http.StatusOK)
}

// GetAll godoc
// @Summary      Get list of orders
// @Description  Retrieve a paginated list of orders with optional filters for status, amount, and dates.
// @Tags         orders
// @Accept       json
// @Produce      json
// @Param        pageSize              query     int     true  "Limit for pagination"
// @Param        page             query     int     true  "Offset for pagination"
// @Param        status             query     entity.OrderStatus  false  "Filter by order status"
// @Param        reporting_code     query     string  false  "Filter by reporting code"
// @Param        total_amount_min   query     number  false  "Minimum total amount"
// @Param        total_amount_max   query     number  false  "Maximum total amount"
// @Param        from_date          query     string  false  "Start date (ISO8601)"        example(2023-01-01T00:00:00Z)
// @Param        to_date            query     string  false  "End date (ISO8601)"          example(2023-12-31T23:59:59Z)
// @Param        sort_by            query     string  false  "Sort by field (id, created_at, total_amount)"
// @Param        sort_order         query     string  false  "Sort order (asc, desc)"      Enums(asc, desc)
// @Success      200  {object}  entity.OrderList
// @Failure      400  {object}  response.Response  "Invalid pagination query params"
// @Failure      500  {object}  response.Response
// @Security     ApiKeyAuth
// @Router       /v1/orders [get]
func (c *OrdersControllers) GetAll(ctx echo.Context) error {
	l := c.logger.With().Str("method", "get_all").Logger()

	limit := ctx.Get(entity.LimitKey).(int)
	offset := ctx.Get(entity.OffsetKey).(int)

	filter := dto.OrderFilters{
		Limit:          limit,
		Offset:         offset,
		Status:         ctx.QueryParam(statusQueryParam),
		ReportingCode:  ctx.QueryParam(reportingCodeQueryParam),
		TotalAmountMin: ctx.QueryParam(totalAmountMinQueryParam),
		TotalAmountMax: ctx.QueryParam(totalAmountMaxQueryParam),
		FromDate:       ctx.QueryParam(fromDateQueryParam),
		ToDate:         ctx.QueryParam(toDateQueryParam),
		SortBy:         ctx.QueryParam(sortByQueryParam),
		SortOrder:      ctx.QueryParam(sortOrderQueryParam),
	}

	orders, err := c.orderService.GetAll(ctx.Request().Context(), filter)
	if err != nil {
		l.Error().Err(err).Msg("failed to get orders")
		return response.NewErrorResponse(ctx, err)
	}

	l.Info().Int("count", orders.Total).Msg("successfully fetched orders")

	return response.NewSuccessResponse(ctx, orders, http.StatusOK)
}

// DeleteAll godoc
// @Summary      Delete all orders
// @Description  Remove all orders from the database.
// @Tags         orders
// @Produce      json
// @Success      204  "No Content"
// @Failure      500  {object}  response.Response  "Internal server error"
// @Security     ApiKeyAuth
// @Router       /v1/orders [delete]
func (c *OrdersControllers) DeleteAll(ctx echo.Context) error {
	l := c.logger.With().Str("method", "delete_all").Logger()

	err := c.orderService.DeleteAll(ctx.Request().Context())
	if err != nil {
		l.Error().Err(err).Msg("failed to delete all orders")
		return response.NewErrorResponse(ctx, err)
	}

	l.Info().Msg("successfully deleted all orders")

	return ctx.NoContent(http.StatusNoContent)
}

// GetById godoc
// @Summary      Get order by ID
// @Description  Fetch detailed information about a specific order using its unique identifier.
// @Tags         orders
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Order ID"
// @Success      200  {object}  entity.Order
// @Failure      400  {object}  response.Response  "Invalid ID format"
// @Failure      404  {object}  response.Response  "Order not found"
// @Failure      500  {object}  response.Response  "Internal server error"
// @Security     ApiKeyAuth
// @Router       /v1/orders/{id} [get]
func (c *OrdersControllers) GetById(ctx echo.Context) error {
	l := c.logger.With().Str("method", "get_by_id").Logger()

	idStr := ctx.Param(idParam)

	id, err := strconv.Atoi(idStr)
	if err != nil {
		l.Warn().Err(err).Msg("failed to parse id of order")
		return response.NewErrorResponse(ctx, entity.ErrBadRequest)
	}

	order, err := c.orderService.GetById(ctx.Request().Context(), id)
	if err != nil {
		l.Error().Err(err).Msg("failed to order by id")
		return response.NewErrorResponse(ctx, err)
	}

	l.Info().Int("id", order.Id).Msg("successfully retrieved order by id")

	return response.NewSuccessResponse(ctx, order, http.StatusOK)
}
