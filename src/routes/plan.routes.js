import { Router } from 'express';
import auth from '../middlewares/auth.js';
import validate from '../middlewares/validation.js';
import { planValidation } from '../validations/index.js';
import { planController } from '../controllers/index.js';

const router = Router();

router.post('/:goalId/generate', auth(), validate(planValidation.createGoal), planController.createPlans);
router.get('/:planId', auth(), validate(planValidation.getPlanById), planController.getPlanById);
router.get(
  '/:workoutDayId/workoutExercises',
  auth(),
  validate(planValidation.getWorkoutExercisesByDay),
  planController.getWorkoutExercisesByDay
);
router.delete('/:planId', auth(), validate(planValidation.deletePlan), planController.deleteWorkoutPlan);

export default router;
