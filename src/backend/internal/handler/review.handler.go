package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"urbis/src/backend/internal/repository"
	"urbis/src/backend/internal/service"
)

func ReviewHandler(repo *repository.Repo) http.HandlerFunc {
	return func (w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, fmt.Sprintf("❌ Invalid format ID: %v", err), http.StatusBadRequest)
			return 
		}
		
		err = service.ReviewConfirm(idInt, repo, r.Context())
		if err != nil {
			http.Error(w, fmt.Sprintf("❌ failed to confim incident: %v", err), http.StatusBadRequest)
			return 
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
	}
}