# Credisense: Explainable AI Lending Assistant

> Loan decisions you can understand.

Credisense is an AI-powered loan assistant for Indian customers. A user chats in English, Hindi or Hinglish, gets lender-wise offers in minutes, and, if a loan is declined, gets a **clear reason and a way forward** instead of a bare "rejected".

**Status:** 🚧 In development. This README describes the target design; see the [Roadmap](#roadmap) for what is done.

---

## The problem

Today a typical loan journey looks like this:

- Long forms with jargon, and many documents to upload
- A blurry photo is only discovered days later
- Rejection comes with no reason
- The customer cannot tell what to change, so they drop off

Credisense removes that friction with conversational onboarding, instant lender-wise eligibility, and explainable decisions.

## Core principle

| Component | Responsibility |
|---|---|
| **LLM** | Talks to the user, extracts data, explains results |
| **Rules engine (code)** | Decides approve / reject. Deterministic and auditable |
| **RAG** | Answers policy questions (fees, prepayment, documents) |
| **Vision / OCR** | Reads uploaded documents |

**The LLM never decides approval.** Lenders must be able to audit every decision, so eligibility comes from code driven by lender policy files. The LLM only explains the result.

## Example

Aman earns ₹10,000 per month and asks for a ₹2,00,000 loan.

```
EMI (36 months, 14%)  ≈ ₹6,835
FOIR                  = EMI / income ≈ 68%   (lenders typically allow 40-50%)
Decision              = Not eligible
Alternatives          = ₹1,00,000 for 36 months (EMI ≈ ₹3,418), a longer tenure, or a co-applicant
```

The assistant then explains this to Aman in simple Hindi or English. All numbers come from code, not from the LLM.

## Features (planned)

- Conversational loan application (English / Hindi / Hinglish)
- Multi-lender eligibility with configurable YAML policies
- Explainable rejections with alternatives
- RAG over lender policies with source citations
- Document reading with instant feedback (for example, "this photo is blurry, please retake")
- Loan status tracking (state machine)
- Human handoff when the AI is unsure
- Guardrails against prompt injection and approval pressure
- A measured evaluation suite

## Architecture

```
User (Web UI)
     │
     ▼
Frontend (React)
     │
     ▼
Backend (FastAPI) ───────────► Supabase (Postgres, Auth, Storage)
     │
     ├── Rules engine ─── lender policies (YAML)
     ├── Loan state machine
     │
     ▼
AI layer
     ├── LLM (Llama via OpenAI-compatible API)
     ├── Agent with tools (eligibility, EMI, policy search)
     ├── Extraction (chat to structured data)
     ├── RAG: embeddings (bge-m3) ──► Pinecone
     ├── Document reading (vision / OCR)
     └── Guardrails
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind, shadcn/ui |
| Backend | FastAPI (Python), Pydantic, pytest |
| Database / Auth | Supabase (PostgreSQL, Row Level Security) |
| LLM | Llama through an OpenAI-compatible API (model is swappable by config) |
| Embeddings | BAAI/bge-m3 (multilingual) |
| Vector DB | Pinecone |
| CI | GitHub Actions |

## Project structure

```
credisense-ai/
├── frontend/     # Web app (pages, components, API client)
├── backend/      # FastAPI app, rules engine, state machine, tests
├── ai/           # LLM wrapper, agent, RAG, extraction, guardrails, evaluation
├── supabase/     # SQL migrations and seed data
├── data/         # Sample policy documents (lender_a/b/c, rbi, common)
├── docs/         # Architecture, API contract, screenshots
├── scripts/      # Helper scripts
└── .github/      # CI workflows
```

## What is real vs simulated

| Part | Status |
|---|---|
| Eligibility, EMI, FOIR, alternatives | Real (rules engine) |
| Chat, extraction, explanations | Real (LLM) |
| Policy Q&A | Real (RAG) |
| Document reading | Real (vision / OCR) |
| KYC (Aadhaar / PAN verification) | **Simulated** |
| E-sign, e-mandate | **Simulated** |
| Loan disbursal | **Simulated** |
| Lender policies | **Sample / fictional** |

This project does not connect to any real bank, NBFC or payment system. Lenders A, B and C are made up, and their policies are examples. No real customer data is used, and Aadhaar and PAN values are always masked.

## Evaluation (planned)

| What is measured | How |
|---|---|
| Loan decision correctness | Labelled test cases (target: 100%, since it is code) |
| Extraction accuracy | Messages in English / Hindi / Hinglish |
| Tool-calling accuracy | Correct tool and arguments |
| RAG retrieval hit-rate | Questions with a known correct chunk |
| Groundedness | Includes questions whose answer is **not** in the policy |
| Safety | Prompt-injection and approval-pressure prompts |
| Latency and cost | Per conversation |

Results will be published in `docs/evaluation_report.md` once the suite is run.

## Getting started

> Setup steps will be filled in as each part is built.

```bash
# Clone
git clone https://github.com/anuragshrikhandkar/credisense-ai.git
cd credisense-ai
```

Configuration lives in a `.env` file (never committed). A `.env.example` will list the required keys: Supabase, Pinecone and the LLM endpoint.

## Roadmap

- [x] Project structure
- [ ] Rules engine: EMI, FOIR, lender policies, tests
- [ ] Database schema and auth (Supabase)
- [ ] Loan state machine and audit log
- [ ] Chat API with extraction and agent tools
- [ ] RAG pipeline over sample policies
- [ ] Frontend: chat, offers, EMI calculator, KFS and consent
- [ ] Document upload and reading
- [ ] Guardrails
- [ ] Evaluation suite and report
- [ ] Deployment and demo

## Disclaimer

This is a portfolio and learning project. It is not financial advice and not a real lending product. Policies and figures are illustrative.

## Author

Anurag Shrikhandkar

## License

MIT
