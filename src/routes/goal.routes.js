import { Router } from 'express';
import auth from '../middlewares/auth.js';
import validate from '../middlewares/validation.js';
import { goalValidation } from '../validations/index.js';
import { goalController } from '../controllers/index.js';

const router = Router();

router.post('/:userId', validate(goalValidation.createGoal), goalController.createGoal);
router.get('/user', auth(), goalController.getGoalByUser);
router.put('/:goalId', auth(), validate(goalValidation.updateGoalById), goalController.updateGoalById);

export default router;
