package config

import (
	"log"
	"os"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	JWTExpiry  string
}

func New() *Config {
	cfg := &Config{
		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     os.Getenv("DB_PORT"),
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),
		JWTSecret:  os.Getenv("JWT_SECRET"),
		JWTExpiry:  os.Getenv("JWT_DURATION"),
	}

	log.Printf("Database configuration: host=%s, port=%s, user=%s, dbname=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBName)

	return cfg
} 