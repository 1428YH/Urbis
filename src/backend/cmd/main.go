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

	pool, err := db.CreatePool(ctx)
	if err != nil {
		log.Fatalf("Cannot connect to DB: %v", err)
	}
	defer pool.Close()

	repo := repository.NewRepo(pool)

	http.HandleFunc("/create", middleware.MethodOnly(http.MethodPost, handler.HandlerCreateIncident(repo)))
	http.HandleFunc("/incidents", middleware.MethodOnly(http.MethodGet, handler.HandlerGetIncident(repo)))
	http.HandleFunc("PATCH /confirm/{id}", middleware.MethodOnly(http.MethodPatch, handler.ReviewHandler(repo)))
	http.HandleFunc("/upload", middleware.MethodOnly(http.MethodPost, handler.UploadImageHandler()))
	http.Handle("/uploaded_img/", http.StripPrefix("/uploaded_img/", http.FileServer(http.Dir("./uploaded_img"))))

	fmt.Println("Starting HTTP server!")
	err = http.ListenAndServe(":9091", nil)
	if err != nil {
		log.Printf("Error starting the server: %v", err)
	}
}
