import passport from 'passport';
import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../../prisma/client.js';

const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  const userToken = await prisma.token.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  if (!userToken) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Token has been blacklisted '));
  }
  req.user = user;

  resolve();
};

const auth = () => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

export default auth;
