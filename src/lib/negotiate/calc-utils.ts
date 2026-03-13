import type { CalculatorOffer } from "@/types/negotiation";

// ---------------------------------------------------------------------------
// Cost of Living adjusters (relative to SF Bay Area = 1.0)
// ---------------------------------------------------------------------------

export const COL_ADJUSTMENTS: Record<string, number> = {
  "San Francisco": 1.0,
  "New York": 0.95,
  "Seattle": 0.88,
  "Los Angeles": 0.85,
  "Austin": 0.72,
  "Denver": 0.76,
  "Chicago": 0.74,
  "Boston": 0.88,
  "Miami": 0.78,
  "Portland": 0.78,
  "Remote (US)": 0.80,
  "London": 0.82,
  "Zurich": 1.10,
  "Singapore": 0.75,
};

export const LOCATIONS = Object.keys(COL_ADJUSTMENTS);

// ---------------------------------------------------------------------------
// Tax estimates (very rough, for comparison only)
// ---------------------------------------------------------------------------

function estimateEffectiveTaxRate(totalComp: number): number {
  if (totalComp > 700000) return 0.42;
  if (totalComp > 500000) return 0.39;
  if (totalComp > 350000) return 0.36;
  if (totalComp > 200000) return 0.33;
  return 0.28;
}

// ---------------------------------------------------------------------------
// Core calculations
// ---------------------------------------------------------------------------

export function calculateAnnualTC(offer: CalculatorOffer): number {
  const annualEquity = offer.vestingYears > 0 ? offer.equity / offer.vestingYears : 0;
  return offer.base + annualEquity + offer.bonus;
}

export function calculateYear1TC(offer: CalculatorOffer): number {
  const annualEquity = offer.vestingYears > 0 ? offer.equity / offer.vestingYears : 0;
  return offer.base + annualEquity + offer.bonus + offer.signOn;
}

export function calculateFourYearTC(offer: CalculatorOffer): number {
  return (offer.base + offer.bonus) * 4 + offer.equity + offer.signOn;
}

export function calculateNPV(offer: CalculatorOffer, discountRate: number = 0.08): number {
  let npv = 0;
  const annualEquity = offer.vestingYears > 0 ? offer.equity / offer.vestingYears : 0;

  for (let year = 0; year < 4; year++) {
    let yearComp = offer.base + annualEquity + offer.bonus;
    if (year === 0) yearComp += offer.signOn;
    npv += yearComp / Math.pow(1 + discountRate, year);
  }
  return Math.round(npv);
}

export function adjustForCOL(amount: number, location: string): number {
  const factor = COL_ADJUSTMENTS[location] ?? 0.80;
  // Convert to SF-equivalent purchasing power
  return Math.round(amount / factor);
}

export function calculateAfterTax(totalComp: number): number {
  const rate = estimateEffectiveTaxRate(totalComp);
  return Math.round(totalComp * (1 - rate));
}

// ---------------------------------------------------------------------------
// Comparison result
// ---------------------------------------------------------------------------

export interface OfferComparison {
  id: string;
  label: string;
  company: string;
  location: string;
  annualTC: number;
  year1TC: number;
  fourYearTC: number;
  npv: number;
  colAdjustedTC: number;
  afterTaxAnnual: number;
  yearByYear: number[];
}

export function compareOffers(offers: CalculatorOffer[]): OfferComparison[] {
  return offers.map((offer) => {
    const annualTC = calculateAnnualTC(offer);
    const year1TC = calculateYear1TC(offer);
    const fourYearTC = calculateFourYearTC(offer);
    const npv = calculateNPV(offer);
    const colAdjustedTC = adjustForCOL(annualTC, offer.location);
    const afterTaxAnnual = calculateAfterTax(annualTC);

    const annualEquity = offer.vestingYears > 0 ? offer.equity / offer.vestingYears : 0;
    const yearByYear = [0, 1, 2, 3].map((year) => {
      let comp = offer.base + annualEquity + offer.bonus;
      if (year === 0) comp += offer.signOn;
      return comp;
    });

    return {
      id: offer.id,
      label: offer.label,
      company: offer.company,
      location: offer.location,
      annualTC,
      year1TC,
      fourYearTC,
      npv,
      colAdjustedTC,
      afterTaxAnnual,
      yearByYear,
    };
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
