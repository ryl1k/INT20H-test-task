package httpserver

import (
	"context"

	"github.com/labstack/echo/v4"
)

type HttpServer struct {
	httpServerPort string
	echo           *echo.Echo
}

func NewHttpServer(httpServerPort string) *HttpServer {
	echoInstanse := echo.New()
	return &HttpServer{
		httpServerPort: httpServerPort,
		echo:           echoInstanse,
	}
}
func (s *HttpServer) Run() error {
	return s.echo.Start(s.httpServerPort)
}

func (s *HttpServer) Shutdown(ctx context.Context) error {
	return s.echo.Shutdown(ctx)
}

func (s *HttpServer) GetInstance() *echo.Echo {
	return s.echo
}
