package response

import (
	"net/http"
	"testing"

	"github.com/ryl1k/INT20H-test-task-server/internal/entity"
)

func TestMapErrorToMetadata_HTTPStatuses(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		err        error
		statusCode int
	}{
		{name: "missing_api_key", err: entity.ErrMissingAPIKey, statusCode: http.StatusUnauthorized},
		{name: "invalid_api_key", err: entity.ErrUnauthorizedAccessToProvidedData, statusCode: http.StatusForbidden},
		{name: "too_many_requests", err: entity.ErrTooManyRequests, statusCode: http.StatusTooManyRequests},
		{name: "file_too_large", err: entity.ErrFileToLarge, statusCode: http.StatusRequestEntityTooLarge},
		{name: "file_not_found", err: entity.ErrFileNotFound, statusCode: http.StatusNotFound},
		{name: "order_not_found", err: entity.ErrOrderNotFound, statusCode: http.StatusNotFound},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := MapErrorToMetadata(tc.err)
			if got.HttpStatusCode != tc.statusCode {
				t.Fatalf("MapErrorToMetadata(%v) status=%d, want %d", tc.err, got.HttpStatusCode, tc.statusCode)
			}
		})
	}
}
