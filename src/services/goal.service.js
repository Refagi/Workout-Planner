import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import { tokenServices, userServices } from './index.js';
import { prisma } from '../../prisma/client.js';
import { ApiError } from '../utils/ApiError.js';

const createGoal = async (userId, goalBody) => {
  const goal = await prisma.goal.create({
    data: {
      userId,
      ...goalBody
    }
  });
  return goal;
};

const getGoalByUser = async (userId) => {
  const getUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      goals: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  if (!getUser) throw new ApiError(httpStatus.NOT_FOUND, 'Detail User is not found!');

  // const getGoal = getUser.goals;
  // if (!getGoal || getGoal.length === 0) throw new ApiError(httpStatus.NOT_FOUND, 'Goal by user is not found!');

  return getUser;
};

const updateGoalById = async (goalId, goalBody) => {
  const getGoal = await prisma.goal.findUnique({
    where: { id: goalId }
  });

  if (!getGoal) throw new ApiError(httpStatus.NOT_FOUND, 'Goal is not found');
  const updateGoal = await prisma.goal.update({
    where: { id: getGoal.id },
    data: goalBody
  });

  return updateGoal;
};

export { createGoal, getGoalByUser, updateGoalById };
