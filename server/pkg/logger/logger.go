package logger

import (
	"os"
	"strings"
	"sync"
	"time"

	"github.com/rs/zerolog"
)

var once sync.Once

var log zerolog.Logger

func NewLogger(logLevel string) zerolog.Logger {
	once.Do(func() {
		zerolog.TimeFieldFormat = time.RFC3339Nano

		level := zerolog.InfoLevel
		if logLevel != "" {
			if l, err := zerolog.ParseLevel(strings.ToLower(logLevel)); err == nil {
				level = l
			}
		}

		log = zerolog.New(os.Stdout).
			Level(level).
			With().
			Timestamp().
			Logger()
	})

	return log
}
