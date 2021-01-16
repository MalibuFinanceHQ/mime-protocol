import { ContractReceipt } from 'ethers/contract';

import { TradersFactoryTraderCreatedEvent } from './types';

export function parseCopyTraderCreationFromFactory(
  receipt: ContractReceipt,
): TradersFactoryTraderCreatedEvent {
  const event = <any>receipt.events[receipt.events.length - 1].args;

  return {
    onContract: event.onContract,
    strategy: event.strategy,
    observedAddress: event.observedAddress,
  };
}
