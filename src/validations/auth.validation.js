import Joi from 'joi';
import { password } from './custom.validation.js';

const register = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ['com'] } }),
    password: Joi.string().required().custom(password)
  })
};

const login = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ['com'] } }),
    password: Joi.string().required()
  })
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ['com'] } })
  })
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required()
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password)
  })
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required()
  })
};

export { register, login, logout, refreshTokens, forgotPassword, resetPassword, verifyEmail };
