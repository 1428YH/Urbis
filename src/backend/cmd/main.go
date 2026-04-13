package main

import (
	"fmt"
	"log"
	"net/http"
	"urbis/src/backend/internal/handler"
	"urbis/src/backend/internal/middleware"
)

func main() {
	http.HandleFunc("/create", middleware.MethodOnly(http.MethodPost, handler.HandlerCreateIncident))

	fmt.Println("Starting HTTP server!")
	err := http.ListenAndServe(":9091", nil)
	if err != nil {
		log.Printf("Error starting the server: %v", err)
	}
}