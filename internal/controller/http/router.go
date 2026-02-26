package http

import (
	"net/http"

	_ "github.com/ryl1k/NT20H-test-task-server/docs"
	"github.com/ryl1k/NT20H-test-task-server/internal/controller/http/request"
	v1 "github.com/ryl1k/NT20H-test-task-server/internal/controller/http/v1"

	"github.com/labstack/echo/v4"
	echoSwagger "github.com/swaggo/echo-swagger"
)

// @title           Service API
// @version         1.0
// @description     Api documentation.

// @host      localhost:8080
// @BasePath  /v1

type Router struct {
	echo            *echo.Echo
	orderController *v1.OrdersControllers
}

func NewRouter(
	echo *echo.Echo,
	orderController *v1.OrdersControllers,
	validator *request.CustomValidator,
) *Router {
	echo.Validator = validator

	return &Router{
		echo:            echo,
		orderController: orderController,
	}
}

func (r *Router) RegisterRoutes() {
	r.echo.GET("/swagger/*", echoSwagger.EchoWrapHandler())

	v1Group := r.echo.Group("/v1")

	v1Group.GET("/health", func(c echo.Context) error { return c.JSON(http.StatusOK, map[string]string{"status": "healthy"}) })

	v1Group.POST("/orders/import", r.orderController.BatchCreate)
	v1Group.POST("/orders", r.orderController.Create)
}
