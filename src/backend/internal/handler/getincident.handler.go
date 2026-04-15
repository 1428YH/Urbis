package handler

import (
	"fmt"
	"net/http"
	"urbis/src/backend/internal/repository"
	"urbis/src/backend/internal/service"
)

func HandlerGetIncident(repo *repository.Repo) http.HandlerFunc {
	return func (w http.ResponseWriter, r *http.Request) {
		incidents, err := service.GetIncident(repo, r.Context())
		if err != nil {
			http.Error(w, fmt.Sprintf("❌ invalid request: %v", err), http.StatusBadRequest)
			return 
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(incidents)
	}
}