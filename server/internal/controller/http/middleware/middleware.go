package middleware

import "github.com/labstack/echo/v4"

type Middleware struct {
	apiKey string
}

const apiKeyHeader = "x-api-key"

func NewMiddleware(apiKey string) *Middleware {
	return &Middleware{
		apiKey: apiKey,
	}
}

func (n *Middleware) WithApiKey() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {

			apiKey := c.Request().Header.Get(apiKeyHeader)
			if apiKey == "" {
				return nil
			}

			return next(c)
		}
	}
}
