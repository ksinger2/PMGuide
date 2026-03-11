import { ComingSoon } from "@/components/ui/coming-soon";

export default function NegotiatePage() {
  return (
    <ComingSoon
      title="Negotiate"
      description="Prepare your compensation negotiation strategy with data-backed guidance."
      features={[
        "Salary benchmarks",
        "Negotiation scripts",
        "Counter-offer strategy",
      ]}
    />
  );
}
