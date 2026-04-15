package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"urbis/src/backend/db"
	"urbis/src/backend/internal/handler"
	"urbis/src/backend/internal/middleware"
	"urbis/src/backend/internal/repository"
)

func main() {
	ctx := context.Background()

	conn, err := db.CreateConnection()
	if err != nil {
		log.Fatalf("Cannot connect to DB: %v", err)
	}
	defer conn.Close(ctx)

	repo := repository.NewRepo(conn)

	http.HandleFunc("/create", middleware.MethodOnly(http.MethodPost, handler.HandlerCreateIcident(repo)))

	fmt.Println("Starting HTTP server!")
	err = http.ListenAndServe(":9091", nil)
	if err != nil {
		log.Printf("Error starting the server: %v", err)
	}
}
