package request

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"urbis/src/backend/config"
	"urbis/src/backend/internal/model"
)

type ModerationResponse struct {
	Action string `json:"action"` 
	Lvl int       `json:"lvl"`
	Text string   `json:"text"`
	Reason string `json:"reason"`
}

func PostModeration(req *model.IncidentRequest) ([]byte,error) {
	data, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}
	
	resp, err := http.Post(config.Load_env("MODERATION_URL"), "application/json", bytes.NewBuffer(data))
	if err != nil {
		return nil, fmt.Errorf("http post failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("http status is not ok: %w", err)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	return body, nil
}