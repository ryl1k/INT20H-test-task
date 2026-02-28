package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
)

type PoolOptions struct {
	MaxConns        int32
	MinConns        int32
	MaxConnLifetime time.Duration
	MaxConnIdleTime time.Duration
}

func MustCreateNewConnectionPool(ctx context.Context, uri string, opts PoolOptions) *pgxpool.Pool {
	l := log.Ctx(ctx)
	config, err := pgxpool.ParseConfig(uri)
	if err != nil {
		l.Fatal().Err(err).Msg("failed to parse config")
	}
	if opts.MaxConns > 0 {
		config.MaxConns = opts.MaxConns
	}
	if opts.MinConns > 0 {
		config.MinConns = opts.MinConns
	}
	if opts.MaxConnLifetime > 0 {
		config.MaxConnLifetime = opts.MaxConnLifetime
	}
	if opts.MaxConnIdleTime > 0 {
		config.MaxConnIdleTime = opts.MaxConnIdleTime
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		l.Fatal().Err(err).Msg("failed to create pool of connections")
	}

	const ctxTimeout = time.Second * 5
	iCtx, cancel := context.WithTimeout(ctx, ctxTimeout)
	defer cancel()

	err = pool.Ping(iCtx)
	if err != nil {
		l.Fatal().Err(err).Msg("failed to ping connection")
	}

	return pool
}
