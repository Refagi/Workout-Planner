import { Router } from 'express';
import authRoute from './auth.routes.js';
import userRoute from './user.routes.js';
import goalRoute from './goal.routes.js';
import planRoute from './plan.routes.js';

const router = Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/users',
    route: userRoute
  },
  {
    path: '/goals',
    route: goalRoute
  },
  {
    path: '/plans',
    route: planRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
