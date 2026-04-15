package repository

import (
	"context"
	"fmt"
	"urbis/src/backend/internal/model"
)

func (r *Repo) GetIncidentRepo(ctx context.Context) ([]model.Incident,error) {
	rows, err := r.pool.Query(ctx, 
	`SELECT id, title, lvl, lat, lng, color, status, created_at
		FROM incidents
		WHERE created_at > NOW() - INTERVAL '2 hours'`,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to select incident into DB: %w", err)
	}

	var incidents []model.Incident

	for rows.Next() {
		var i model.Incident
		err := rows.Scan(
		&i.ID,
		&i.Title,
		&i.Lvl,
		&i.Lat,
		&i.Lng,
		&i.Color,
		&i.Status,
		&i.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to rows incident from DB: %w", err)
		}
		incidents = append(incidents, i)
	}

	return incidents, nil
} 