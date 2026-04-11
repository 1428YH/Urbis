package model

type Incident struct {
	ID       int
	Lvl	     int
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