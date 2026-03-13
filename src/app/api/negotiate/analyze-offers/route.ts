import { NextResponse } from "next/server";
import { callChat } from "@/lib/ai/client";
import { getModelForTask, TASK_OVERRIDES } from "@/lib/ai/models";
import type { CalculatorOffer } from "@/types/negotiation";
import { formatCurrency } from "@/lib/negotiate/calc-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { offers, comparisons } = body as {
      offers: CalculatorOffer[];
      comparisons: Array<{
        label: string;
        company: string;
        annualTC: number;
        year1TC: number;
        fourYearTC: number;
        npv: number;
        colAdjustedTC: number;
      }>;
    };

    if (!offers || offers.length < 2) {
      return NextResponse.json(
        { error: "At least 2 offers are required" },
        { status: 400 }
      );
    }

    const offerSummary = comparisons
      .map(
        (c) =>
          `${c.label} (${c.company || "Unknown"}): Annual TC ${formatCurrency(c.annualTC)}, Year 1 ${formatCurrency(c.year1TC)}, 4-Year ${formatCurrency(c.fourYearTC)}, NPV ${formatCurrency(c.npv)}, COL-adjusted ${formatCurrency(c.colAdjustedTC)}`
      )
      .join("\n");

    const offerDetails = offers
      .map(
        (o) =>
          `${o.label} (${o.company || "Unknown"}): Base ${formatCurrency(o.base)}, Equity ${formatCurrency(o.equity)} over ${o.vestingYears}yr, Sign-on ${formatCurrency(o.signOn)}, Bonus ${formatCurrency(o.bonus)}, Location: ${o.location}`
      )
      .join("\n");

    const systemPrompt = `You are a compensation analyst helping a PM compare job offers. Provide a concise, actionable analysis in 3-5 paragraphs. Focus on:
1. Which offer is better and WHY (considering total comp, equity risk, location, and 4-year trajectory)
2. Hidden factors they might be missing (vesting schedules, refreshers, tax implications)
3. Which components to negotiate and by how much
4. A clear recommendation

Be specific with dollar amounts. No generic advice.`;

    const userMessage = `Compare these offers:

${offerDetails}

Computed metrics:
${offerSummary}`;

    const task = "negotiate-analyze";
    const tier = getModelForTask(task);
    const overrides = TASK_OVERRIDES[task];

    const analysis = await callChat(
      [{ role: "user", content: userMessage }],
      tier,
      systemPrompt,
      overrides
    );

    return NextResponse.json({ data: { analysis } });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze offers";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
