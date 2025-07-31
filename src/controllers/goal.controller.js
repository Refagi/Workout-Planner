import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import * as goalServices from '../services/goal.service.js';

const createGoal = catchAsync(async (req, res) => {
  const goal = await goalServices.createGoal(req.validate.params.userId, req.validate.body);

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Create goal is Success',
    data: goal
  });
});

const getGoalByUser = catchAsync(async (req, res) => {
  const getGoal = await goalServices.getGoalByUser(req.user.id);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get goal by user is Success',
    data: getGoal
  });
});

const updateGoalById = catchAsync(async (req, res) => {
  const updateGoal = await goalServices.updateGoalById(req.validate.params.goalId, req.validate.body);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Update Goal Success',
    data: updateGoal
  });
});

export { createGoal, getGoalByUser, updateGoalById };
