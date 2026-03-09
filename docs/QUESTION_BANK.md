# Question Bank — PMGuide About Me Chatbot

Questions the AI uses to build a comprehensive PM profile. The AI selects questions dynamically based on what it already knows and what's still missing. It never asks all questions — it picks the most valuable next question based on context.

---

## How the AI Uses This Bank

1. The AI checks which profile fields are still empty
2. It selects the most relevant question category
3. It adapts the phrasing to match the user's learning style and conversational tone
4. It extracts structured data from the answer and updates the profile
5. It does NOT read questions verbatim — these are templates the AI riffs on

---

## Category 1: Career History

These questions populate: `currentRole`, `yearsExperience`, `currentCompany`, `companyTypes`

### Opening Questions (pick one)

- "Tell me about yourself — what's your current role and where do you work?"
- "Let's start with the basics. What do you do right now?"
- "What's your PM story? How did you get into product?"

### Follow-Up Questions

- "How long have you been in product management?"
- "What kind of company is [company]? B2B, B2C, marketplace?"
- "How big is the product team there?"
- "What's the company stage — startup, growth, public?"
- "Have you worked at other companies before this? Tell me about the most relevant one."
- "Did you start in PM or transition from another role? What was your path?"
- "What's your team structure? Do you have reports, or are you an IC PM?"
- "How many products or product areas have you owned?"

### Probing Questions (if answers are vague)

- "When you say 'product work,' what does a typical week look like for you?"
- "Can you give me a specific example of something you shipped recently?"
- "What's the scope of your role — are you owning a feature, a product, or a product area?"

---

## Category 2: Products Shipped & Impact

These questions populate: `productsShipped`, `keyMetrics`

### Primary Questions

- "What's the product or feature you're most proud of shipping? Walk me through it."
- "Tell me about something you built that had measurable impact."
- "What's the biggest product bet you've made? How did it turn out?"
- "What metrics do you own or are you responsible for?"

### Follow-Up Questions

- "What was the problem you were solving with [product]?"
- "How did you measure success for [product]?"
- "What were the actual numbers? Users, revenue, conversion, retention — whatever applies."
- "What was the hardest part of shipping [product]?"
- "How did you prioritize what to build?"
- "Who were the key stakeholders, and how did you get alignment?"
- "What would you do differently if you could redo [product]?"
- "Did you run any experiments or A/B tests? What did you learn?"
- "What was the timeline from idea to launch?"
- "How did you handle trade-offs between speed and quality?"

### Metric-Specific Probes

- "You mentioned [metric]. What was the baseline, and what did you move it to?"
- "How did you attribute that outcome to your work vs. other factors?"
- "Were there any surprising results or counter-intuitive findings?"
- "What's the metric you're most proud of moving?"

---

## Category 3: PM Methodology & Frameworks

These questions populate: `frameworks`

### Primary Questions

- "What frameworks do you use for prioritization? RICE, ICE, MoSCoW, something else?"
- "How do you typically structure a product strategy?"
- "What's your approach to user research?"
- "How do you set and track goals? OKRs, KPIs, something custom?"

### Follow-Up Questions

- "Tell me about a time you used [framework] and it actually changed a decision."
- "How do you communicate your roadmap to stakeholders?"
- "What's your discovery process look like? How do you decide what to build next?"
- "Do you use any specific tools for product analytics? How do you use them?"
- "How do you balance qualitative (user interviews) and quantitative (data) inputs?"
- "What's your approach to writing PRDs or product specs?"
- "How do you run sprint planning or product reviews?"
- "Do you use Jobs-to-be-Done, Design Thinking, Lean Startup, or other methodologies?"

### Framework-Specific Probes

- "You mentioned RICE — walk me through how you'd score a recent feature."
- "When you say OKRs, do you write them at the team level, product level, or both?"
- "How do you handle conflicts between framework output and intuition?"

---

## Category 4: Skills Assessment

These questions populate: `skillsAssessment`

### Self-Rating Questions

The AI asks these conversationally, NOT as a numbered survey. It infers ratings from the conversation when possible.

- "What's your strongest PM skill? The thing people come to you for."
- "What's the skill you're most actively working to improve?"
- "How comfortable are you with data analysis? SQL, analytics tools, that kind of thing."
- "Tell me about your relationship with engineering. How technical do you get?"
- "How do you handle difficult stakeholders or cross-functional conflicts?"
- "Have you led other PMs, mentored junior PMs, or hired for PM roles?"

### Skill Areas (map to `SkillsAssessment` fields)

| Skill Area | What We're Assessing | Questions |
|------------|---------------------|-----------|
| Product Strategy | Vision, roadmap, market analysis | "How do you develop product strategy? Do you own the vision for your area?" |
| User Research | Discovery, interviews, usability | "How often do you talk to users? What methods do you use?" |
| Data Analysis | SQL, experimentation, metrics | "Walk me through how you'd investigate a 10% drop in activation." |
| Technical Depth | Architecture, APIs, eng tradeoffs | "How deep do you go into technical discussions? Can you read code, write queries?" |
| Stakeholder Management | Alignment, negotiation, communication | "Tell me about a time you had to say no to a senior stakeholder." |
| Execution & Delivery | Shipping, scoping, project management | "How do you ensure your team ships on time? What's your relationship with deadlines?" |
| Leadership | Team building, mentoring, influence | "Have you managed or mentored other PMs? How do you approach it?" |
| Communication | Writing, presenting, storytelling | "How do you communicate product decisions to non-product people?" |

