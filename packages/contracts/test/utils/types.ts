import { BigNumberish } from 'ethers/utils';
import { type } from 'os';

export type CopyTraderPoolChargeStruct = {
  asset: string;
  value: BigNumberish;
};

export type TradersFactoryTraderCreatedEvent = {
  onContract: string;
  strategy: string;
  observedAddress: string;
  relayPoolCharges: CopyTraderPoolChargeStruct[];
  operationsPoolCharges: CopyTraderPoolChargeStruct[];
};
