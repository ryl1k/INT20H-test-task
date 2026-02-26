package main

import (
	"context"
	"errors"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ryl1k/INT20H-test-task-server/internal/config"
	"github.com/ryl1k/INT20H-test-task-server/internal/controller/http"
	"github.com/ryl1k/INT20H-test-task-server/internal/controller/http/middleware"
	"github.com/ryl1k/INT20H-test-task-server/internal/controller/http/request"
	v1 "github.com/ryl1k/INT20H-test-task-server/internal/controller/http/v1"
	"github.com/ryl1k/INT20H-test-task-server/internal/repo/persistent"
	"github.com/ryl1k/INT20H-test-task-server/internal/repo/tax"
	"github.com/ryl1k/INT20H-test-task-server/internal/usecase/order"
	"github.com/ryl1k/INT20H-test-task-server/pkg/httpserver"
	"github.com/ryl1k/INT20H-test-task-server/pkg/logger"
	"github.com/ryl1k/INT20H-test-task-server/pkg/postgres"

	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	shutdownCtxTimeout = time.Second * 10
)

func main() {
	app := MustCreateNewApp()

	err := app.Start()
	if err != nil {
		os.Exit(1)
	}

	defer func() {
		_ = app.GracefulStop()
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan
}

type app struct {
	ctx        context.Context
	cancel     context.CancelFunc
	pool       *pgxpool.Pool
	httpServer *httpserver.HttpServer
}

func MustCreateNewApp() *app {
	cfg := config.MustCreateConfig()

	logger := logger.NewLogger(cfg.LogLevel)

	ctx, cancel := context.WithCancel(context.Background())
	ctx = logger.With().Str("method", "must_create_new_app").Logger().WithContext(ctx)

	pool := postgres.MustCreateNewConnectionPool(ctx, cfg.PostgresConnectionURI)

	orderRepo := persistent.NewOrderRepo(pool)
	taxRepo := tax.New(cfg.GeoJSON.Features, cfg.TaxConfig.Jurisdictions)

	orderService := order.New(ctx, taxRepo, orderRepo, cfg.BatchOrderProcessingTimeout, cfg.OrdersBatchSize, logger)

	httpServer := httpserver.NewHttpServer(cfg.HttpServerPort)

	orderController := v1.NewOrdersController(orderService, int64(cfg.MaxFileSize), logger)

	requestValidator := request.NewCustomValidator()
	middleware := middleware.NewMiddleware()

	router := http.NewRouter(httpServer.GetInstance(), orderController, middleware, requestValidator)
	router.RegisterRoutes()

	return &app{
		ctx:        ctx,
		cancel:     cancel,
		pool:       pool,
		httpServer: httpServer,
	}
}

func (a *app) Start() error {
	return a.httpServer.Run()
}

func (a *app) GracefulStop() error {
	ctx, cancel := context.WithTimeout(context.Background(), shutdownCtxTimeout)
	defer cancel()

	var errs error
	if err := a.httpServer.Shutdown(ctx); err != nil {
		errs = errors.Join(err, errs)
	}

	a.cancel()

	if a.pool != nil {
		a.pool.Close()
	}

	return errs
}
