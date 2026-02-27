package config

import (
	"os"
	"time"

	"github.com/ryl1k/INT20H-test-task-server/internal/entity"

	"github.com/caarlos0/env/v11"
	"github.com/goccy/go-json"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

const (
	jurisdictionsFilePath = "jurisdictions.json"
	geoJsonFilePath       = "counties.geojson"
)

type Config struct {
	LogLevel       string `env:"LOG_LEVEL,required"`
	HttpServerPort string `env:"HTTP_SERVER_PORT"`

	PostgresConnectionURI string `env:"POSTGRES_CONNECTION_URI,required"`

	PostgresMaxConns int `env:"POSTGRES_MAX_CONNS,required"`

	PostgresMinConns        int           `env:"POSTGRES_MIN_CONNS,required"`
	PostgresMaxConnLifetime time.Duration `env:"POSTGRES_MAX_CONN_LIFETIME,required"`
	PostgresMaxConnIdleTime time.Duration `env:"POSTGRES_MAX_CONN_IDLE_TIME,required"`

	BatchOrderProcessingTimeout time.Duration `env:"BATCH_ORDER_PROCESSING_TIMEOUT,required"`
	OrdersBatchSize             int           `env:"ORDERS_BATCH_SIZE,required"`
	MaxFileSize                 int           `env:"MAX_FILE_SIZE,required"`
	ApiKey                      string        `env:"API_KEY,required"`

	TaxConfig *JurisdictionTaxConfig
	GeoJSON   *entity.GeoJSON
}

type JurisdictionTaxConfig struct {
	Jurisdictions map[string]entity.JurisdictionTax `json:"jurisdictions"`
}

func MustCreateConfig() *Config {
	godotenv.Load()
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		log.Fatal().Err(err).Msg("failed to load config")
	}

	if cfg.HttpServerPort == "" {
		cfg.HttpServerPort = os.Getenv("PORT")
	}

	if cfg.HttpServerPort == "" {
		log.Fatal().Msg("HTTP_SERVER_PORT or PORT is required")
	}

	if cfg.HttpServerPort[0] != ':' {
		cfg.HttpServerPort = ":" + cfg.HttpServerPort
	}

	jurisdictionBytes, err := os.ReadFile(jurisdictionsFilePath)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to read jurisdictions json file")
	}

	err = json.Unmarshal(jurisdictionBytes, &cfg.TaxConfig)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to unmarshal jurisdiction json file")
	}

	geoJsonBytes, err := os.ReadFile(geoJsonFilePath)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to read geojson file")
	}

	err = json.Unmarshal(geoJsonBytes, &cfg.GeoJSON)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to unmarshal geojson file")
	}

	return &cfg
}
