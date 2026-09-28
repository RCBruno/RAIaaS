export enum ActorRole {
  PLATFORM = 'PLATFORM',
  PROVIDER = 'PROVIDER',
  AUDITOR = 'AUDITOR',
  ORACLE = 'ORACLE',
  GOVERNANCE = 'GOVERNANCE'
}

export enum ActorStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  SLASHED = 'SLASHED'
}

export interface Actor {
  id: string;
  mspID: string;
  role: ActorRole;
  name: string;
  stakeBalance: number;
  bondBalance: number;
  status: ActorStatus;
  registeredAt: string;
  updatedAt: string;
}
