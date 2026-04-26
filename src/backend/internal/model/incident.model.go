package model

import "time"

type Incident struct {
	ID        int      `json:"id"`
	Title     string   `json:"title"`
	Description string `json:"description"`
	Lvl       int      `json:"lvl"`
	Lat       float64  `json:"lat"`
	Lng       float64  `json:"lng"`
	ImageURL  string   `json:"image_url"`
	Color     string   `json:"color"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	Reason string      `json:"reason"`
}

type IncidentRequest struct {
	Title string  `json:"title"`
	Description string `json:"description"`
	Lvl   int     `json:"lvl"`
	Lat   float64 `json:"lat"`
	Lng   float64 `json:"lng"`
	ImageURL string `json:"image_url"`
}