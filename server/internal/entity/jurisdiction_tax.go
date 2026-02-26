package entity

type Juri struct {
	Ju map[string]JurisdictionTax `json:"jurisdictions"`
}
type JurisdictionTax struct {
	CompositeRate float64                  `json:"composite_rate"`
	Breakdown     JurisdictionTaxBreakdown `json:"breakdown"`
	Names         []string                 `json:"names"`
	Code          string                   `json:"code"`
}

type JurisdictionTaxBreakdown struct {
	State   float64 `json:"state"`
	County  float64 `json:"county"`
	City    float64 `json:"city"`
	Special float64 `json:"special"`
}
