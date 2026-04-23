package service

import (
	"context"
	"fmt"
	"urbis/src/backend/internal/repository"
)

func ReviewConfirm(id int, repo *repository.Repo, ctx context.Context) (error){
	err := repo.ReviewConfirmRepo(id, ctx)
	if err != nil {
		return fmt.Errorf("review confirm failed: %w", err)
	}

	return nil
}	