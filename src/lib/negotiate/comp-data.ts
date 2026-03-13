import type { NegotiationCompany } from "@/types/negotiation";

export interface CompRange {
  level: string;
  base: [number, number];
  equity: [number, number];
  bonus: [number, number];
  signOn: [number, number];
  totalComp: [number, number];
  notes: string;
}

export interface CompanyCompData {
  name: string;
  equityType: "rsu" | "options" | "profit-interest";
  vestingSchedule: string;
  refresherPolicy: string;
  negotiationCulture: string;
  ranges: CompRange[];
}

export const COMP_DATA: Record<Exclude<NegotiationCompany, "any">, CompanyCompData> = {
  google: {
    name: "Google",
    equityType: "rsu",
    vestingSchedule: "4-year with 33/33/22/12 front-loaded vesting",
    refresherPolicy: "Annual refreshers based on performance, typically 15-25% of initial grant",
    negotiationCulture: "Structured but flexible. Comp team has authority. Recruiters can escalate.",
    ranges: [
      {
        level: "L6 (Senior PM)",
        base: [195000, 245000],
        equity: [100000, 200000],
        bonus: [30000, 55000],
        signOn: [0, 50000],
        totalComp: [380000, 500000],
        notes: "Base band is firm. Equity is the main lever.",
      },
      {
        level: "L7 (Staff/Principal PM)",
        base: [230000, 300000],
        equity: [200000, 400000],
        bonus: [50000, 80000],
        signOn: [0, 100000],
        totalComp: [500000, 750000],
        notes: "Significant equity upside. Sign-on for competing offers.",
      },
    ],
  },
  meta: {
    name: "Meta",
    equityType: "rsu",
    vestingSchedule: "4-year quarterly vesting, no cliff",
    refresherPolicy: "Annual refreshers, performance-based. Can be substantial at E6+.",
    negotiationCulture: "Data-driven. Will match competing offers with proof. Band-conscious.",
    ranges: [
      {
        level: "E6 (Staff PM)",
        base: [210000, 265000],
        equity: [80000, 150000],
        bonus: [0, 0],
        signOn: [0, 50000],
        totalComp: [350000, 450000],
        notes: "No annual bonus. Equity and base are primary levers.",
      },
      {
        level: "E7 (Senior Staff PM)",
        base: [250000, 320000],
        equity: [200000, 350000],
        bonus: [0, 0],
        signOn: [0, 100000],
        totalComp: [500000, 700000],
        notes: "Very competitive equity. Will match top competing offers.",
      },
    ],
  },
  amazon: {
    name: "Amazon",
    equityType: "rsu",
    vestingSchedule: "4-year back-loaded: 5/15/40/40",
    refresherPolicy: "Annual refreshers designed to smooth out back-loaded vesting",
    negotiationCulture: "Formulaic. Sign-on compensates for back-loaded vesting. Less flexible on base.",
    ranges: [
      {
        level: "L7 (Senior PM)",
        base: [185000, 210000],
        equity: [150000, 300000],
        bonus: [0, 0],
        signOn: [50000, 150000],
        totalComp: [515000, 680000],
        notes: "Base capped at ~$210K. Sign-on and equity are levers. Back-loaded vesting critical to understand.",
      },
    ],
  },
  netflix: {
    name: "Netflix",
    equityType: "options",
    vestingSchedule: "Monthly vesting, no cliff. Employee chooses salary/options split.",
    refresherPolicy: "N/A — employee chooses allocation annually",
    negotiationCulture: "Top-of-market philosophy. Less room to negotiate but starts high. Salary/options split is flexible.",
    ranges: [
      {
        level: "Senior PM",
        base: [350000, 500000],
        equity: [100000, 200000],
        bonus: [0, 0],
        signOn: [0, 0],
        totalComp: [450000, 700000],
        notes: "All-cash option available. No sign-on or bonus. Negotiate the top-line number and split.",
      },
    ],
  },
  anthropic: {
    name: "Anthropic",
    equityType: "profit-interest",
    vestingSchedule: "4-year with 1-year cliff, quarterly thereafter",
    refresherPolicy: "Performance-based refreshers, company still in high-growth phase",
    negotiationCulture: "Startup-ish but well-funded. Equity is the draw. Mission-driven candidates get premium.",
    ranges: [
      {
        level: "Senior PM",
        base: [200000, 260000],
        equity: [200000, 500000],
        bonus: [0, 30000],
        signOn: [0, 50000],
        totalComp: [400000, 700000],
        notes: "Equity value highly speculative but massive upside potential. Base competitive but not top-of-market.",
      },
    ],
  },
  openai: {
    name: "OpenAI",
    equityType: "profit-interest",
    vestingSchedule: "4-year with 1-year cliff",
    refresherPolicy: "Aggressive retention grants for top performers",
    negotiationCulture: "Hyper-competitive recruiting. Will pay top dollar. Equity is the key differentiator.",
    ranges: [
      {
        level: "Senior PM",
        base: [250000, 350000],
        equity: [300000, 800000],
        bonus: [0, 50000],
        signOn: [0, 100000],
        totalComp: [550000, 1000000],
        notes: "Retention packages can reach $400K-$1.5M. Equity valuation changes rapidly.",
      },
    ],
  },
  roblox: {
    name: "Roblox",
    equityType: "rsu",
    vestingSchedule: "4-year with 1-year cliff, quarterly thereafter",
    refresherPolicy: "Annual refreshers, competitive for retention",
    negotiationCulture: "Competitive but structured. Gaming/metaverse expertise commands premium.",
    ranges: [
      {
        level: "Senior PM",
        base: [200000, 260000],
        equity: [100000, 250000],
        bonus: [20000, 50000],
        signOn: [0, 50000],
        totalComp: [350000, 550000],
        notes: "90th percentile TC ~$731K. Domain expertise in UGC/gaming is a lever.",
      },
    ],
  },
  apple: {
    name: "Apple",
    equityType: "rsu",
    vestingSchedule: "4-year with 1-year cliff, semi-annual thereafter",
    refresherPolicy: "Annual refreshers, typically modest compared to initial grant",
    negotiationCulture: "Secretive and structured. Less flexibility than peers. Brand premium assumed.",
    ranges: [
      {
        level: "Senior PM (ICT5)",
        base: [200000, 260000],
        equity: [100000, 250000],
        bonus: [20000, 50000],
        signOn: [0, 75000],
        totalComp: [350000, 550000],
        notes: "Apple assumes brand value offsets lower comp. Push back on this framing.",
      },
    ],
  },
  microsoft: {
    name: "Microsoft",
    equityType: "rsu",
    vestingSchedule: "4-year with annual vesting (25% per year)",
    refresherPolicy: "Annual refreshers based on performance review, generous at L67+",
    negotiationCulture: "Systematic and fair. Band-based. Willing to go to top of band with competing offer.",
    ranges: [
      {
        level: "L67 (Senior PM)",
        base: [185000, 230000],
        equity: [100000, 200000],
        bonus: [30000, 60000],
        signOn: [0, 50000],
        totalComp: [350000, 500000],
        notes: "Strong benefits package. Negotiate base + equity within band. Sign-on for competing offers.",
      },
      {
        level: "L68 (Principal PM)",
        base: [220000, 280000],
        equity: [200000, 400000],
        bonus: [50000, 100000],
        signOn: [0, 100000],
        totalComp: [500000, 750000],
        notes: "Significant jump from L67. Performance bonus can be substantial.",
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getCompanyData(company: NegotiationCompany): CompanyCompData | null {
  if (company === "any") return null;
  return COMP_DATA[company] ?? null;
}

export function getCompRange(company: NegotiationCompany, level?: string): CompRange | null {
  const data = getCompanyData(company);
  if (!data) return null;
  if (level) {
    return data.ranges.find((r) => r.level.toLowerCase().includes(level.toLowerCase())) ?? data.ranges[0];
  }
  return data.ranges[0];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompRange(range: [number, number]): string {
  return `${formatCurrency(range[0])} - ${formatCurrency(range[1])}`;
}
