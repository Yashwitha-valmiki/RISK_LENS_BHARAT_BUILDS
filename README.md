# RiskLens

RiskLens is a universal document-risk intelligence platform that analyzes documents from different fields—including internship and employment agreements, banking and loan documents, rental agreements, insurance documents, and other contracts.

## Current local demo

The local demo accepts pasted document text and displays:
- Risk score from 0 to 100
- Safe, low, moderate, high, and critical labels
- Green, light-green, yellow, orange, and red risk colors
- Document type detection
- Confidence score
- Red flags
- Plain-language consequences
- Recommended actions
- Questions to ask
- Obligations
- AI disclaimer

## Run locally

From the repository root:

```bash
npm install
npm --workspace services/api run dev
npm --workspace apps/web run dev -- --port 3001
