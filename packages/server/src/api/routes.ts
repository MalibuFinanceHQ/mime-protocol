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
];
