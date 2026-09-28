export interface RawProviderMetric {
    providerID: string;
    exposureCount: number;
    meritScore: number;
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
//# sourceMappingURL=metric.d.ts.map