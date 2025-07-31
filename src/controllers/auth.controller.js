import httpStatus from 'http-status';
import { catchAsync } from '../utils/catchAsync.js';
import { authServices, userServices, tokenServices, emailServices } from '../services/index.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../../prisma/client.js';
import { tokenTypes } from '../config/token.js';

const register = catchAsync(async (req, res) => {
  const existingUser = await userServices.getUserByEmail(req.validate.body.email);

  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const userCreated = await userServices.createUser(req.validate.body);
  const tokens = await tokenServices.generateAuthTokens(userCreated);
  res.status(httpStatus.CREATED).send({ message: 'Register is successfully', data: userCreated, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.validate.body;

  const existingUser = await userServices.getUserByEmail(req.validate.body.email);
  if (!existingUser) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You dont have an account yet, please register!');
  }

  const user = await authServices.login(email, password);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to login!');
  }

  const existingLoginUser = await prisma.token.findFirst({
    where: { userId: user.id, type: tokenTypes.REFRESH },
    orderBy: { createdAt: 'desc' }
  });

  if (existingLoginUser) {
    await prisma.token.delete({
      where: { id: existingLoginUser.id }
    });
  }
  const tokens = await tokenServices.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ message: 'Login is successfully', data: user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authServices.logout(req.validate.body.refreshToken);
  res.status(httpStatus.OK).send({ message: 'logout is successfully' });
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authServices.refreshAuth(req.validate.body.refreshToken);
  res.status(httpStatus.OK).send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenServices.generateResetPasswordToken(req.validate.body.email);
  await emailServices.sendResetPasswordEmail(req.validate.body.email, resetPasswordToken);
  res.status(httpStatus.OK).send({ resetPasswordToken });
});

const resetPassword = catchAsync(async (req, res) => {
  await authServices.resetPassword(req.validate.query.token, req.validate.body.password);
  res.status(httpStatus.OK).send({ message: 'reset password is successfully' });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenServices.generateVerifyEmailToken(req.user);
  await emailServices.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.OK).send({
    message: `Verify email link has been sent to ${req.user.email}`,
    tokens: verifyEmailToken
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.validate.query;
  await authServices.verifyEmail(token);
  res.status(httpStatus.OK).send({ message: 'Email has been verification!' });
});

export { register, login, logout, refreshTokens, forgotPassword, resetPassword, sendVerificationEmail, verifyEmail };
