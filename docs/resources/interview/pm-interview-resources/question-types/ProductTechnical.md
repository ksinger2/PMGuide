# Technical Questions

## What This Tests
Ability to communicate around engineering concepts, understand technical tradeoffs, and work effectively with engineers — without needing to be an engineer.

**Note:** Technical rounds are not common unless the role is explicitly technical (e.g., Technical PM). Your recruiter will tell you if you'll face one. If unsure, ask.

---

## Three Common Types

### 1. System Design
Describe the high-level architecture of a product or system.

**PM approach:** Keep discussion product/UX focused. Don't go into deep engineering detail unless asked. Show you understand concepts like load balancers, caching, and CDNs by discussing their *user-facing implications*.

**Framework:**
1. Clarify scope — what part of the system? What scale?
2. Define core user flows
3. Identify key components (frontend, backend, database, APIs)
4. Discuss tradeoffs (e.g., SQL vs. NoSQL, monolith vs. microservices)
5. Address scaling concerns (load balancing, caching, CDN)
6. Tie technical decisions back to product goals

### 2. Explain a Technical Concept
Explain a technical concept to a non-technical audience.

**Approach:** Use analogies. Know your audience. Simplify without being condescending.

**Example:** "DNS is like a phone book for the internet. When you type a website name, DNS looks up the matching address so your browser knows where to go."

### 3. Technical Decision / Tradeoff
Walk through a technical decision you or your team made.

**Approach:** Mini case study format — problem, options considered, decision made, outcome, and what you'd do differently.

---

## Key Technical Concepts PMs Should Know

| Concept | What to Know |
|---------|-------------|
| API | How systems communicate; REST vs. GraphQL basics |
| Databases | SQL (relational) vs. NoSQL (flexible schema); when to use each |
| Load balancer | Distributes traffic across servers; prevents single point of failure |
| Caching | Stores frequently accessed data for faster retrieval (Redis, CDN) |
| CDN | Serves static content from servers close to the user; reduces latency |
| Microservices vs. monolith | Tradeoff between flexibility/scalability and simplicity |
| Authentication | OAuth, SSO, JWT — how users are verified |
| Machine learning basics | Training data, model, inference, fine-tuning, hallucination |
| Latency vs. throughput | Speed of single request vs. volume handled simultaneously |
| Version control | Git basics — branching, merging, PRs |

---

## AI/ML Specific Concepts (Important for Anthropic/OpenAI)

| Concept | What to Know |
|---------|-------------|
| LLM | Large Language Model — trained on text to predict/generate text |
| Hallucination | Model generates confident but incorrect information |
| Fine-tuning | Training a pre-trained model further on specific data |
| Prompt engineering | Crafting inputs to get better model outputs |
| RAG | Retrieval-Augmented Generation — grounding LLM with real-time data |
| RLHF | Reinforcement Learning from Human Feedback — how models are aligned |
| Inference | Running a trained model to generate outputs (vs. training) |
| Context window | How much text a model can "see" at once |
| Agentic AI | AI that can take multi-step actions autonomously |
| Safety / alignment | Ensuring AI behaves as intended; avoiding harmful outputs |

---

## Question Bank

### Classic Technical
- What happens when you type a URL into a browser?
- How do autonomous vehicles work?
- How would you design the architecture for Instagram's Home Feed?
- Design a URL shortener (like bit.ly)
- How does Google Docs handle collaborative real-time editing?

### AI/ML Specific (Anthropic, OpenAI)
- Define hallucinations in LLMs
- What are the ethical risks of deploying agentic AI in high-stakes environments?
- What are the risks of assuming LLMs think or feel like humans?
- How would you adapt a generative AI model to perform well in a specific domain?
- What's your approach to prompt engineering?
- How would you handle hallucinations in a generative AI model deployed to users?
- How would you explain a technical concept to a non-technical person?

---

## Rubric Signals to Hit
See `rubrics/Rubric.md` → Technical Rubric

Key signals:
- **Data literacy** — use data/evidence to support technical reasoning
- **Comfort with metrics** — know what to measure in technical systems
- **Clarifying questions** — understand the scope before diving in
- **Tradeoffs** — every technical decision has a cost
- **Software implementation** — show solid understanding of how software is built
- **Technical communication** — translate between PM-speak and engineering; could participate in a live technical discussion
