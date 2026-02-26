package entity

import "time"

// could use decimal.Decimal for more precision
type OrderStatus string
type Order struct {
	Id        int     `json:"order"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`

	TotalAmount float64 `json:"total_amount"`
	TaxAmount   float64 `json:"tax_amount"`

	CompositeTaxRate float64          `json:"composite_tax_rate"`
	Breakdown        TaxRateBreakdown `json:"breakdown"`

	Jurisdictions []string `json:"jurisdictions"`
	ReportingCode string   `json:"reporting_code"`

	Status OrderStatus

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type TaxRateBreakdown struct {
	StateRate   float64 `json:"state_rate"`
	CountyRate  float64 `json:"county_rate"`
	CityRate    float64 `json:"city_rate"`
	SpecialRate float64 `json:"special_rate"`
}
