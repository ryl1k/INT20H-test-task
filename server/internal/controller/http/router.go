package http

import (
	"net/http"

	docs "github.com/ryl1k/INT20H-test-task-server/docs"
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

// @host      localhost:8080
// @securityDefinitions.apikey ApiKeyAuth
// @in                         header
// @name                       x-api-key

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
<<<<<<< HEAD
	swaggerHandler := echoSwagger.EchoWrapHandler()
	r.echo.GET("/swagger/*", func(c echo.Context) error {
		// Keep Swagger endpoint host/scheme aligned with the current request,
		// so "Try it out" works in both local Docker and deployed environments.
		if host := c.Request().Host; host != "" {
			docs.SwaggerInfo.Host = host
		}

		scheme := c.Scheme()
		if scheme == "" {
			scheme = "http"
		}
		docs.SwaggerInfo.Schemes = []string{scheme}
		docs.SwaggerInfo.BasePath = "/"

		return swaggerHandler(c)
	})

=======
>>>>>>> 1e54adcf8ac827f7beaecc3a6e668d2c29a0ca92
	r.echo.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			"x-api-key",
		},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodDelete, http.MethodPut, http.MethodOptions},
	}))

	swaggerHandler := echoSwagger.EchoWrapHandler()
	r.echo.GET("/swagger/*", func(c echo.Context) error {
		if host := c.Request().Host; host != "" {
			docs.SwaggerInfo.Host = host
		}

		scheme := c.Scheme()
		if scheme == "" {
			scheme = "http"
		}
		docs.SwaggerInfo.Schemes = []string{scheme}
		docs.SwaggerInfo.BasePath = "/"

		return swaggerHandler(c)
	})
	r.echo.GET("/health", v1.HealthHandler)

	withPagination := r.middleware.WithPagination()
	withApiKey := r.middleware.WithApiKey()

	v1Group := r.echo.Group("/v1", withApiKey)

	v1Group.POST("/orders/import", r.orderController.BatchCreate)
	v1Group.POST("/orders", r.orderController.Create)
	v1Group.GET("/orders", r.orderController.GetAll, withPagination)
	v1Group.GET("/orders/:id", r.orderController.GetById)
	v1Group.DELETE("/orders", r.orderController.DeleteAll)
}
