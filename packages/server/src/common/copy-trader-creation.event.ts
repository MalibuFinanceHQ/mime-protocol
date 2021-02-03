import { BigNumber } from 'ethers';

export interface CopyTraderCreationEvent {
  creator: string;
  onContract: string;
  strategy: string;
  observedAddress: string;
  relaySinceNonce: BigNumber;
}
