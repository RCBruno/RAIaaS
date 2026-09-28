import { EvidencePackage } from '@raiaas/shared';
export declare class IPFSService {
    private inMemoryStore;
    /**
     * Uploads an EvidencePackage to IPFS, returning the CID and SHA-256 evidence hash.
     */
    uploadEvidence(evidence: EvidencePackage): Promise<{
        ipfsCID: string;
        evidenceHash: string;
    }>;
    /**
     * Retrieves an EvidencePackage from IPFS by CID.
     */
    getEvidence(ipfsCID: string): Promise<EvidencePackage>;
}
//# sourceMappingURL=ipfs.service.d.ts.map