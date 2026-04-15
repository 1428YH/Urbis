package db

import (
	"context"
	"urbis/src/backend/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

func CreatePool(ctx context.Context) (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(ctx, config.Load_env("DATABASE_URL"))
	if err != nil {
		return nil, err
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
        return nil, err
    }

	return pool, nil
}