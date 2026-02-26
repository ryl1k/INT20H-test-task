package response

import (
	"errors"
	"net/http"

	"github.com/ryl1k/NT20H-test-task-server/internal/entity"
)

var errorToMetadata = map[error]Metadata{
	entity.ErrBadRequest:                       NewMetadata(entity.BadRequestCode, http.StatusBadRequest, entity.ErrBadRequest.Error()),
	entity.ErrMissingAPIKey:                    NewMetadata(entity.UnauthorizedCode, http.StatusBadRequest, entity.ErrMissingAPIKey.Error()),
	entity.ErrUnauthorizedAccessToProvidedData: NewMetadata(entity.ForbiddenCode, http.StatusBadRequest, entity.ErrUnauthorizedAccessToProvidedData.Error()),
	entity.ErrFileToLarge:                      NewMetadata(entity.BadRequestCode, http.StatusRequestHeaderFieldsTooLarge, entity.ErrFileToLarge.Error()),
	entity.ErrFileNotFound:                     NewMetadata(entity.BadRequestCode, http.StatusBadRequest, entity.ErrFileNotFound.Error()),
	entity.ErrInvalidFileFormat:                NewMetadata(entity.BadRequestCode, http.StatusBadRequest, entity.ErrInvalidFileFormat.Error()),
}

func MapErrorToMetadata(err error) Metadata {
	for e, metadata := range errorToMetadata {
		if errors.Is(err, e) {
			return metadata
		}
	}
	return NewMetadata(entity.InternalErrorCode, http.StatusInternalServerError, err.Error())
}
