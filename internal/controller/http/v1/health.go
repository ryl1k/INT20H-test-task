package v1

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func HealthHandler(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, map[string]string{
		"status": "healthy",
	})
}
