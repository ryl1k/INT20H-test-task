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
	MaxPageSize = 200
)

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
