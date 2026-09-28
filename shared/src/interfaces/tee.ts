export interface TEEAttestationQuote {
  enclaveID: string;
  measurementHash: string;
  signature: string;
  timestamp: string;
  rawLogHash: string;
}

export interface ITEEIngestionAttester {
  captureAndAttestLogBatch(rawLogs: unknown[]): Promise<TEEAttestationQuote>;
  verifyAttestation(quote: TEEAttestationQuote): Promise<boolean>;
}
