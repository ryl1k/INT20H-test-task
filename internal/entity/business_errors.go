package entity

import "errors"

var (
	ErrMissingAPIKey                    = errors.New("api key is required")
	ErrUnauthorizedAccessToProvidedData = errors.New("unauthorized access to provided data")
	ErrBadRequest                       = errors.New("invalid request parameters or malformed body")
	ErrFileToLarge                      = errors.New("file is too large to be processed")
	ErrFileNotFound                     = errors.New("file not found")
	ErrInvalidFileFormat                = errors.New("unsupported file format")
)
