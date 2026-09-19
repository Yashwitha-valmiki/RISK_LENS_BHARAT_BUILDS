export type CategoryScores = {
  FINANCIAL: number;
  LEGAL_LIABILITY: number;
  EXIT_LOCKIN: number;
  PRIVACY_DATA: number;
  AMBIGUITY: number;
  COMPLIANCE_DEADLINE: number;
  FRAUD_SUSPICION: number;
  JURISDICTION_COMPLEXITY: number;
};

const weights: Record<keyof CategoryScores, number> = {
  FINANCIAL: 0.18,
  LEGAL_LIABILITY: 0.16,
  EXIT_LOCKIN: 0.14,
  PRIVACY_DATA: 0.1,
  AMBIGUITY: 0.12,
  COMPLIANCE_DEADLINE: 0.1,
  FRAUD_SUSPICION: 0.14,
  JURISDICTION_COMPLEXITY: 0.06
};

export function computeOverallRisk(scores: CategoryScores): number {
  const value =
    scores.FINANCIAL * weights.FINANCIAL +
    scores.LEGAL_LIABILITY * weights.LEGAL_LIABILITY +
    scores.EXIT_LOCKIN * weights.EXIT_LOCKIN +
    scores.PRIVACY_DATA * weights.PRIVACY_DATA +
    scores.AMBIGUITY * weights.AMBIGUITY +
    scores.COMPLIANCE_DEADLINE * weights.COMPLIANCE_DEADLINE +
    scores.FRAUD_SUSPICION * weights.FRAUD_SUSPICION +
    scores.JURISDICTION_COMPLEXITY * weights.JURISDICTION_COMPLEXITY;

  return Math.max(0, Math.min(100, Math.round(value)));
}

export function mapRiskBand(score: number) {
  if (score <= 20) return { label: "SAFE", color: "GREEN" };
  if (score <= 40) return { label: "LOW", color: "LIGHT_GREEN" };
  if (score <= 60) return { label: "MODERATE", color: "YELLOW" };
  if (score <= 80) return { label: "HIGH", color: "ORANGE" };
  return { label: "CRITICAL", color: "RED" };
}
