import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createGoal = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    goalType: Joi.string().valid('bulking', 'cutting', 'maingaining', 'rekomposisi').required(),
    experienceLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
    equipment: Joi.string().valid('gym', 'bodyweight').required(),
    availableDays: Joi.number().required(),
    goalNotes: Joi.string().optional()
  })
};

const getGoalByUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId)
  })
};

const updateGoalById = {
  params: Joi.object().keys({
    goalId: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    goalType: Joi.string().valid('bulking', 'cutting', 'maingaining', 'rekomposisi').optional(),
    experienceLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    equipment: Joi.string().valid('gym', 'bodyweight').optional(),
    availableDays: Joi.number().optional(),
    goalNotes: Joi.string().optional()
  })
};

export { createGoal, getGoalByUser, updateGoalById };
