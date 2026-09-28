import crypto from 'crypto';
import { EvidencePackage } from '@raiaas/shared';

export class IPFSService {
  private inMemoryStore: Map<string, EvidencePackage> = new Map();

  /**
   * Uploads an EvidencePackage to IPFS, returning the CID and SHA-256 evidence hash.
   */
  public async uploadEvidence(evidence: EvidencePackage): Promise<{ ipfsCID: string; evidenceHash: string }> {
    const jsonString = JSON.stringify(evidence);
    const evidenceHash = crypto.createHash('sha256').update(jsonString).digest('hex');

    // Generate deterministic mock IPFS CID (v1) based on SHA-256 hash
    const ipfsCID = `bafybeih${evidenceHash.substring(0, 32)}`;

    evidence.calculatedHash = evidenceHash;
    this.inMemoryStore.set(ipfsCID, evidence);

    return { ipfsCID, evidenceHash };
  }

  /**
   * Retrieves an EvidencePackage from IPFS by CID.
   */
  public async getEvidence(ipfsCID: string): Promise<EvidencePackage> {
    const evidence = this.inMemoryStore.get(ipfsCID);
    if (!evidence) {
      throw new Error(`Evidence with CID ${ipfsCID} not found in IPFS datastore.`);
    }
    return evidence;
  }
}
