package utilities

import (
	"encoding/json"
	"log"
	"urbis/src/backend/internal/model"
)

func ParseJSON(inc model.IncidentRequest) []byte {
	data, err := json.Marshal(inc)
	if err != nil {
		log.Printf("ERROR_MARSHALING: %v", err) 
		return nil
	}

	return data
} 