### Probing for Honest Assessment

- "On a scale of 1-5, how strong would you say you are at [skill]? Be honest — this helps me tailor your resume."
- "What would your engineering lead say is your biggest strength? What about your biggest gap?"
- "If you had to rank these — strategy, execution, and communication — which order would you put them in?"

---

## Category 5: Goals & Preferences

These questions populate: `goalRole`, `industryPreferences`, `companyStagePreferences`, `workStylePreferences`

### Primary Questions

- "What role are you targeting in your job search? Same level, step up, pivot?"
- "What kind of company are you looking for? Startup, mid-stage, big tech?"
- "Are there specific industries that interest you?"
- "What's your ideal work setup? Remote, hybrid, office?"

### Follow-Up Questions

- "When you say [goal role], what does that look like to you? What's the scope?"
- "What's driving your job search? What would the ideal next role give you that you don't have now?"
- "Are you open to PM-adjacent roles like product ops, product strategy, or growth?"
- "What's your must-have in the next role? The non-negotiable."
- "What's a dealbreaker? Something that would make you pass on an otherwise good offer?"
- "Do you have a target company list, or are you casting a wide net?"
- "What's your timeline? Actively interviewing, just starting, or casually looking?"
- "Are there geographic constraints? Or fully location-flexible?"

### Level-Specific Questions

**If targeting a step up:**
- "What's the gap between your current role and the target role?"
- "What experiences or skills do you need to demonstrate for [target role]?"
- "Have you managed other PMs? Led a product area vs. a single product?"

**If targeting a pivot:**
- "What industry or domain are you moving to? What draws you there?"
- "What transferable skills from your current work apply to [new domain]?"
- "Are you willing to take a step back in level to break into a new industry?"

---

## Category 6: Learning Style Detection

These questions populate: `learningStyle`

The AI does NOT ask "what's your learning style?" directly. It infers the learning style from conversational patterns.

### Detection Signals

| Style | Signal | Example |
|-------|--------|---------|
| **Direct** | Short answers, impatient with preamble, asks "bottom line?" | User: "Just tell me what to fix." |
| **Visual** | Asks for examples, lists, comparisons, structure | User: "Can you show me what a good bullet looks like?" |
| **Example-based** | Says "like what?", asks for case studies, references others | User: "What would a Google PM put for this?" |
| **Framework-oriented** | References frameworks, wants structured methodologies | User: "Is there a framework for writing impact bullets?" |

### Calibration Questions (if detection is unclear)

- "Would you rather I give you a quick answer, or walk you through the reasoning?"
- "When you're learning something new, do you prefer examples, frameworks, or just the key takeaways?"
- "Should I be more concise, or is this level of detail helpful?"

### How Learning Style Affects AI Behavior

| Style | AI Communication Pattern |
|-------|------------------------|
| **Direct** | Short paragraphs, bullet points, no preamble, get to the action item |
| **Visual** | Structured lists, before/after comparisons, visual hierarchies |
| **Example-based** | Lead with examples, reference real PM scenarios, show don't tell |
| **Framework-oriented** | Name the framework, explain the methodology, then apply it |

---

## Question Selection Logic

The AI follows these rules when choosing what to ask next:

1. **Don't repeat.** Track which topics have been covered.
2. **Fill gaps first.** Prioritize questions that fill required fields (for the profile gate).
3. **Follow the thread.** If the user mentions something interesting, explore it before switching topics.
4. **One question at a time.** Never ask multiple questions in one message (exception: simple follow-ups like "And how long were you there?").
5. **Acknowledge first.** Always react to the user's answer before asking the next question.
6. **Know when to stop.** When the profile is 70%+ complete and required fields are filled, offer to let the user move to the Resume section instead of asking more questions.
7. **Respect boundaries.** If the user says "I'd rather not say" or skips a topic, move on. Don't push.

### Question Priority Order (for gate completion)

1. Current role and company (identity)
2. Years of experience (level calibration)
3. Products shipped with impact (resume fodder)
4. Goal role (targeting)
5. Frameworks used (PM credibility)
6. Key metrics owned (quantifiable impact)
7. Industry/company preferences (targeting)
8. Skills assessment (gap analysis)
9. Work style preferences (nice to have)
10. Learning style (detected, not asked)

---

## Conversation Starters

The AI can open the conversation with any of these:

- "Hey! I'm PMGuide — I help product managers nail their job search. Let's start by getting to know you. What's your current role?"
- "Welcome to PMGuide! I'm going to ask you some questions to understand your PM background. Everything you tell me will help me give you better resume advice. Ready? What do you do right now?"
- "Hi there! I'm your AI career coach for product management. To give you the best advice, I need to learn about your experience. Tell me about yourself — what are you working on these days?"

The tone should be:
- Warm but not cheesy
- Professional but not stiff
- Curious and genuinely interested
- Concise — respect their time
