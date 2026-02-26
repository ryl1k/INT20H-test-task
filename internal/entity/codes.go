package entity

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
