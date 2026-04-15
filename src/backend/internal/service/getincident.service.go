package service

import (
	"context"
	"encoding/json"
	"fmt"
	"urbis/src/backend/internal/repository"
)

func GetIncident(repo *repository.Repo, ctx context.Context) ([]byte,error) {
	incidents, err := repo.GetIncidentRepo(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get incidents: %w", err)
	}

	jsonMar, err := json.MarshalIndent(incidents, "", " ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal JSON: %w", err)
	}

	return jsonMar, nil
}