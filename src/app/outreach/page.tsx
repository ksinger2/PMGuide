"use client";

import { SectionHeader } from "@/components/layout/section-header";
import { GatedPage } from "@/components/layout/gated-page";
import { OutreachHome } from "@/components/outreach/outreach-home";
import { OutreachSetup } from "@/components/outreach/outreach-setup";
import { OutreachActive } from "@/components/outreach/outreach-active";
import { useOutreach } from "@/hooks/use-outreach";

export default function OutreachPage() {
  const {
    state,
    selectAudience,
    startDraft,
    setMessages,
    resumeDraft,
    deleteDraft,
    goHome,
  } = useOutreach();

  const activeDraft = state.drafts.find((d) => d.id === state.activeDraftId);

  return (
    <GatedPage>
      <div data-testid="outreach-page">
        <SectionHeader
          title="Outreach"
          description="Craft compelling emails and LinkedIn messages for hiring managers, recruiters, and referrals"
        />

        {state.screen === "home" && (
          <OutreachHome
            drafts={state.drafts}
            onSelectAudience={selectAudience}
            onResumeDraft={resumeDraft}
            onDeleteDraft={deleteDraft}
          />
        )}

        {state.screen === "setup" && state.audienceType && (
          <OutreachSetup
            audienceType={state.audienceType}
            onStart={startDraft}
            onBack={goHome}
          />
        )}

        {state.screen === "active" && activeDraft && (
          <OutreachActive
            draftId={activeDraft.id}
            context={activeDraft.context}
            messages={activeDraft.messages}
            onSetMessages={setMessages}
            onBack={goHome}
          />
        )}
      </div>
    </GatedPage>
  );
}
