import { describe, it, expect } from "vitest";
import {
  calculateAnnualTC,
  calculateYear1TC,
  calculateFourYearTC,
  calculateNPV,
  adjustForCOL,
  calculateAfterTax,
  compareOffers,
  formatCurrency,
} from "@/lib/negotiate/calc-utils";
import type { CalculatorOffer } from "@/types/negotiation";

const googleOffer: CalculatorOffer = {
  id: "google-1",
  label: "Google",
  company: "Google",
  base: 220000,
  equity: 400000,
  vestingYears: 4,
  signOn: 50000,
  bonus: 40000,
  location: "San Francisco",
};

const metaOffer: CalculatorOffer = {
  id: "meta-1",
  label: "Meta",
  company: "Meta",
  base: 240000,
  equity: 350000,
  vestingYears: 4,
  signOn: 0,
  bonus: 0,
  location: "New York",
};

describe("calculateAnnualTC", () => {
  it("calculates base + annual equity + bonus", () => {
    const tc = calculateAnnualTC(googleOffer);
    // 220000 + 400000/4 + 40000 = 360000
    expect(tc).toBe(360000);
  });

  it("handles zero equity", () => {
    const offer: CalculatorOffer = { ...googleOffer, equity: 0, vestingYears: 4 };
    expect(calculateAnnualTC(offer)).toBe(260000); // 220000 + 0 + 40000
  });

  it("handles zero vesting years gracefully", () => {
    const offer: CalculatorOffer = { ...googleOffer, vestingYears: 0 };
    expect(calculateAnnualTC(offer)).toBe(260000); // 220000 + 0 + 40000
  });
});

describe("calculateYear1TC", () => {
  it("includes sign-on bonus in year 1", () => {
    const tc = calculateYear1TC(googleOffer);
    // 220000 + 100000 + 40000 + 50000 = 410000
    expect(tc).toBe(410000);
  });

  it("year 1 equals annual when no sign-on", () => {
    const tc = calculateYear1TC(metaOffer);
    // 240000 + 87500 + 0 + 0 = 327500
    expect(tc).toBe(327500);
  });
});

describe("calculateFourYearTC", () => {
  it("calculates total over 4 years", () => {
    const tc = calculateFourYearTC(googleOffer);
    // (220000 + 40000) * 4 + 400000 + 50000 = 1040000 + 400000 + 50000 = 1490000
    expect(tc).toBe(1490000);
  });
});

describe("calculateNPV", () => {
  it("discounts future cash flows", () => {
    const npv = calculateNPV(googleOffer, 0.08);
    // NPV should be less than 4-year total but more than 1-year
    expect(npv).toBeGreaterThan(calculateYear1TC(googleOffer));
    expect(npv).toBeLessThan(calculateFourYearTC(googleOffer));
  });

  it("NPV at 0% discount equals 4-year total", () => {
    const npv = calculateNPV(googleOffer, 0);
    expect(npv).toBe(calculateFourYearTC(googleOffer));
  });
});

describe("adjustForCOL", () => {
  it("SF stays the same (factor 1.0)", () => {
    expect(adjustForCOL(100000, "San Francisco")).toBe(100000);
  });

  it("Austin costs less — same salary buys more", () => {
    // Austin factor = 0.72, so $100K in Austin = $100K/0.72 ≈ $138,889 in SF purchasing power
    const adjusted = adjustForCOL(100000, "Austin");
    expect(adjusted).toBeGreaterThan(130000);
  });

  it("unknown location uses default 0.80", () => {
    const adjusted = adjustForCOL(100000, "Unknown City");
    expect(adjusted).toBe(125000); // 100000 / 0.80
  });
});

describe("calculateAfterTax", () => {
  it("applies higher rate for higher income", () => {
    const low = calculateAfterTax(250000);
    const high = calculateAfterTax(600000);
    // Higher income keeps smaller percentage
    expect(high / 600000).toBeLessThan(low / 250000);
  });
});

describe("compareOffers", () => {
  it("returns comparison for each offer", () => {
    const results = compareOffers([googleOffer, metaOffer]);
    expect(results).toHaveLength(2);
    expect(results[0].label).toBe("Google");
    expect(results[1].label).toBe("Meta");
  });

  it("includes yearByYear projections", () => {
    const results = compareOffers([googleOffer]);
    expect(results[0].yearByYear).toHaveLength(4);
    // Year 1 should include sign-on
    expect(results[0].yearByYear[0]).toBeGreaterThan(results[0].yearByYear[1]);
  });
});

describe("formatCurrency", () => {
  it("formats as USD with no decimals", () => {
    expect(formatCurrency(250000)).toBe("$250,000");
    expect(formatCurrency(1500000)).toBe("$1,500,000");
  });
});
