import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createGoal = {
  params: Joi.object().keys({
    goalId: Joi.required().custom(objectId)
  })
};

const deletePlan = {
  params: Joi.object().keys({
    planId: Joi.required().custom(objectId)
  })
};

const getPlanById = {
  params: Joi.object().keys({
    planId: Joi.required().custom(objectId)
  })
};

const getWorkoutExercisesByDay = {
  params: Joi.object().keys({
    workoutDayId: Joi.required().custom(objectId)
  })
};

export { createGoal, getPlanById, getWorkoutExercisesByDay, deletePlan };
