export interface Framework {
  id: string;
  name: string;
  category: string;
  icon: string;
  summary: string;
  content: string;
  examples?: string[];
}

export const FRAMEWORK_CATEGORIES = [
  { id: "tactics", label: "Negotiation Tactics", icon: "🎯" },
  { id: "comp", label: "Comp Structure", icon: "💰" },
  { id: "psychology", label: "Psychology", icon: "🧠" },
  { id: "mistakes", label: "Anti-Patterns", icon: "🚫" },
  { id: "emails", label: "Email Templates", icon: "✉️" },
  { id: "process", label: "Process", icon: "📋" },
];

export const FRAMEWORKS: Framework[] = [
  // Tactics
  {
    id: "mirroring",
    name: "Mirroring (Chris Voss)",
    category: "tactics",
    icon: "🪞",
    summary: "Repeat the last 1-3 critical words they said. Forces them to elaborate and reveal information.",
    content: `**How it works:** Repeat the last 1-3 words of what the recruiter just said, as a question or statement. This triggers the instinct to elaborate.

**Example:**
Recruiter: "The offer is at the top of our band."
You: "The top of your band?"
Recruiter: "Well, it's near the top. There might be some room on the equity side..."

**Why it works:** People feel heard and unconsciously share more. It buys you time to think while extracting information.

**When to use:** Any time the recruiter says something you want them to explain further, especially around limits, bands, or "final" statements.`,
    examples: [
      '"The top of your band?"',
      '"Limited flexibility?"',
      '"The standard package?"',
    ],
  },
  {
    id: "labeling",
    name: "Labeling (Chris Voss)",
    category: "tactics",
    icon: "🏷️",
    summary: "Name the emotion or dynamic in the room. Diffuses tension and builds rapport.",
    content: `**How it works:** Identify what the other side is feeling or thinking, then label it: "It seems like...", "It sounds like...", "It looks like..."

**Example:**
"It seems like you're constrained by the band structure, and I appreciate you being transparent about that. What if we looked at this from the equity side?"

**Why it works:** Labeling negative emotions diminishes them. Labeling positive dynamics reinforces them. It shows empathy without conceding.

**When to use:** When the recruiter expresses frustration, gives a hard no, or when you want to acknowledge their position before pivoting.`,
    examples: [
      '"It seems like the comp team has put you in a tough spot."',
      '"It sounds like equity is where you have more flexibility."',
      '"It feels like we\'re really close to making this work."',
    ],
  },
  {
    id: "calibrated-questions",
    name: "Calibrated Questions",
    category: "tactics",
    icon: "❓",
    summary: "Ask 'How' and 'What' questions that make the other side solve your problems.",
    content: `**How it works:** Instead of demands or closed questions, ask open-ended "How" and "What" questions that guide the recruiter to solve the problem for you.

**Key questions for negotiation:**
- "How can we bridge the gap between the offer and my expectations?"
- "What would it take to get to [target number]?"
- "How does the comp team think about exceptions to the band?"
- "What flexibility exists on the equity side?"
- "How do you typically handle situations where a candidate has competing offers?"

**Why it works:** These questions are impossible to answer with "no." They force the recruiter into problem-solving mode and make them feel in control while you're actually steering.`,
    examples: [
      '"What would it take to get the equity component to $X?"',
      '"How can we make this work for both sides?"',
      '"What does the approval process look like for above-band offers?"',
    ],
  },
  {
    id: "ackerman",
    name: "Ackerman Bargaining Model",
    category: "tactics",
    icon: "📊",
    summary: "Structured counter-offer sequence: 65% → 85% → 95% → 100% of your target.",
    content: `**The model:**
1. Set your target (what you actually want)
2. Start at 65% of your target
3. Counter at 85%
4. Counter at 95%
5. Final offer at 100% with a non-monetary sweetener

**PM Negotiation Example:**
Target total comp: $500K

Round 1 (65%): "Based on my research, I was expecting something closer to $325K base" (anchors low)
Round 2 (85%): "I appreciate the movement. Given the equity component, I think $425K total comp is more aligned"
Round 3 (95%): "We're getting close. Could we look at $475K with the sign-on?"
Round 4 (100%): "If we can get to $500K total, I'd be ready to sign today. I'm also flexible on start date."

**Why it works:** Each concession gets smaller, signaling you're approaching your limit. The non-monetary final sweetener shows good faith.`,
  },
  {
    id: "component-separation",
    name: "Component Separation",
    category: "tactics",
    icon: "🧩",
    summary: "Never negotiate 'total comp.' Break into base, equity, sign-on, bonus, and negotiate each independently.",
    content: `**The principle:** Companies have different budgets and flexibility for each comp component. By separating them, you can max out each one.

**Components to negotiate independently:**
1. **Base salary** — Usually the hardest to move. Tied to bands.
2. **Equity/RSUs** — Often the most flexible. Can be adjusted with approval.
3. **Sign-on bonus** — One-time cost for the company. Easy to approve.
4. **Annual bonus** — Usually percentage-based. Hard to change.
5. **Title/level** — Affects ALL future comp. Worth fighting for.
6. **Start date** — Leverage for sign-on or equity acceleration.
7. **Refresher grants** — Often overlooked. Can add $100K+ over 4 years.

**How to use it:**
"I understand the base is at band maximum. Could we look at the equity component separately? And what about the sign-on — is that negotiable independent of the base?"`,
  },

  // Comp Structure
  {
    id: "rsu-vs-options",
    name: "RSUs vs Options vs Profit Interest",
    category: "comp",
    icon: "📈",
    summary: "Understanding equity types is critical for comparing offers across companies.",
    content: `**RSUs (Restricted Stock Units)**
- You receive actual shares that vest over time
- Value = share price at vesting. No strike price.
- Most common at public companies (Google, Meta, Amazon, Microsoft)
- Taxed as ordinary income at vesting

**Stock Options (ISOs/NSOs)**
- Right to buy shares at a fixed "strike" price
- Value = share price - strike price at exercise
- Common at Netflix (options), some startups
- ISOs have tax advantages but AMT implications

**Profit Interest Units**
- Share of future profit growth (not current value)
- Common at pre-IPO companies (Anthropic, OpenAI)
- Value depends entirely on future liquidity event
- Can be worth $0 or millions

**For negotiation:**
- RSU value is the most predictable — use current share price
- Options require estimating future stock price — higher risk/reward
- Profit interest is the most speculative — discount heavily in comparisons
- Always ask about vesting schedules, cliffs, and acceleration clauses`,
  },
  {
    id: "vesting-schedules",
    name: "Vesting Schedules Explained",
    category: "comp",
    icon: "📅",
    summary: "Vesting structures vary widely and dramatically affect year-1 comp.",
    content: `**Standard (Google, Microsoft, Apple, Roblox):**
4-year vesting with 1-year cliff
- Year 1: 0% until cliff, then 25%
- Years 2-4: Quarterly or monthly vesting

**Front-loaded (Google RSUs):**
33% / 33% / 22% / 12%
- Much more in years 1-2
- Important: Year 3-4 comp drops unless refreshers compensate

**Back-loaded (Amazon):**
5% / 15% / 40% / 40%
- Year 1-2 comp is LOW
- Sign-on bonus compensates for years 1-2
- Must understand this or Amazon offers look deceivingly low

**No cliff (Meta, Netflix):**
Quarterly from day 1
- Better liquidity
- Lower risk if you leave early

**Negotiation tip:** When comparing offers, calculate Year 1 and Year 4 comp separately. The difference can be $100K+.`,
  },
  {
    id: "refreshers",
    name: "Refresher Grants Matter",
    category: "comp",
    icon: "🔄",
    summary: "Initial equity grant is only part of the picture. Refreshers can double your equity over 4 years.",
    content: `**What are refreshers?**
Additional equity grants given annually (usually tied to performance reviews). They vest over 4 years ON TOP of your initial grant.

**Why they matter:**
A $200K initial RSU grant with 25% annual vesting = $50K/year from initial grant
But if you get $80K in refreshers each year:
- Year 1: $50K (initial only)
- Year 2: $50K + $20K = $70K
- Year 3: $50K + $20K + $20K = $90K
- Year 4: $50K + $20K + $20K + $20K = $110K

**Companies known for generous refreshers:**
- Google: 15-25% of initial grant annually
- Meta: Performance-based, can be very large at E6+
- Microsoft: Moderate but consistent

**Negotiation tip:** Ask the recruiter "What's the typical refresher grant at this level?" If they won't share, that's information too — it might mean refreshers are small.`,
  },

  // Psychology
  {
    id: "anchoring",
    name: "Anchoring Effect",
    category: "psychology",
    icon: "⚓",
    summary: "The first number spoken becomes the reference point. Make sure it's YOUR number.",
    content: `**The principle:** Whichever number is stated first becomes the anchor that all subsequent negotiation revolves around. This is why recruiters ask "What are your salary expectations?" — they want YOU to anchor low.

**Defense strategies:**
1. Never state a number first if you can avoid it
2. If forced, anchor HIGH — it's easier to come down than go up
3. Reframe: "I'd rather understand the full comp package before discussing specific numbers"
4. Redirect: "What's the range for this role at this level?"
5. If they insist: "Based on my research and experience, I'd expect total comp in the $X-$Y range" (set X at your true target)

**Counter-anchoring:**
If they anchor first with a low number:
- Don't react. Silence is powerful.
- Then: "I appreciate you sharing that. Based on market data, I was expecting something closer to [your anchor]"
- Never say "that's too low" — instead, reframe around data`,
  },
  {
    id: "power-of-no",
    name: "The Power of No",
    category: "psychology",
    icon: "🛑",
    summary: "\"No\" is not the end — it's the beginning. Let people say no to feel in control.",
    content: `**Chris Voss insight:** People need to feel in control. Letting them say "no" gives them that feeling, and paradoxically makes them more open to your actual request.

**Instead of:** "Can you increase the equity by $50K?"
**Ask:** "Would it be unreasonable to look at the equity component?" (invites "no, that's not unreasonable")

**Instead of:** "Is that your final offer?"
**Ask:** "Have you given up on making this work?" (invites "no, we haven't given up")

**The "no" sequence for negotiation:**
1. Get them to say "no" to a ridiculous extreme: "Are you saying this offer is non-negotiable?"
2. They say "no" — which means it IS negotiable
3. Now ask: "Great, so what aspects do have flexibility?"
4. They've committed to flexibility and must follow through`,
  },

  // Anti-Patterns
  {
    id: "mistakes-overview",
    name: "6 Mistakes That Cost $100K+",
    category: "mistakes",
    icon: "💸",
    summary: "Critical negotiation anti-patterns that PM candidates make repeatedly.",
    content: `**1. Accepting the first offer**
NEVER do this. Even "final" offers have room. You leave $20K-$100K on the table.

**2. Negotiating total comp instead of components**
"Can you increase the total to $500K?" gives them flexibility to manipulate the split. Instead, negotiate base, equity, and sign-on separately.

**3. Revealing your current salary**
In many states, it's illegal for them to ask. Never volunteer it. If pressed: "I'd prefer to focus on what this role pays in the current market."

**4. Using ultimatums**
"If you can't do $X, I'm walking" closes doors. Instead: "How can we bridge this gap?" keeps them problem-solving.

**5. Negotiating via email only**
Email lacks emotional feedback. Use email to CONFIRM, but negotiate on the phone where you can mirror, label, and calibrate.

**6. Ignoring equity details**
$300K in RSUs with 4-year back-loaded vesting (Amazon) is NOT the same as $300K with quarterly vesting (Meta). Always ask about vesting schedule, cliff, refreshers, and acceleration.`,
  },

  // Emails
  {
    id: "counter-offer-email",
    name: "Counter-Offer Email Template",
    category: "emails",
    icon: "📧",
    summary: "A professional, specific counter-offer email that maintains rapport.",
    content: `**Subject: [Your Name] - Offer Discussion Follow-up**

Hi [Recruiter Name],

Thank you for the offer — I'm genuinely excited about the opportunity to join [Company] as [Role]. The team, the mission, and the scope of the role are exactly what I'm looking for.

After reviewing the full compensation package, I'd love to discuss a few elements:

**Base salary:** Based on my research of market rates for [Level] PMs and my [X years] of experience leading [relevant achievement], I was hoping to see the base closer to $[target]. I understand there may be band constraints, so I'm open to discussing how we might bridge any gap.

**Equity:** The current equity offer of $[amount] over 4 years is a good start. Given [competing offer / market data / specific skill], would there be flexibility to increase the initial grant to $[target]?

**Sign-on bonus:** I noticed the offer doesn't include a sign-on bonus. Given [forfeited equity / relocation / timing], a sign-on of $[target] would help bridge the transition.

I want to emphasize — I'm enthusiastic about this role and I'd love to make this work. These adjustments would help me move forward confidently.

Happy to jump on a call to discuss in more detail. What does your schedule look like this week?

Best,
[Your Name]`,
  },
  {
    id: "buy-time-email",
    name: "Buy Time Email Template",
    category: "emails",
    icon: "⏰",
    summary: "Professionally extend a deadline without losing the offer.",
    content: `**Subject: Re: [Company] Offer - Timeline Request**

Hi [Recruiter Name],

Thank you again for the offer — I'm very excited about the role and the team.

I want to give this the careful consideration it deserves. I'm currently in the final stages with [one other opportunity / evaluating a few things], and I want to make sure I can fully commit with confidence.

Would it be possible to extend the decision timeline to [specific date, typically 1-2 weeks]? I want to be respectful of your process while making sure I can make the best decision for both of us.

I'm happy to share where I am in my thinking, and I want to reiterate my strong interest in [Company]. This isn't about stalling — it's about making a thoughtful decision.

Thank you for understanding,
[Your Name]

---

**Key principles:**
- Always give a SPECIFIC date (not "a few more days")
- Reaffirm your interest
- Be honest about why without revealing too much
- Frame it as being respectful of THEIR process too`,
  },
  {
    id: "competing-offer-email",
    name: "Competing Offer Email Template",
    category: "emails",
    icon: "🏁",
    summary: "Leverage a competing offer without being aggressive or dishonest.",
    content: `**Subject: [Your Name] - Offer Update**

Hi [Recruiter Name],

I wanted to share an update that's relevant to our discussions. I've received a competing offer from [Company B] that I'm also excited about.

While [Company A] remains my strong preference because of [specific reason: team, mission, role scope], the competing offer is at $[total comp] with [notable terms: equity structure, level, etc.].

I don't want to use this as leverage — I genuinely want to find a way to make [Company A] work. But I want to be transparent about where things stand so we can have an honest conversation about the path forward.

Is there flexibility to revisit the [specific component: equity, base, sign-on] to help close the gap? I'm confident that with a few adjustments, we can make this work.

Happy to discuss on a call whenever is convenient.

Best,
[Your Name]

---

**Rules:**
- Never fabricate a competing offer (recruiters talk to each other)
- Be specific enough to be credible but don't overshare details
- Lead with preference for this company
- Frame as transparency, not ultimatum`,
  },

  // Process
  {
    id: "negotiation-timeline",
    name: "Negotiation Process Timeline",
    category: "process",
    icon: "🗓️",
    summary: "Understanding the recruiter's timeline and approval process gives you leverage.",
    content: `**Typical negotiation timeline:**

**Day 0:** Verbal offer received
- DO: Express enthusiasm but don't accept
- DO: Ask for written offer with full details
- DON'T: Give an immediate answer

**Day 1-2:** Review and research
- Calculate total comp (Year 1 and Year 4)
- Research market rates (Levels.fyi, Glassdoor, Blind)
- Identify your BATNA
- Prepare your counter with specific numbers

**Day 3-5:** Counter-offer
- Call (preferred) or email your counter
- Negotiate components separately
- Use Ackerman model for multiple rounds

**Day 5-10:** Negotiation rounds
- Expect 2-3 rounds maximum
- Each round: smaller concessions from both sides
- Recruiter may need to "check with comp team" — this is often real

**Day 10-14:** Final decision
- Get the final offer in writing
- Review ALL terms (clawbacks, non-competes, IP assignment)
- If satisfied, accept verbally then sign

**Pro tip:** The end of quarter/month and team headcount deadlines create urgency for the company, not you. Ask: "When does the team need someone in the role?" to understand their timeline.`,
  },
  {
    id: "batna-creation",
    name: "Creating BATNA Without Competing Offers",
    category: "process",
    icon: "🎲",
    summary: "You don't need a competing offer to have leverage. Here's how to create alternatives.",
    content: `**BATNA = Best Alternative To Negotiated Agreement**

You DON'T need a competing offer. You need the PERCEPTION that you have alternatives.

**Strategies:**

1. **Internal promotion path**
"I'm also exploring an expanded role at my current company that would come with a promotion."

2. **Consulting/advisory**
"I've been approached about some advisory opportunities that are quite lucrative."

3. **Market positioning**
"I'm in active conversations with a few companies" (even if just initial screens)

4. **Willingness to wait**
"I'm being very selective about my next move. I'd rather stay where I am than make the wrong decision."

5. **The walk-away**
Sometimes the best BATNA is genuinely being willing to walk away. Companies can tell when you're desperate vs. genuinely evaluating.

**What NOT to do:**
- Don't fabricate specific offers
- Don't name-drop companies you're not actually talking to
- Don't bluff about deadlines you don't have

**The strongest BATNA:**
Being genuinely happy at your current company. If you don't NEED to move, you negotiate from strength.`,
  },
];

export function getFrameworksByCategory(category: string): Framework[] {
  return FRAMEWORKS.filter((f) => f.category === category);
}
