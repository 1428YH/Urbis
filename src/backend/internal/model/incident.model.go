package model

type Incident struct {
	Title    string  `json:"title"`
	Lvl	     int 	 `json:"lvl"`
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`
	Color    string	 `json:"color"`	
	Status   bool    `json:"status"`
}

type IncidentRequest struct {
	Title    string  `json:"title"`
	Lvl      int     `json:"lvl"`
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`
}