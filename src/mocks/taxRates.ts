interface TaxJurisdiction {
  county: string;
  city: string;
  state_rate: number;
  county_rate: number;
  city_rate: number;
  special_rates: number;
  special_districts: string[];
}

const NY_STATE_RATE = 0.04;

const jurisdictions: TaxJurisdiction[] = [
  { county: "New York", city: "New York City", state_rate: NY_STATE_RATE, county_rate: 0.045, city_rate: 0, special_rates: 0.00375, special_districts: ["MCTD"] },
  { county: "Kings", city: "New York City", state_rate: NY_STATE_RATE, county_rate: 0.045, city_rate: 0, special_rates: 0.00375, special_districts: ["MCTD"] },
  { county: "Queens", city: "New York City", state_rate: NY_STATE_RATE, county_rate: 0.045, city_rate: 0, special_rates: 0.00375, special_districts: ["MCTD"] },
  { county: "Bronx", city: "New York City", state_rate: NY_STATE_RATE, county_rate: 0.045, city_rate: 0, special_rates: 0.00375, special_districts: ["MCTD"] },
  { county: "Richmond", city: "New York City", state_rate: NY_STATE_RATE, county_rate: 0.045, city_rate: 0, special_rates: 0.00375, special_districts: ["MCTD"] },
  { county: "Nassau", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04625, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Suffolk", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04625, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Westchester", city: "", state_rate: NY_STATE_RATE, county_rate: 0.0375, city_rate: 0, special_rates: 0.005, special_districts: ["MCTD"] },
  { county: "Rockland", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0.00375, special_districts: ["MCTD"] },
  { county: "Orange", city: "", state_rate: NY_STATE_RATE, county_rate: 0.0375, city_rate: 0, special_rates: 0.00375, special_districts: ["MCTD"] },
  { county: "Dutchess", city: "", state_rate: NY_STATE_RATE, county_rate: 0.0375, city_rate: 0, special_rates: 0.00375, special_districts: ["MCTD"] },
  { county: "Putnam", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0.00375, special_districts: ["MCTD"] },
  { county: "Erie", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Monroe", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Onondaga", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Albany", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Oneida", city: "", state_rate: NY_STATE_RATE, county_rate: 0.0375, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Niagara", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Saratoga", city: "", state_rate: NY_STATE_RATE, county_rate: 0.03, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Broome", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Schenectady", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Ulster", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Rensselaer", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Sullivan", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Tompkins", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
];

interface CountyBounds {
  county: string;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}

const countyBounds: CountyBounds[] = [
  { county: "New York", latMin: 40.700, latMax: 40.882, lonMin: -74.020, lonMax: -73.907 },
  { county: "Kings", latMin: 40.570, latMax: 40.700, lonMin: -74.042, lonMax: -73.833 },
  { county: "Queens", latMin: 40.541, latMax: 40.812, lonMin: -73.907, lonMax: -73.700 },
  { county: "Bronx", latMin: 40.785, latMax: 40.917, lonMin: -73.934, lonMax: -73.748 },
  { county: "Richmond", latMin: 40.496, latMax: 40.651, lonMin: -74.255, lonMax: -74.052 },
  { county: "Nassau", latMin: 40.540, latMax: 40.920, lonMin: -73.700, lonMax: -73.420 },
  { county: "Suffolk", latMin: 40.600, latMax: 41.170, lonMin: -73.420, lonMax: -71.850 },
  { county: "Westchester", latMin: 40.880, latMax: 41.370, lonMin: -73.984, lonMax: -73.483 },
  { county: "Rockland", latMin: 41.042, latMax: 41.368, lonMin: -74.230, lonMax: -73.890 },
  { county: "Orange", latMin: 41.150, latMax: 41.550, lonMin: -74.770, lonMax: -74.080 },
  { county: "Dutchess", latMin: 41.370, latMax: 41.880, lonMin: -74.000, lonMax: -73.480 },
  { county: "Putnam", latMin: 41.200, latMax: 41.520, lonMin: -73.980, lonMax: -73.530 },
  { county: "Erie", latMin: 42.460, latMax: 43.120, lonMin: -79.060, lonMax: -78.460 },
  { county: "Monroe", latMin: 43.000, latMax: 43.370, lonMin: -77.980, lonMax: -77.370 },
  { county: "Onondaga", latMin: 42.770, latMax: 43.230, lonMin: -76.410, lonMax: -75.950 },
  { county: "Albany", latMin: 42.400, latMax: 42.810, lonMin: -74.270, lonMax: -73.680 },
  { county: "Oneida", latMin: 42.910, latMax: 43.580, lonMin: -75.870, lonMax: -75.070 },
  { county: "Niagara", latMin: 43.040, latMax: 43.370, lonMin: -79.070, lonMax: -78.460 },
  { county: "Saratoga", latMin: 42.770, latMax: 43.260, lonMin: -74.140, lonMax: -73.570 },
  { county: "Broome", latMin: 42.000, latMax: 42.420, lonMin: -76.120, lonMax: -75.360 },
  { county: "Schenectady", latMin: 42.700, latMax: 42.920, lonMin: -74.260, lonMax: -73.830 },
  { county: "Ulster", latMin: 41.580, latMax: 42.080, lonMin: -74.760, lonMax: -73.950 },
  { county: "Rensselaer", latMin: 42.460, latMax: 42.840, lonMin: -73.680, lonMax: -73.280 },
  { county: "Sullivan", latMin: 41.580, latMax: 42.000, lonMin: -75.140, lonMax: -74.340 },
  { county: "Tompkins", latMin: 42.260, latMax: 42.630, lonMin: -76.700, lonMax: -76.240 },
];

export function lookupJurisdiction(lat: number, lon: number): TaxJurisdiction {
  for (const bounds of countyBounds) {
    if (lat >= bounds.latMin && lat <= bounds.latMax && lon >= bounds.lonMin && lon <= bounds.lonMax) {
      const jurisdiction = jurisdictions.find((j) => j.county === bounds.county);
      if (jurisdiction) return jurisdiction;
    }
  }
  return {
    county: "Other",
    city: "",
    state_rate: NY_STATE_RATE,
    county_rate: 0.04,
    city_rate: 0,
    special_rates: 0,
    special_districts: []
  };
}

export function calculateTax(lat: number, lon: number, subtotal: number) {
  const jurisdiction = lookupJurisdiction(lat, lon);
  const composite_tax_rate =
    jurisdiction.state_rate + jurisdiction.county_rate + jurisdiction.city_rate + jurisdiction.special_rates;
  const tax_amount = Math.round(subtotal * composite_tax_rate * 100) / 100;
  const total_amount = Math.round((subtotal + tax_amount) * 100) / 100;

  return {
    composite_tax_rate,
    tax_amount,
    total_amount,
    breakdown: {
      state_rate: jurisdiction.state_rate,
      county_rate: jurisdiction.county_rate,
      city_rate: jurisdiction.city_rate,
      special_rates: jurisdiction.special_rates
    },
    jurisdictions: {
      state: "New York",
      county: jurisdiction.county,
      city: jurisdiction.city,
      special_districts: jurisdiction.special_districts
    }
  };
}
