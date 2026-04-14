package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func Load_env(e string) string {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	data := os.Getenv(e)
	return data
}