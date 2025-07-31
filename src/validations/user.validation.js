import Joi from 'joi';
import { password, objectId } from './custom.validation.js';

const createDetailUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId)
  }),
  body: Joi.object().keys({
    username: Joi.string().required(),
    age: Joi.number().required(),
    gender: Joi.string()
      .valid('male', 'female')
      .messages({
        'string.valid': 'Gender must be either "male" or "female"'
      })
      .required(),
    heightCm: Joi.number().required(),
    weightKg: Joi.number().required()
  })
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId)
  })
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId)
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      username: Joi.string(),
      age: Joi.number(),
      gender: Joi.string(),
      heightCm: Joi.number(),
      weightKg: Joi.number()
    })
    .min(1)
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId)
  })
};

export { createDetailUser, getUsers, getUser, updateUser, deleteUser };
