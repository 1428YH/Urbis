package db

import (
	"context"
	"urbis/src/backend/config"

	"github.com/jackc/pgx/v5"
)

func CreateConnection(ctx context.Context) (*pgx.Conn, error) {
	conn, err := pgx.Connect(ctx, config.Load_env("DATABASE_URL"))
	if err != nil {
		return nil, err
	}

	if err := conn.Ping(ctx); err != nil {
		conn.Close(ctx)
        return nil, err
    }

	return conn, nil
}