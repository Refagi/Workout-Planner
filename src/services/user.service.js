import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma/client.js';
import { ApiError } from '../utils/ApiError.js';

const createUser = async (userBody) => {
  const hashPassword = await bcrypt.hash(userBody.password, 8);

  return prisma.user.create({
    data: {
      ...userBody,
      password: hashPassword
    }
  });
};

const createDeatilUser = async (userId, userBody) => {
  const getUser = await getUserById(userId);
  if (!getUser) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const detailUser = await prisma.user.update({
    where: { id: getUser.id },
    data: {
      ...userBody
    }
  });
  return detailUser;
};

const getUserById = async (userId) => {
  return prisma.user.findFirst({
    where: {
      id: userId
    }
  });
};

const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email }
  });
};

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email) {
    const isEmailTaken = await getUserByEmail(updateBody.email);
    if (isEmailTaken) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken!');
    }
  }

  const updateUser = await prisma.user.update({
    where: {
      id: userId
    },
    data: updateBody
  });

  return updateUser;
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const deleteUsers = await prisma.user.deleteMany({
    where: {
      id: userId
    }
  });

  return deleteUsers;
};

export { createUser, createDeatilUser, getUserById, getUserByEmail, updateUserById, deleteUserById };
