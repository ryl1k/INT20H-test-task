package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/ryl1k/INT20H-test-task-server/internal/controller/http/response"
	"github.com/ryl1k/INT20H-test-task-server/internal/entity"
)

type Middleware struct {
	apiKey string
}

const apiKeyHeader = "x-api-key"

func NewMiddleware(apiKey string) *Middleware {
	return &Middleware{
		apiKey: apiKey,
	}
}
func (m *Middleware) WithApiKey() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			key := c.Request().Header.Get(apiKeyHeader)

			if key == "" || key != m.apiKey {
				return response.NewErrorResponse(c, entity.ErrUnauthorizedAccessToProvidedData)
			}

			return next(c)
		}
	}
}
