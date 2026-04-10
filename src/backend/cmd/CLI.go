package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"urbis/src/backend/internal/model"
	"urbis/src/backend/utilities"
)

func main() {
	reader := bufio.NewReader(os.Stdin)

	fmt.Println("Введите заголовок:")
	title, _ := reader.ReadString('\n')
	title = strings.TrimSpace(title)

	fmt.Println("Введите категорию:")
	category, _ := reader.ReadString('\n')
	category = strings.TrimSpace(category)

	fmt.Println("Введите долготу (0.000):")
	lng, _ := reader.ReadString('\n')
	lng = strings.TrimSpace(lng)
	lngFloat, err := strconv.ParseFloat(lng, 64)
	if err != nil {
		log.Printf("ERROR_PARSING_FLOAT")
		return
	}

	fmt.Println("Введите широту (0.000):")
	lat, _ := reader.ReadString('\n')
	lat = strings.TrimSpace(lat)
	latFloat, err := strconv.ParseFloat(lat, 64)
	if err != nil {
		log.Printf("ERROR_PARSING_FLOAT")
		return
	}

	inc, err := model.CreateIncidentRequest(
		title,
		category,
		latFloat,
		lngFloat,
	)
	if err != nil {
		log.Printf("ERROR_CREATE_INCIDENT")
		return
	}

	payload := utilities.ParseJSON(*inc)
	if payload == nil {
		log.Printf("ERROR_GET_JSON")
		return
	}

	fmt.Println(string(payload))
}