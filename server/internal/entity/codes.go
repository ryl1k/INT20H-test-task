// Package entity contains domain-level errors and response codes.
// These errors are used across the application to represent
// business and validation failures in a consistent way.
package entity

// ResponseCode represents a standardized application-level response code.
// These codes are used to map domain and infrastructure errors
// to API responses in a structured way.
type ResponseCode int

// provide error codes
// could be business errors e.g order not found or any infrastructure error
const (
	SuccessCode ResponseCode = iota + 1000
	BadRequestCode
	UnauthorizedCode
	FileIsToLarge
	ForbiddenCode
	NotFoundCode
	InternalErrorCode
)
