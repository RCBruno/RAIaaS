import { FuzzyScaleConfig } from '../types/fuzzy.js';
export interface GovernanceProposal {
    proposalID: string;
    proposer: string;
    title: string;
    description: string;
    proposedFuzzyConfig: FuzzyScaleConfig;
    targetEthicalRatio: number;
    votesFor: number;
    votesAgainst: number;
    status: 'PENDING' | 'PASSED' | 'REJECTED' | 'EXECUTED';
    deadline: string;
}
export interface IDAOGovernanceBridge {
    submitProposal(proposal: Omit<GovernanceProposal, 'proposalID' | 'votesFor' | 'votesAgainst' | 'status'>): Promise<string>;
    castVote(proposalID: string, voter: string, approve: boolean): Promise<boolean>;
    executeProposal(proposalID: string): Promise<GovernanceProposal>;
}
//# sourceMappingURL=dao.d.ts.map