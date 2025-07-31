import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import * as planServices from '../services/plan.service.js';

const createPlans = catchAsync(async (req, res) => {
  const createPlan = await planServices.createPlans(req.validate.params.goalId);

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Create plan is Success',
    responseAi: createPlan.responseAi,
    dataPlan: createPlan.dataPlan
  });
});

const deleteWorkoutPlan = catchAsync(async (req, res) => {
  const deletePlan = await planServices.deleteWorkoutPlan(req.validate.params.planId);

  // if (!deletePlan) throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to delete plan');

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Delete plan is Success',
    data: deletePlan
  });
});

const getPlanById = catchAsync(async (req, res) => {
  const getPlan = await planServices.getPlanById(req.validate.params.planId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get plan is Success',
    data: getPlan
  });
});

const getWorkoutExercisesByDay = catchAsync(async (req, res) => {
  const getWorkoutExercises = await planServices.getWorkoutExercisesByDay(req.validate.params.workoutDayId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get workoutExercises is Success',
    data: getWorkoutExercises
  });
});

export { createPlans, getPlanById, getWorkoutExercisesByDay, deleteWorkoutPlan };
