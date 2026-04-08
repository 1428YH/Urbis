package model

import "fmt"

type Incident struct {
	ID       int
	Title    string
	Category string
	Lat      float64
	Lng      float64
	Color    string
	Status   bool
}

type IncidentRequest struct {
	Title    string  `json:"title"`
	Category string  `json:"type"`
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`
}

func CreateIncidentRequest(
	title string,
	category string,
	lat float64,
	lng float64,
) (*IncidentRequest, error) {
	if title == "" {
		return nil, fmt.Errorf("ERROR_TITLE_EMPTY")
	}

	if category == "" {
		return nil, fmt.Errorf("ERROR_CATEGORY_EMPTY")
	}

	if lat < -90.0 || lat > 90.0 {
		return nil, fmt.Errorf("ERROR_LAT_INVALID")
	}
	if lng < -180.0 || lng > 180.0 {
		return nil, fmt.Errorf("ERROR_LNG_INVALID")
	}

	return &IncidentRequest{
		Title:    title,
		Category: category,
		Lat:      lat,
		Lng:      lng,
	}, nil
}