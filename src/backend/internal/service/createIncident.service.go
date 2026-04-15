package service

import (
	"context"
	"urbis/src/backend/internal/model"
	"urbis/src/backend/internal/repository"
)

func CreateIncident(req *model.IncidentRequest, repo *repository.Repo, ctx context.Context) error {

	// здесь модерация

	color := map[int]string{
		1:"green", 
		2:"yellow", 
		3:"red",
	}

	incident := model.Incident {
		Title: req.Title,
		Lvl: req.Lvl,
		Lat: req.Lat,
		Lng: req.Lng,
		Color: color[req.Lvl],
		Status: true,
	}

	return repo.CreateIncidentRepo(&incident, ctx)
}