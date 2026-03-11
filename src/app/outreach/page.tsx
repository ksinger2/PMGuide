import { ComingSoon } from "@/components/ui/coming-soon";

export default function OutreachPage() {
  return (
    <ComingSoon
      title="Outreach"
      description="Craft compelling cold emails and LinkedIn messages tailored to your target companies."
      features={[
        "Cold email templates",
        "LinkedIn message builder",
        "Company research briefs",
      ]}
    />
  );
}
