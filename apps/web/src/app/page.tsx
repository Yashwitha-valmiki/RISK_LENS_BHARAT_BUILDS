"use client";

import { useMemo, useState } from "react";

type RiskBand = "SAFE" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

const colors: Record<RiskBand, string> = {
  SAFE: "#16a34a",
  LOW: "#22c55e",
  MODERATE: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#dc2626"
};

export default function HomePage() {
  const [text, setText] = useState(
    "This internship agreement includes a 12-month lock-in period. The candidate must pay a registration fee before joining. If the candidate leaves early, a penalty will apply. The notice period is 60 days."
  );
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

      const response = await fetch(`${apiBase}/documents/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          role: "general",
          language: "en"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analysis failed.");
      }

      setResult(data);
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not connect to the API. Make sure the API is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const riskBand = useMemo<RiskBand>(() => {
    const score = Number(result?.decision?.overallRiskScore || 0);

    if (score <= 20) return "SAFE";
    if (score <= 40) return "LOW";
    if (score <= 60) return "MODERATE";
    if (score <= 80) return "HIGH";
    return "CRITICAL";
  }, [result]);

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 24,
        minHeight: "100vh"
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "inline-block",
            background: "#111827",
            color: "white",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700
          }}
        >
          RISKLENS
        </div>

        <h1 style={{ marginBottom: 8 }}>
          Understand a document before it creates a problem.
        </h1>

        <p style={{ color: "#4b5563", maxWidth: 800 }}>
          Analyze internship, employment, banking, loan, rental, insurance,
          freelance, education, and other documents in plain language.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 20
          }}
        >
          <h2>Paste your document</h2>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={17}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #d1d5db",
              fontSize: 15,
              lineHeight: 1.5
            }}
          />

          <button
            onClick={analyze}
            disabled={loading}
            style={{
              marginTop: 12,
              padding: "11px 18px",
              border: "none",
              borderRadius: 10,
              background: "#111827",
              color: "white",
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer"
            }}
          >
            {loading ? "Analyzing..." : "Analyze document"}
          </button>

          {error && (
            <p style={{ color: "#b91c1c", marginTop: 14 }}>{error}</p>
          )}
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 20
          }}
        >
          {!result ? (
            <p style={{ color: "#6b7280" }}>Your risk report will appear here.</p>
          ) : (
            <>
              <div
                style={{
                  display: "inline-block",
                  background: colors[riskBand],
                  color: "white",
                  padding: "8px 13px",
                  borderRadius: 999,
                  fontWeight: 700
                }}
              >
                {riskBand}
              </div>

              <h2 style={{ marginBottom: 4 }}>
                Risk score: {result?.decision?.overallRiskScore ?? 0}/100
              </h2>

              <p style={{ marginTop: 0, color: "#4b5563" }}>
                {result?.decision?.reason || "No reason was returned."}
              </p>

              <p>
                <strong>Document type:</strong>{" "}
                {result?.documentType || "general_agreement"}
              </p>

              <p>
                <strong>Confidence:</strong>{" "}
                {result?.decision?.confidenceScore ?? 0}/100
              </p>

              <h3>Top red flags</h3>
              {(result?.topRedFlags || []).map((flag: any, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: 12,
                    marginBottom: 10,
                    borderRadius: 10,
                    background: "#fef2f2",
                    borderLeft: "4px solid #dc2626"
                  }}
                >
                  <strong>{flag.title}</strong>
                  <p style={{ margin: "6px 0" }}>{flag.whatCanGoWrong}</p>
                  <small>
                    <strong>Action:</strong> {flag.whatToDoNow}
                  </small>
                </div>
              ))}

              <h3>What should you do now?</h3>
              <ul>
                {(result?.actionPlan?.immediate || []).map(
                  (item: string, index: number) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>

              <h3>Disclaimer</h3>
              <p style={{ color: "#4b5563" }}>
                {result?.disclaimer || "RiskLens provides AI-assisted risk insights."}
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
