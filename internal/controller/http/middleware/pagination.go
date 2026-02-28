package middleware

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/ryl1k/INT20H-test-task-server/internal/controller/http/response"
	"github.com/ryl1k/INT20H-test-task-server/internal/entity"
)

const (
	Page        = "page"
	PageSize    = "pageSize"
	MaxPageSize = 12000
)

// WithPagination returns an Echo middleware function
// that validates pagination query parameters.
// It ensures page and pageSize are present, numeric,
// positive, and within allowed limits.
// On success, it calculates limit and offset values
// and stores them in the request context for downstream handlers.
// If validation fails, it returns a standardized error response.
func (m *Middleware) WithPagination() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			page := c.QueryParam(Page)
			pageSize := c.QueryParam(PageSize)
			if page == "" || pageSize == "" {
				return response.NewErrorResponse(c, entity.ErrInvalidOrEmptyPaginationQueryParams)
			}

			pageInt, err := strconv.Atoi(page)
			if err != nil {
				return response.NewErrorResponse(c, entity.ErrInvalidOrEmptyPaginationQueryParams)
			}

			pageSizeInt, err := strconv.Atoi(pageSize)
			if err != nil {
				return response.NewErrorResponse(c, entity.ErrInvalidOrEmptyPaginationQueryParams)
			}

			if pageInt <= 0 || pageSizeInt <= 0 {
				return response.NewErrorResponse(c, entity.ErrInvalidOrEmptyPaginationQueryParams)
			}

			if pageSizeInt > MaxPageSize {
				return response.NewErrorResponse(c, entity.ErrInvalidOrEmptyPaginationQueryParams)
			}

			limit := pageSizeInt
			offset := (pageInt - 1) * limit

			c.Set(entity.LimitKey, limit)
			c.Set(entity.OffsetKey, offset)
			return next(c)
		}
	}

}
