import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import { tokenServices, userServices } from './index.js';
import { prisma } from '../../prisma/client.js';
import { ApiError } from '../utils/ApiError.js';
import { tokenTypes } from '../config/token.js';

const login = async (email, password) => {
  const user = await userServices.getUserByEmail(email);

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'wrong email or password!');
  }

  if (user.isEmailVerified === false) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email not verified, Please verify your email!');
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'wrong email or password!');
  }
  return user;
};

const logout = async (refreshToken) => {
  const refreshTokenDoc = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false
    }
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token Not Found!');
  }
  await prisma.token.delete({ where: { id: refreshTokenDoc.id } });
};

const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenServices.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userServices.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
    }
    await prisma.token.delete({
      where: { id: refreshTokenDoc.id }
    });
    return tokenServices.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenServices.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userServices.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
    }
    await userServices.updateUserById(user.id, { password: newPassword });
    await prisma.token.deleteMany({
      where: { userId: user.id, type: tokenTypes.RESET_PASSWORD }
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenServices.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userServices.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
    }
    await prisma.token.deleteMany({
      where: { userId: user.id, type: tokenTypes.VERIFY_EMAIL }
    });
    await userServices.updateUserById(user.id, { isEmailVerified: true, updateAt: new Date() });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

export { login, logout, refreshAuth, resetPassword, verifyEmail };
