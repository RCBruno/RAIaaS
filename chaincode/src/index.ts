import { FairnessRegistryContract } from './registry/FairnessRegistryContract.js';
import { FairnessSLAFactoryContract } from './factory/FairnessSLAFactoryContract.js';
import { FairnessSLAContract } from './sla/FairnessSLAContract.js';

export { FairnessRegistryContract } from './registry/FairnessRegistryContract.js';
export { FairnessSLAFactoryContract } from './factory/FairnessSLAFactoryContract.js';
export { FairnessSLAContract } from './sla/FairnessSLAContract.js';

export const contracts: any[] = [
  FairnessRegistryContract,
  FairnessSLAFactoryContract,
  FairnessSLAContract
];
