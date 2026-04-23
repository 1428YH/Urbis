package repository

import (
	"context"
	"fmt"
)

func (r *Repo) ReviewConfirmRepo(id int, ctx context.Context) (error) {
	_, err := r.pool.Exec(ctx, `
	UPDATE incidents 
	SET status = 'publish' 
	WHERE id = $1 AND status = 'review';`, id)

	if err != nil {
		return fmt.Errorf("failed to update incident into DB: %w", err)
	}

	return nil
} 