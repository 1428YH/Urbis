package repository

import (
	"context"
	"fmt"
	"urbis/src/backend/internal/model"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repo struct {
	pool *pgxpool.Pool
}

func NewRepo(pool *pgxpool.Pool) *Repo {
	return &Repo{pool: pool}
}

func (r *Repo) CreateIncidentRepo(i *model.Incident, ctx context.Context) error {
	_, err := r.pool.Exec(ctx,
    `INSERT INTO incidents (title, description, lvl, lat, lng, color, status, reason)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    i.Title, i.Description, i.Lvl, i.Lat, i.Lng, i.Color, i.Status, i.Reason,
	)
	if err != nil {
		return fmt.Errorf("failed to insert incident into DB: %w", err)
	}

	return nil
}
