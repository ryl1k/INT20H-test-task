package v1

import (
	"encoding/csv"
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"time"

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

	statusQueryParam         = "status"
	reportingCodeQueryParam  = "reporting_code"
	totalAmountMinQueryParam = "total_amount_min"
	totalAmountMaxQueryParam = "total_amount_max"
	fromDateQueryParam       = "from_date"
	toDateQueryParam         = "to_date"
	sortByQueryParam         = "sort_by"
	sortOrderQueryParam      = "sort_order"
	maxConcurrentImports     = 4
)

var allowedCSVContentTypes = map[string]struct{}{
	"text/csv":                 {},
	"application/csv":          {},
	"application/vnd.ms-excel": {},
}

func normalizeContentType(contentType string) string {
	contentType = strings.TrimSpace(strings.ToLower(contentType))

	if idx := strings.Index(contentType, ";"); idx >= 0 {
		contentType = strings.TrimSpace(contentType[:idx])
	}

	return contentType
}

func isAllowedCSVUpload(contentType, fileName string) bool {
	normalizedType := normalizeContentType(contentType)
	if _, ok := allowedCSVContentTypes[normalizedType]; ok {
		return true
	}

	isCSVByExtension := strings.EqualFold(filepath.Ext(fileName), ".csv")
	if !isCSVByExtension {
		return false
	}

	// Some clients/browsers provide generic MIME types for CSV uploads.
	switch normalizedType {
	case "", "text/plain", "application/octet-stream":
		return true
	default:
		return false
	}
}

// OrdersControllers handles HTTP operations related to orders.
type OrdersControllers struct {
	orderService     usecase.OrderService
	maxFileSizeBytes int64
	importSlots      chan struct{}
	logger           zerolog.Logger
}

