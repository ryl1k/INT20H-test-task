package entity

import "errors"

var (
	ErrMissingAPIKey                       = errors.New("api key is required")
	ErrUnauthorizedAccessToProvidedData    = errors.New("unauthorized access to provided data")
	ErrTooManyRequests                     = errors.New("too many requests")
	ErrBadRequest                          = errors.New("invalid request parameters or malformed body")
	ErrFileToLarge                         = errors.New("file is too large to be processed")
	ErrFileNotFound                        = errors.New("file not found")
	ErrInvalidFileFormat                   = errors.New("unsupported file format")
	ErrInvalidOrEmptyPaginationQueryParams = errors.New("invalid or empty pagination query params")
	ErrOrderNotFound                       = errors.New("order not found")
)
