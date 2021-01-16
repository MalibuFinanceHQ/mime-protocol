import { BigNumberish } from 'ethers';

export interface CopyTraderPoolChargeStruct {
  asset: string;
  value: BigNumberish;
}

export type TradersFactoryTraderCreatedEvent = {
  onContract: string;
  strategy: string;
  observedAddress: string;
};
