import { Router } from 'express';
import authRoutes from './auth';
import profileRoutes from './stocks';
import pingRoute from './ping';
import metricsRoutes from './metrics';

const router = Router();

router.use('/', pingRoute);

router.use('/', authRoutes);

router.use('/', profileRoutes);

router.use('/metrics', metricsRoutes);

export default router;
