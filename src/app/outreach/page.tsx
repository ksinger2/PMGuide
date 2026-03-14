"use client";

import { ComingSoon } from "@/components/ui/coming-soon";
import { GatedPage } from "@/components/layout/gated-page";

export default function OutreachPage() {
  return (
    <GatedPage locked>
      <ComingSoon
        title="Outreach"
        description="Craft compelling cold emails and LinkedIn messages tailored to your target companies."
        features={[
          "Cold email templates",
          "LinkedIn message builder",
          "Company research briefs",
        ]}
      />
    </GatedPage>
  );
}
