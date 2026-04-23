package service

import (
	"context"
	"encoding/json"
	"fmt"
	"urbis/src/backend/internal/model"
	"urbis/src/backend/internal/repository"
	"urbis/src/backend/internal/request"
)

func CreateIncident(req *model.IncidentRequest, repo *repository.Repo, ctx context.Context) error {
	body, err := request.PostModeration(req)
	if err != nil {
		return fmt.Errorf("failed to moderate incident: %w", err)
	}

	var resp request.ModerationResponse
	if err = json.Unmarshal(body, &resp); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if resp.Action == "reject" {
		return fmt.Errorf("incident rejected by moderation")
	}

	color := map[int]string{
		1:"green", 
		2:"yellow", 
		3:"red",
	}

	incident := model.Incident {
		Title: resp.Text,
		Description: req.Description,
		Lvl: resp.Lvl,
		Lat: req.Lat,
		Lng: req.Lng,
		Color: color[resp.Lvl],
		Status: resp.Action,
		Reason: resp.Reason,
	}

	return repo.CreateIncidentRepo(&incident, ctx)
}