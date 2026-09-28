import { FuzzyScaleConfig, LinguisticLabel } from './fuzzy.js';

export enum SLAPlanType {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM'
}

export enum SLAStatus {
  ACTIVE = 'ACTIVE',
  DISPUTED = 'DISPUTED',
  TERMINATED = 'TERMINATED'
}

export enum DisputeStatus {
  NONE = 'NONE',
  OPEN = 'OPEN',
  UNDER_AUDIT = 'UNDER_AUDIT',
  RESOLVED_PLATFORM_FAULT = 'RESOLVED_PLATFORM_FAULT',
  RESOLVED_PROVIDER_FAULT = 'RESOLVED_PROVIDER_FAULT',
  REJECTED = 'REJECTED'
}

export interface SLATerms {
  targetExposureMeritRatio: number;
  reportingIntervalHours: number;
  fuzzyScaleConfig: FuzzyScaleConfig;
  platformBondRequirement: number;
  providerStakeRequirement: number;
}

export interface MetricReport {
  periodID: string;
  timestamp: string;
  ipfsCID: string;
  evidenceHash: string;
  exposureMeritRatio: number;
  fuzzyLabel: LinguisticLabel;
  complianceDegree: number;
  disputeStatus: DisputeStatus;
  settlementExecuted: boolean;
}

export interface DisputeRecord {
  periodID: string;
  disputingProviderID: string;
  counterEvidenceCID: string;
  openedAt: string;
  resolvedAt?: string;
  status: DisputeStatus;
  auditorID?: string;
  auditorVerdict?: string;
  penaltyAmount?: number;
}

export interface SLAContractState {
  slaID: string;
  factoryID: string;
  platformID: string;
  providerIDs: string[];
  planType: SLAPlanType;
  status: SLAStatus;
  terms: SLATerms;
  reports: Record<string, MetricReport>; // periodID -> report
  disputes: Record<string, DisputeRecord>; // periodID -> dispute
  createdAt: string;
  updatedAt: string;
}
