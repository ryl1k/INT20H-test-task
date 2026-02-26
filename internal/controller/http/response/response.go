package response

import (
	"github.com/ryl1k/NT20H-test-task-server/internal/entity"

	"github.com/labstack/echo/v4"
)

type Response struct {
	Metadata Metadata `json:"metadata"`
	Data     any      `json:"data,omitempty"`
}
type Metadata struct {
	HttpStatusCode int                 `json:"status_code"`
	Code           entity.ResponseCode `json:"code"`
	Message        string              `json:"message"`
}

func NewMetadata(code entity.ResponseCode, statusCode int, msg string) Metadata {
	return Metadata{Code: code, HttpStatusCode: statusCode, Message: msg}
}

func NewSuccessResponse(ctx echo.Context, data any, statusCode int) error {
	resp := &Response{
		Data: data,
		Metadata: Metadata{
			Code:           entity.SuccessCode,
			HttpStatusCode: statusCode,
		},
	}

	return ctx.JSON(statusCode, resp)
}

func NewErrorResponse(ctx echo.Context, err error) error {
	metadata := MapErrorToMetadata(err)

	resp := &Response{
		Metadata: metadata,
	}
	return ctx.JSON(resp.Metadata.HttpStatusCode, resp)
}
