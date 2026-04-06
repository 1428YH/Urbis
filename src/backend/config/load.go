package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadKey() string {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	key := os.Getenv("API_KEY_YANDEX")
	return key
}