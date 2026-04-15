package db

import (
	"context"
	"urbis/src/backend/config"

	"github.com/jackc/pgx/v5"
)

func CreateConnection() (*pgx.Conn, error) {
	ctx := context.Background()

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