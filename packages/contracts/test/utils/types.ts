import { BigNumberish } from 'ethers';

export enum CopyTraderPool {
  RELAY,
  OPERATIONS,
}

export interface CopyTraderPoolChargeStruct {
  asset: string;
  value: BigNumberish;
}

export type TradersFactoryTraderCreatedEvent = {
  onContract: string;
  strategy: string;
  observedAddress: string;
};

export type PoolChargedEvent = {
  charge: CopyTraderPoolChargeStruct;
  pool: CopyTraderPool;
};
