package main

import (
	"fmt"
	"log"
	"urbis/src/backend/internal/model"
	"urbis/src/backend/utilities"
)

func main() {
	title, _ := utilities.ReadInput("Введите заголовок:")
	if title == "" {
		log.Println("ERROR_READ_EMPTY")
		return //nil
	}

	lvl, err := utilities.ReadInt("Введите уровень 1-3:")
	if err != nil {
		log.Println("ERROR_READ_INT")
		return //nil
	}
	
	lng, err := utilities.ReadFloat("Введите долготу:")
	if err != nil {
		log.Println("ERROR_READ_FLOAT")
		return //nil
	}

	lat, err := utilities.ReadFloat("Введите широту:")
	if err != nil {
		log.Println("ERROR_READ_FLOAT")
		return //nil
	}

	inc, err := model.CreateIncidentRequest(
		title,
		lvl,
		lat,
		lng,
	)
	if err != nil {
		log.Printf("ERROR_CREATE_INCIDENT")
		return //nil
	}

	payload := utilities.ParseJSON(*inc)
	if payload == nil {
		log.Printf("ERROR_GET_JSON")
		return //nil
	}

	fmt.Println(string(payload))
}