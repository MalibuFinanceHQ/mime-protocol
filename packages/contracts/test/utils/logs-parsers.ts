import { ContractReceipt } from 'ethers';

import { TradersFactoryTraderCreatedEvent, PoolChargedEvent } from './types';

// TODO handle ABI change
export function parseCopyTraderCreationFromFactory(
  receipt: ContractReceipt,
): TradersFactoryTraderCreatedEvent {
  // @ts-ignore
  const event = <any>receipt.events[receipt.events.length - 1].args;

  return {
    onContract: event.onContract,
    strategy: event.strategy,
    observedAddress: event.observedAddress,
  };
}

export function parseCopyTraderChargedEvents(
  receipt: ContractReceipt,
): PoolChargedEvent[] {
  const events = <any>receipt.events;

  const result: PoolChargedEvent[] = [];

  for (const event of events) {
    if (event.event === 'PoolCharged') {
      result.push(event.args);
    }
  }
  return result;
}
