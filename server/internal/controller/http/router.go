package http

import (
	"net/http"

	_ "github.com/ryl1k/INT20H-test-task-server/docs"
	custommiddleware "github.com/ryl1k/INT20H-test-task-server/internal/controller/http/middleware"
	"github.com/ryl1k/INT20H-test-task-server/internal/controller/http/request"
	v1 "github.com/ryl1k/INT20H-test-task-server/internal/controller/http/v1"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"
)

// @title           Service API
// @version         1.0
// @description     Api documentation.

// @host      https://int20h-test-task-server-275358d60541.herokuapp.com

type Router struct {
	echo            *echo.Echo
	orderController *v1.OrdersControllers
	middleware      *custommiddleware.Middleware
}

func NewRouter(
	echo *echo.Echo,
	orderController *v1.OrdersControllers,
	middleware *custommiddleware.Middleware,
	validator *request.CustomValidator,
) *Router {
	echo.Validator = validator

	return &Router{
		echo:            echo,
		middleware:      middleware,
		orderController: orderController,
	}
}

func (r *Router) RegisterRoutes() {
	r.echo.GET("/swagger/*", echoSwagger.EchoWrapHandler())

	r.echo.Use(middleware.CORS())

	withPagination := r.middleware.WithPagination()
	withApiKey := r.middleware.WithApiKey()

	v1Group := r.echo.Group("/v1", withApiKey)

	v1Group.GET("/health", func(c echo.Context) error { return c.JSON(http.StatusOK, map[string]string{"status": "healthy"}) })

	v1Group.POST("/orders/import", r.orderController.BatchCreate)
	v1Group.POST("/orders", r.orderController.Create)
	v1Group.GET("/orders", r.orderController.GetAll, withPagination)
	v1Group.GET("/orders/:id", r.orderController.GetById)
}
