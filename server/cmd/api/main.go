package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ryl1k/INT20H-test-task-server/internal/config"
	httpcontroller "github.com/ryl1k/INT20H-test-task-server/internal/controller/http"
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
	"github.com/rs/zerolog"
)

const (
	// shutdownCtxTimeout is the maximum duration allowed for graceful shutdown.
	shutdownCtxTimeout = time.Second * 10
)

func main() {
	app := MustCreateNewApp()

	errCh := make(chan error, 1)
	go func() {
		errCh <- app.Start()
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-errCh:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			app.logger.Error().Err(err).Msg("failed to start http server")
			os.Exit(1)
		}
		return
	case sig := <-sigChan:
		app.logger.Info().Str("signal", sig.String()).Msg("shutting down server")
	}

	if err := app.GracefulStop(); err != nil {
		app.logger.Error().Err(err).Msg("failed to gracefully stop application")
		os.Exit(1)
	}

	if err := <-errCh; err != nil && !errors.Is(err, http.ErrServerClosed) {
		app.logger.Error().Err(err).Msg("http server shutdown returned unexpected error")
		os.Exit(1)
	}
}

// app represents the application container holding dependencies
// such as database pool, HTTP server instance, and context for cancellation.
type app struct {
	ctx        context.Context
	cancel     context.CancelFunc
	pool       *pgxpool.Pool
	httpServer *httpserver.HttpServer
	logger     zerolog.Logger
}

// MustCreateNewApp initializes all application dependencies
// Returns a fully constructed *app instance ready to start.
func MustCreateNewApp() *app {
	cfg := config.MustCreateConfig()

	logger := logger.NewLogger(cfg.LogLevel)

	ctx, cancel := context.WithCancel(context.Background())
	ctx = logger.With().Str("method", "must_create_new_app").Logger().WithContext(ctx)

	pool := postgres.MustCreateNewConnectionPool(ctx, cfg.PostgresConnectionURI, postgres.PoolOptions{
		MaxConns:        int32(cfg.PostgresMaxConns),
		MinConns:        int32(cfg.PostgresMinConns),
		MaxConnLifetime: cfg.PostgresMaxConnLifetime,
		MaxConnIdleTime: cfg.PostgresMaxConnIdleTime,
	})

	orderRepo := persistent.NewOrderRepo(pool)
	taxRepo := tax.New(cfg.GeoJSON.Features, cfg.TaxConfig.Jurisdictions)

	orderService := order.New(ctx, taxRepo, orderRepo, cfg.BatchOrderProcessingTimeout, cfg.OrdersBatchSize, logger)

	httpServer := httpserver.NewHttpServer(cfg.HttpServerPort)

	orderController := v1.NewOrdersController(orderService, int64(cfg.MaxFileSize), logger)

	requestValidator := request.NewCustomValidator()
	middleware := middleware.NewMiddleware(cfg.ApiKey)

	router := httpcontroller.NewRouter(httpServer.GetInstance(), orderController, middleware, requestValidator)
	router.RegisterRoutes()

	return &app{
		ctx:        ctx,
		cancel:     cancel,
		pool:       pool,
		httpServer: httpServer,
		logger:     logger,
	}
}

// Start launches the HTTP server and begins processing incoming requests.
func (a *app) Start() error {
	return a.httpServer.Run()
}

// GracefulStop shuts down the HTTP server and releases resources.
// It waits up to shutdownCtxTimeout for ongoing requests to complete.
// Closes the database connection pool and cancels the application context.
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
