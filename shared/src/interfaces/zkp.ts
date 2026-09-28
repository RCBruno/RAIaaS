export interface ZKPProofPayload {
  proof: string;
  publicInputs: string[];
  verificationKeyID: string;
}

export interface IZKPVerifier {
  generateProof(privateInputData: unknown, publicSummary: unknown): Promise<ZKPProofPayload>;
  verifyProof(proofPayload: ZKPProofPayload): Promise<boolean>;
}
