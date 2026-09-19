import {
  computeOverallRisk,
  mapRiskBand,
  type CategoryScores
} from "../scoring/scoreRisk.js";

export async function runAnalysisPipeline(params: {
  fullText: string;
  userRole?: string;
  outputLanguage?: string;
}) {
  const text = params.fullText.toLowerCase();

  const scores: CategoryScores = {
    FINANCIAL:
      text.includes("penalty") ||
      text.includes("fee") ||
      text.includes("charge")
        ? 78
        : 25,

    LEGAL_LIABILITY:
      text.includes("liable") ||
      text.includes("liability") ||
      text.includes("indemnity")
        ? 72
        : 30,

    EXIT_LOCKIN:
      text.includes("lock-in") ||
      text.includes("lock in") ||
      text.includes("bond") ||
      text.includes("notice period")
        ? 82
        : 25,

    PRIVACY_DATA:
      text.includes("personal data") ||
      text.includes("privacy") ||
      text.includes("data sharing")
        ? 55
        : 20,

    AMBIGUITY:
      text.includes("unclear") ||
      text.includes("not specified") ||
      text.includes("at the discretion")
        ? 70
        : 35,

    COMPLIANCE_DEADLINE:
      text.includes("deadline") ||
      text.includes("notice") ||
      text.includes("renewal")
        ? 60
        : 30,

    FRAUD_SUSPICION:
      text.includes("registration fee") ||
      text.includes("upfront payment") ||
      text.includes("pay before joining")
        ? 90
        : 20,

    JURISDICTION_COMPLEXITY:
      text.includes("jurisdiction") ||
      text.includes("exclusive court")
        ? 58
        : 25
  };

  const overallRiskScore = computeOverallRisk(scores);
  const band = mapRiskBand(overallRiskScore);

  const redFlags = [];

  if (scores.FRAUD_SUSPICION >= 70) {
    redFlags.push({
      title: "Possible upfront-payment or fraud signal",
      severity: "CRITICAL",
      whatCanGoWrong:
        "The user may be asked to pay money before receiving a legitimate service, job, or opportunity.",
      whatToDoNow:
        "Do not pay before independently verifying the organization and written terms."
    });
  }

  if (scores.EXIT_LOCKIN >= 70) {
    redFlags.push({
      title: "Lock-in, bond, or difficult exit clause",
      severity: "HIGH",
      whatCanGoWrong:
        "Leaving early may trigger penalties or require a long notice period.",
      whatToDoNow:
        "Ask for a clear termination clause and a reasonable capped penalty."
    });
  }

  if (scores.FINANCIAL >= 70) {
    redFlags.push({
      title: "Financial obligation or penalty",
      severity: "HIGH",
      whatCanGoWrong:
        "The document may create unexpected fees, charges, or financial loss.",
      whatToDoNow:
        "Ask for the exact amount, trigger condition, payment date, and refund policy."
    });
  }

  if (redFlags.length === 0) {
    redFlags.push({
      title: "No major automated red flag detected",
      severity: "LOW",
      whatCanGoWrong:
        "The analysis cannot guarantee that the document is safe or complete.",
      whatToDoNow:
        "Review the full document and seek professional advice for important decisions."
    });
  }

  return {
    analysisId: `anl_${Date.now()}`,
    documentType: detectDocumentType(text),
    decision: {
      label: band.label,
      reason: "Risk score calculated from detected financial, exit, ambiguity, fraud, and obligation signals.",
      overallRiskScore,
      confidenceScore: 82,
      riskLevel: band.label,
      color: band.color
    },
    plainSummary: [
      "RiskLens found terms that may affect money, flexibility, deadlines, or obligations.",
      "Review the highlighted risks before signing, paying, or accepting the document."
    ],
    topRedFlags: redFlags,
    categoryBreakdown: Object.entries(scores).map(([category, score]) => {
      const categoryBand = mapRiskBand(score);

      return {
        category,
        score,
        color: categoryBand.color,
        label: categoryBand.label,
        explanation: `${category} score was estimated from detected document language.`
      };
    }),
    actionPlan: {
      immediate: [
        "Verify the identity of the organization or other party.",
        "Ask for clarification about every fee, penalty, and deadline."
      ],
      beforeSigning: [
        "Check termination, renewal, notice, and payment clauses.",
        "Request changes to unclear or one-sided terms."
      ],
      questionsToAsk: [
        "What exact event triggers each fee or penalty?",
        "What is the process for cancellation or termination?",
        "Which obligations continue after the agreement ends?"
      ]
    },
    obligations: extractObligations(text),
    disclaimer:
      "RiskLens provides AI-assisted risk insights and does not constitute legal advice."
  };
}

function detectDocumentType(text: string) {
  if (text.includes("internship") || text.includes("intern")) {
    return "internship_or_training_agreement";
  }

  if (
    text.includes("loan") ||
    text.includes("emi") ||
    text.includes("borrower") ||
    text.includes("interest rate")
  ) {
    return "loan_or_banking_document";
  }

  if (
    text.includes("tenant") ||
    text.includes("landlord") ||
    text.includes("rent") ||
    text.includes("security deposit")
  ) {
    return "rental_agreement";
  }

  if (
    text.includes("employee") ||
    text.includes("employment") ||
    text.includes("salary")
  ) {
    return "employment_agreement";
  }

  return "general_agreement";
}

function extractObligations(text: string) {
  const obligations: Array<{
    type: string;
    description: string;
  }> = [];

  if (text.includes("notice period")) {
    obligations.push({
      type: "notice",
      description: "Review the notice-period requirement before ending the agreement."
    });
  }

  if (text.includes("renewal")) {
    obligations.push({
      type: "renewal",
      description: "Check whether the agreement renews automatically."
    });
  }

  if (text.includes("payment") || text.includes("fee")) {
    obligations.push({
      type: "payment",
      description: "Confirm payment amount, date, recipient, and refund conditions."
    });
  }

  return obligations;
}
