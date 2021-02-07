import { getAvailableStrategies } from './GetAvailableStrategies';
import { getRelayedTxns } from './GetRelayedTxns';
import { getUserCopyTraders } from './GetUserCopyTraders';

/**
 * All application routes.
 */
export const AppRoutes = [
  {
    path: '/contracts',
    method: 'get',
    action: getUserCopyTraders,
  },
  {
    path: '/strategies',
    method: 'get',
    action: getAvailableStrategies,
  },
  {
    path: '/relayed-txns',
    method: 'get',
    action: getRelayedTxns,
  },
];
