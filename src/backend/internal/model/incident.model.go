package model

import "time"

type Incident struct {
	ID        int     `json:"id"`
	Title     string  `json:"title"`
	Lvl       int     `json:"lvl"`
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Color     string  `json:"color"`
	Status    bool    `json:"status"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type IncidentRequest struct {
	Title string  `json:"title"`
	Lvl   int     `json:"lvl"`
	Lat   float64 `json:"lat"`
	Lng   float64 `json:"lng"`
}