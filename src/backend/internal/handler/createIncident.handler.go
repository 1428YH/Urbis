package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"urbis/src/backend/internal/model"
	"urbis/src/backend/internal/repository"
	"urbis/src/backend/internal/service"
	"urbis/src/backend/internal/service/validate"
)

func HandlerCreateIncident(repo *repository.Repo) http.HandlerFunc {
	return func (w http.ResponseWriter, r *http.Request) {
		var req model.IncidentRequest

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, fmt.Sprintf("❌ invalid request: %v", err), http.StatusBadRequest)
			return
		}

		err = validate.Incident(&req)
		if err != nil {
			http.Error(w, fmt.Sprintf("❌ validation failed: %v", err), http.StatusBadRequest)
			return 
		}

		err = service.CreateIncident(&req, repo, r.Context())
		if err != nil {
			http.Error(w, fmt.Sprintf("❌ failed to create incident: %v", err), http.StatusInternalServerError)
			return  
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
	}
}