package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/ryl1k/INT20H-test-task-server/internal/controller/http/response"
	"github.com/ryl1k/INT20H-test-task-server/internal/entity"
)

// Middleware aggregates reusable HTTP middleware logic.
// It holds configuration values shared across middleware handlers.
type Middleware struct {
	apiKey string
}

const apiKeyHeader = "x-api-key"

func NewMiddleware(apiKey string) *Middleware {
	return &Middleware{
		apiKey: apiKey,
	}
}

// WithApiKey returns an Echo middleware function
// that validates the presence and correctness of the API key.
// If the key is missing or invalid, it returns an unauthorized response.
// Otherwise, the request is forwarded to the next handler.
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