func NewOrdersController(orderService usecase.OrderService, maxFileSizeBytes int64, logger zerolog.Logger) *OrdersControllers {
	l := logger.With().Str("controller", "order_controller").Logger()
	return &OrdersControllers{
		orderService:     orderService,
		maxFileSizeBytes: maxFileSizeBytes,
		importSlots:      make(chan struct{}, maxConcurrentImports),
		logger:           l,
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
	if !isAllowedCSVUpload(contentType, fileHeader.Filename) {
		l.Warn().
			Str("got_type", contentType).
			Str("filename", fileHeader.Filename).
			Msg("invalid file format")
		return response.NewErrorResponse(ctx, entity.ErrInvalidFileFormat)
	}

	fileSize := fileHeader.Size
	if fileSize > c.maxFileSizeBytes {
		err := entity.ErrFileToLarge
		l.Warn().Err(err).Send()
		return response.NewErrorResponse(ctx, err)
	}

	select {
	case c.importSlots <- struct{}{}:
	default:
		return response.NewErrorResponse(ctx, entity.ErrTooManyRequests)
	}

	src, err := fileHeader.Open()
	if err != nil {
		<-c.importSlots
		l.Error().Err(err).Msg("failed to open file")
		return response.NewErrorResponse(ctx, err)
	}
	reader := csv.NewReader(src)

	go func() {
		defer func() { <-c.importSlots }()
		c.orderService.AsyncBatchCreate(reader, src)
	}()

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

	err = ctx.Validate(&req)
	if err != nil {
		l.Warn().Err(err).Msg("failed to validate request")
		return response.NewErrorResponse(ctx, entity.ErrBadRequest)
	}

	if err := validateOrderRequest(req); err != nil {
		l.Warn().Err(err).Msg("failed domain validation for request")
		return response.NewErrorResponse(ctx, entity.ErrBadRequest)
	}

	order, err := c.orderService.Create(ctx.Request().Context(), req)
	if err != nil {
		l.Error().Err(err).Msg("failed to create order")
		return response.NewErrorResponse(ctx, err)
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

	limit, ok := ctx.Get(entity.LimitKey).(int)
	if !ok {
		return response.NewErrorResponse(ctx, entity.ErrInvalidOrEmptyPaginationQueryParams)
	}

	offset, ok := ctx.Get(entity.OffsetKey).(int)
	if !ok {
		return response.NewErrorResponse(ctx, entity.ErrInvalidOrEmptyPaginationQueryParams)
	}

	filter := dto.OrderFilters{
		Limit:         limit,
		Offset:        offset,
		ReportingCode: ctx.QueryParam(reportingCodeQueryParam),
	}
	if err := populateOrderFilters(ctx, &filter); err != nil {
		l.Warn().Err(err).Msg("invalid query filter")
		return response.NewErrorResponse(ctx, entity.ErrBadRequest)
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

func validateOrderRequest(req dto.Order) error {
	if req.Latitude < -90 || req.Latitude > 90 {
		return fmt.Errorf("latitude is out of range")
	}

	if req.Longitude < -180 || req.Longitude > 180 {
		return fmt.Errorf("longitude is out of range")
	}

	if req.Subtotal < 0 {
		return fmt.Errorf("subtotal cannot be negative")
	}

	if req.Timestamp.IsZero() {
		return fmt.Errorf("timestamp is required")
	}

	return nil
}

func populateOrderFilters(ctx echo.Context, filters *dto.OrderFilters) error {
	if status := strings.TrimSpace(ctx.QueryParam(statusQueryParam)); status != "" {
		if status != string(entity.OrderStatusCompleted) && status != string(entity.OrderStatusOutOfScope) {
			return entity.ErrBadRequest
		}
		filters.Status = status
	}

	if sortBy := strings.TrimSpace(ctx.QueryParam(sortByQueryParam)); sortBy != "" {
		if !slices.Contains([]string{"id", "created_at", "total_amount", "status"}, sortBy) {
			return entity.ErrBadRequest
		}
		filters.SortBy = sortBy
	}

	if sortOrder := strings.TrimSpace(strings.ToLower(ctx.QueryParam(sortOrderQueryParam))); sortOrder != "" {
		if sortOrder != "asc" && sortOrder != "desc" {
			return entity.ErrBadRequest
		}
		filters.SortOrder = sortOrder
	}

	totalAmountMin, err := parseOptionalFloat(ctx.QueryParam(totalAmountMinQueryParam))
	if err != nil {
		return err
	}
	filters.TotalAmountMin = totalAmountMin

	totalAmountMax, err := parseOptionalFloat(ctx.QueryParam(totalAmountMaxQueryParam))
	if err != nil {
		return err
	}
	filters.TotalAmountMax = totalAmountMax

	if filters.TotalAmountMin != nil && filters.TotalAmountMax != nil && *filters.TotalAmountMin > *filters.TotalAmountMax {
		return entity.ErrBadRequest
	}

	fromDate, err := parseOptionalDate(ctx.QueryParam(fromDateQueryParam))
	if err != nil {
		return err
	}
	filters.FromDate = fromDate

	toDate, err := parseOptionalDate(ctx.QueryParam(toDateQueryParam))
	if err != nil {
		return err
	}
	filters.ToDate = toDate

	if filters.FromDate != nil && filters.ToDate != nil && filters.FromDate.After(*filters.ToDate) {
		return entity.ErrBadRequest
	}

	return nil
}

func parseOptionalFloat(v string) (*float64, error) {
	if strings.TrimSpace(v) == "" {
		return nil, nil
	}

	parsed, err := strconv.ParseFloat(v, 64)
	if err != nil {
		return nil, errors.Join(entity.ErrBadRequest, err)
	}

	return &parsed, nil
}

func parseOptionalDate(v string) (*time.Time, error) {
	if strings.TrimSpace(v) == "" {
		return nil, nil
	}

	parsed, err := time.Parse(time.RFC3339, v)
	if err != nil {
		return nil, errors.Join(entity.ErrBadRequest, err)
	}

	return &parsed, nil
}
