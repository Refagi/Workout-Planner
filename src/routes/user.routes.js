import { Router } from 'express';
import auth from '../middlewares/auth.js';
import validate from '../middlewares/validation.js';
import { userValidation } from '../validations/index.js';
import { userController } from '../controllers/index.js';

const router = Router();

router
  .put('/createDetailUser/:userId', auth(), validate(userValidation.createDetailUser), userController.createDetailUser)
  .get('/:userId', auth(), validate(userValidation.getUser), userController.getUser);

export default router;
