import { getAvailableStrategies } from './GetAvailableStrategies';
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
];
