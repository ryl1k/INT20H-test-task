package response

import (
	"errors"
	"net/http"

	"github.com/ryl1k/INT20H-test-task-server/internal/entity"
)

var errorToMetadata = map[error]Metadata{
	entity.ErrBadRequest:                          NewMetadata(entity.BadRequestCode, http.StatusBadRequest, entity.ErrBadRequest.Error()),
	entity.ErrMissingAPIKey:                       NewMetadata(entity.UnauthorizedCode, http.StatusUnauthorized, entity.ErrMissingAPIKey.Error()),
	entity.ErrUnauthorizedAccessToProvidedData:    NewMetadata(entity.ForbiddenCode, http.StatusForbidden, entity.ErrUnauthorizedAccessToProvidedData.Error()),
	entity.ErrTooManyRequests:                     NewMetadata(entity.ForbiddenCode, http.StatusTooManyRequests, entity.ErrTooManyRequests.Error()),
	entity.ErrFileToLarge:                         NewMetadata(entity.FileIsToLarge, http.StatusRequestEntityTooLarge, entity.ErrFileToLarge.Error()),
	entity.ErrFileNotFound:                        NewMetadata(entity.NotFoundCode, http.StatusNotFound, entity.ErrFileNotFound.Error()),
	entity.ErrInvalidFileFormat:                   NewMetadata(entity.BadRequestCode, http.StatusBadRequest, entity.ErrInvalidFileFormat.Error()),
	entity.ErrInvalidOrEmptyPaginationQueryParams: NewMetadata(entity.BadRequestCode, http.StatusBadRequest, entity.ErrInvalidOrEmptyPaginationQueryParams.Error()),
	entity.ErrOrderNotFound:                       NewMetadata(entity.NotFoundCode, http.StatusNotFound, entity.ErrOrderNotFound.Error()),
}

func MapErrorToMetadata(err error) Metadata {
	if err == nil {
		return NewMetadata(entity.InternalErrorCode, http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	for e, metadata := range errorToMetadata {
		if errors.Is(err, e) {
			return metadata
		}
	}
	return NewMetadata(entity.InternalErrorCode, http.StatusInternalServerError, err.Error())
}
