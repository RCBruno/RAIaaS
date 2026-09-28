export interface RawProviderMetric {
  providerID: string;
  exposureCount: number; // Impressions, rank placements, etc.
  meritScore: number;    // Accumulated quality/sales/relevance score
}

export interface EvidencePackage {
  slaID: string;
  periodID: string;
  timestamp: string;
  platformID: string;
  metrics: RawProviderMetric[];
  aggregatedRatio: number;
  calculatedHash: string;
  signature?: string;
  teeAttestation?: string;
}
