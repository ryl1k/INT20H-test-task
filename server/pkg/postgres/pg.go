package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
)

func MustCreateNewConnectionPool(ctx context.Context, uri string) *pgxpool.Pool {
	l := log.Ctx(ctx)
	config, err := pgxpool.ParseConfig(uri)
	if err != nil {
		l.Fatal().Err(err).Msg("failed to parse config")
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
