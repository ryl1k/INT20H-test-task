package middleware

type Middleware struct {
}

const apiKeyHeader = "x-api-key"

func NewMiddleware() *Middleware {
	return &Middleware{}
}
