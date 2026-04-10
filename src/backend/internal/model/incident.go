package model

import "fmt"

type Incident struct {
	ID       int
	lvl	     int
	Category string
	Lat      float64
	Lng      float64
	Color    string
	Status   bool
}

type IncidentRequest struct {
	Title    string  `json:"title"`
	Lvl      int     `json:"lvl"`
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`
}

func CreateIncidentRequest(
	title string,
	lvl int,
	lat float64,
	lng float64,
) (*IncidentRequest, error) {
	if title == "" {
		return nil, fmt.Errorf("ERROR_TITLE_EMPTY")
	}

	if lvl < 1 || lvl > 3 {
		return nil, fmt.Errorf("ERROR_LVL_INVALID")
	}

	if lat < -90.0 || lat > 90.0 {
		return nil, fmt.Errorf("ERROR_LAT_INVALID")
	}
	if lng < -180.0 || lng > 180.0 {
		return nil, fmt.Errorf("ERROR_LNG_INVALID")
	}

	return &IncidentRequest{
		Title:    title,
		Lvl: 	  lvl,
		Lat:      lat,
		Lng:      lng,
	}, nil
}