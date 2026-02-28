export interface TaxJurisdiction {
  county: string;
  city: string;
  state_rate: number;
  county_rate: number;
  city_rate: number;
  special_rates: number;
  special_districts: string[];
}

const NY_STATE_RATE = 0.04;

export const jurisdictions: TaxJurisdiction[] = [
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
  { county: "Allegany", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Cattaraugus", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Cayuga", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Chautauqua", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Chemung", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Chenango", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Clinton", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Columbia", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Cortland", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Delaware", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Essex", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Franklin", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Fulton", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Genesee", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Greene", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Hamilton", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Herkimer", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Jefferson", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Lewis", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Livingston", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Madison", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Montgomery", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Ontario", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Orleans", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Oswego", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Otsego", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Schoharie", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Schuyler", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Seneca", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "St. Lawrence", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Steuben", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Tioga", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Warren", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Washington", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Wayne", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Wyoming", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
  { county: "Yates", city: "", state_rate: NY_STATE_RATE, county_rate: 0.04, city_rate: 0, special_rates: 0, special_districts: [] },
];

export interface CountyBounds {
  county: string;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}

export const countyBounds: CountyBounds[] = [
  { county: "New York", latMin: 40.700, latMax: 40.800, lonMin: -74.020, lonMax: -73.934 },
  { county: "Kings", latMin: 40.570, latMax: 40.700, lonMin: -74.042, lonMax: -73.907 },
  { county: "Queens", latMin: 40.541, latMax: 40.785, lonMin: -73.907, lonMax: -73.700 },
  { county: "Bronx", latMin: 40.800, latMax: 40.880, lonMin: -73.934, lonMax: -73.748 },
  { county: "Richmond", latMin: 40.496, latMax: 40.651, lonMin: -74.255, lonMax: -74.052 },
  { county: "Nassau", latMin: 40.540, latMax: 40.880, lonMin: -73.700, lonMax: -73.420 },
  { county: "Suffolk", latMin: 40.600, latMax: 41.170, lonMin: -73.420, lonMax: -71.850 },
  { county: "Westchester", latMin: 40.880, latMax: 41.200, lonMin: -73.984, lonMax: -73.483 },
  { county: "Rockland", latMin: 41.042, latMax: 41.150, lonMin: -74.230, lonMax: -73.984 },
  { county: "Orange", latMin: 41.150, latMax: 41.550, lonMin: -74.770, lonMax: -74.080 },
  { county: "Dutchess", latMin: 41.370, latMax: 41.880, lonMin: -74.000, lonMax: -73.480 },
  { county: "Putnam", latMin: 41.200, latMax: 41.370, lonMin: -73.980, lonMax: -73.530 },
  { county: "Erie", latMin: 42.460, latMax: 43.040, lonMin: -79.060, lonMax: -78.460 },
  { county: "Monroe", latMin: 43.000, latMax: 43.370, lonMin: -77.980, lonMax: -77.370 },
  { county: "Onondaga", latMin: 42.770, latMax: 43.230, lonMin: -76.410, lonMax: -75.950 },
  { county: "Albany", latMin: 42.400, latMax: 42.750, lonMin: -74.270, lonMax: -73.680 },
  { county: "Oneida", latMin: 42.910, latMax: 43.580, lonMin: -75.870, lonMax: -75.070 },
  { county: "Niagara", latMin: 43.040, latMax: 43.370, lonMin: -79.070, lonMax: -78.460 },
  { county: "Saratoga", latMin: 42.920, latMax: 43.260, lonMin: -74.140, lonMax: -73.570 },
  { county: "Broome", latMin: 42.000, latMax: 42.420, lonMin: -76.120, lonMax: -75.360 },
  { county: "Schenectady", latMin: 42.750, latMax: 42.920, lonMin: -74.260, lonMax: -73.830 },
  { county: "Ulster", latMin: 41.580, latMax: 42.080, lonMin: -74.500, lonMax: -74.000 },
  { county: "Rensselaer", latMin: 42.460, latMax: 42.840, lonMin: -73.680, lonMax: -73.280 },
  { county: "Sullivan", latMin: 41.580, latMax: 42.000, lonMin: -75.140, lonMax: -74.500 },
  { county: "Tompkins", latMin: 42.260, latMax: 42.630, lonMin: -76.700, lonMax: -76.240 },
  { county: "Allegany", latMin: 42.000, latMax: 42.460, lonMin: -78.300, lonMax: -77.700 },
  { county: "Cattaraugus", latMin: 42.000, latMax: 42.460, lonMin: -79.060, lonMax: -78.300 },
  { county: "Cayuga", latMin: 42.630, latMax: 43.370, lonMin: -76.700, lonMax: -76.410 },
  { county: "Chautauqua", latMin: 42.000, latMax: 42.530, lonMin: -79.780, lonMax: -79.060 },
  { county: "Chemung", latMin: 42.000, latMax: 42.240, lonMin: -76.950, lonMax: -76.400 },
  { county: "Chenango", latMin: 42.420, latMax: 42.770, lonMin: -75.950, lonMax: -75.360 },
  { county: "Clinton", latMin: 44.570, latMax: 45.020, lonMin: -74.140, lonMax: -73.280 },
  { county: "Columbia", latMin: 41.880, latMax: 42.400, lonMin: -73.820, lonMax: -73.280 },
  { county: "Cortland", latMin: 42.420, latMax: 42.770, lonMin: -76.240, lonMax: -75.950 },
  { county: "Delaware", latMin: 42.000, latMax: 42.420, lonMin: -75.360, lonMax: -74.700 },
  { county: "Essex", latMin: 43.650, latMax: 44.570, lonMin: -74.140, lonMax: -73.280 },
  { county: "Franklin", latMin: 44.170, latMax: 45.010, lonMin: -74.700, lonMax: -74.140 },
  { county: "Fulton", latMin: 42.920, latMax: 43.200, lonMin: -74.680, lonMax: -74.260 },
  { county: "Genesee", latMin: 42.830, latMax: 43.040, lonMin: -78.460, lonMax: -77.980 },
  { county: "Greene", latMin: 42.080, latMax: 42.400, lonMin: -74.500, lonMax: -73.820 },
  { county: "Hamilton", latMin: 43.200, latMax: 43.870, lonMin: -74.680, lonMax: -74.140 },
  { county: "Herkimer", latMin: 42.910, latMax: 43.580, lonMin: -75.070, lonMax: -74.680 },
  { county: "Jefferson", latMin: 43.580, latMax: 44.170, lonMin: -76.450, lonMax: -75.570 },
  { county: "Lewis", latMin: 43.580, latMax: 44.170, lonMin: -75.570, lonMax: -75.070 },
  { county: "Livingston", latMin: 42.470, latMax: 42.880, lonMin: -77.980, lonMax: -77.490 },
  { county: "Madison", latMin: 42.770, latMax: 42.910, lonMin: -75.950, lonMax: -75.360 },
  { county: "Montgomery", latMin: 42.750, latMax: 42.920, lonMin: -74.680, lonMax: -74.260 },
  { county: "Ontario", latMin: 42.630, latMax: 43.000, lonMin: -77.490, lonMax: -77.050 },
  { county: "Orleans", latMin: 43.040, latMax: 43.370, lonMin: -78.460, lonMax: -77.980 },
  { county: "Oswego", latMin: 43.230, latMax: 43.580, lonMin: -76.410, lonMax: -75.870 },
  { county: "Otsego", latMin: 42.420, latMax: 42.770, lonMin: -75.360, lonMax: -74.700 },
  { county: "Schoharie", latMin: 42.400, latMax: 42.750, lonMin: -74.700, lonMax: -74.270 },
  { county: "Schuyler", latMin: 42.240, latMax: 42.470, lonMin: -76.950, lonMax: -76.700 },
  { county: "Seneca", latMin: 42.730, latMax: 43.000, lonMin: -77.050, lonMax: -76.700 },
  { county: "St. Lawrence", latMin: 44.170, latMax: 44.990, lonMin: -75.800, lonMax: -74.700 },
  { county: "Steuben", latMin: 42.000, latMax: 42.470, lonMin: -77.700, lonMax: -76.950 },
  { county: "Tioga", latMin: 42.000, latMax: 42.260, lonMin: -76.400, lonMax: -76.120 },
  { county: "Warren", latMin: 43.260, latMax: 43.650, lonMin: -74.140, lonMax: -73.570 },
  { county: "Washington", latMin: 42.840, latMax: 43.650, lonMin: -73.570, lonMax: -73.240 },
  { county: "Wayne", latMin: 43.000, latMax: 43.370, lonMin: -77.370, lonMax: -76.700 },
  { county: "Wyoming", latMin: 42.460, latMax: 42.830, lonMin: -78.460, lonMax: -78.000 },
  { county: "Yates", latMin: 42.470, latMax: 42.730, lonMin: -77.050, lonMax: -76.700 },
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
      special_rate: jurisdiction.special_rates
    },
    jurisdictions: [
      "New York",
      ...(jurisdiction.county ? [`${jurisdiction.county} County`] : []),
      ...(jurisdiction.city ? [jurisdiction.city] : []),
      ...jurisdiction.special_districts
    ]
  };
}
