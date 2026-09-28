"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPFSService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class IPFSService {
    inMemoryStore = new Map();
    /**
     * Uploads an EvidencePackage to IPFS, returning the CID and SHA-256 evidence hash.
     */
    async uploadEvidence(evidence) {
        const jsonString = JSON.stringify(evidence);
        const evidenceHash = crypto_1.default.createHash('sha256').update(jsonString).digest('hex');
        // Generate deterministic mock IPFS CID (v1) based on SHA-256 hash
        const ipfsCID = `bafybeih${evidenceHash.substring(0, 32)}`;
        evidence.calculatedHash = evidenceHash;
        this.inMemoryStore.set(ipfsCID, evidence);
        return { ipfsCID, evidenceHash };
    }
    /**
     * Retrieves an EvidencePackage from IPFS by CID.
     */
    async getEvidence(ipfsCID) {
        const evidence = this.inMemoryStore.get(ipfsCID);
        if (!evidence) {
            throw new Error(`Evidence with CID ${ipfsCID} not found in IPFS datastore.`);
        }
        return evidence;
    }
}
exports.IPFSService = IPFSService;
//# sourceMappingURL=ipfs.service.js.map