package repository

import (
	"context"
	"fmt"
	"urbis/src/backend/internal/model"

	"github.com/jackc/pgx/v5"
)

type Repo struct {
	conn *pgx.Conn
}

func NewRepo(conn *pgx.Conn) *Repo {
	return &Repo{conn: conn}
}

func (r *Repo) CreateIncidentRepo(i *model.Incident, ctx context.Context) error {
	_, err := r.conn.Exec(ctx,
		`INSERT INTO incidents (title, lvl, lat, lng, color, status)
    VALUES ($1, $2, $3, $4, $5, $6)`,
		i.Title, i.Lvl, i.Lat, i.Lng, i.Color, i.Status,
	)
	if err != nil {
		return fmt.Errorf("failed to insert incident into DB: %w", err)
	}

	return nil
}
