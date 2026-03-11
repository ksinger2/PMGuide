# Analytical Questions

## What This Tests
Data literacy, comfort with metrics, ability to design/analyze experiments, diagnosis, prioritization.

---

## Two Main Types

### Type 1: Metrics Questions
Define, select, or analyze the right metrics for a product or feature.

**GAME Framework:**
- **G**oals — What is the company/product trying to achieve? Define mission and north star metric.
- **A**ctions — What actions do users take? Map out the user journey.
- **M**etrics — What metrics correspond to each action? Consider leading (predictive) and lagging (outcome) indicators.
- **E**valuations — Which metrics matter most? Prioritize by importance to goals.

**Metric Categories:**
- Acquisition: DAU, MAU, new users, sign-ups
- Engagement: sessions per user, time in app, feature adoption
- Retention: D1, D7, D30 retention rates
- Revenue: ARPU, LTV, conversion rate, subscription revenue
- Health: crash rate, latency, error rate

**North Star Metric Examples:**
- Facebook → DAU
- Airbnb → Nights booked
- Spotify → Time listening to music
- Netflix → Hours streamed per subscriber

---

### Type 2: A/B Testing Questions
Design or analyze an experiment.

**Framework for Designing an A/B Test:**
1. **Clarify goal** — What metric are you trying to improve?
2. **Define hypothesis** — Clearly state what you expect to happen and why
3. **Design the experiment:**
   - Define control (A) and treatment (B) groups
   - Determine what change to make
   - Decide what to measure (primary + secondary metrics)
   - Discuss sample size and test duration
4. **Analyze results** — Statistical significance, novelty effects, seasonality, network effects. Decide: ship, iterate, or abandon.

**Key Concepts to Know:**
- Statistical significance (p-value)
- Confidence interval
- Type I error (false positive) — incorrectly rejecting null hypothesis
- Type II error (false negative) — failing to detect a real effect
- Minimum Detectable Effect (MDE)
- Power of a test
- Novelty effect — early users behave differently from long-term users
- Network effects — one user's behavior affects others (breaks standard A/B assumptions)

**Common Pitfalls:**
- Not accounting for sample size (test needs enough users)
- Ignoring secondary metrics (optimizing one thing may break another)
- Not accounting for novelty effect
- Concluding before statistical significance is reached

---

## Question Bank

### Metrics Questions
- Pick the 3 key metrics for YouTube Analytics. Why?
- How would you determine success for Instagram Reels?
- What metrics would you use to measure success for Slack Connect?
- Build the core metric for Uber passenger pickup.
- What are the key metrics for LinkedIn Events?
- How would you measure the health of the Facebook News Feed?
- What would you pick as the north star metric for Claude? Why?

### A/B Testing Questions
- Devise an A/B test to improve user frustration with Google Maps.
- How would you A/B test a change to the Google homepage?
- Design an A/B test to evaluate a new Instagram Stories feature.
- How would you test whether to show Stories for 24 vs. 48 hours?

### Combined / Analytical
- Engagement on Facebook is down 10%. What would you do? (overlaps with Execution)
- How would you measure success for a new AI feature you just shipped?

---

## Rubric Signals to Hit
See `rubrics/Rubric.md` → Analytical Rubric

Key signals:
- **Data literacy** — reason with data, spot patterns, draw logical conclusions
- **Comfort with metrics** — pick the right metrics and justify your choices
- **Diagnosis** — probe before concluding
- **Prioritization** — not all metrics are equal; show you know which matter most
- **Execution** — translate analysis into a concrete action plan
- **Curiosity** — ask good questions; want to understand the full problem
- **Collaboration** — involve the interviewer; make it a dialogue
