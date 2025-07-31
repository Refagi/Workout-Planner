import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import * as userService from '../services/user.service.js';

const createDetailUser = catchAsync(async (req, res) => {
  const user = await userService.createDeatilUser(req.validate.params.userId, req.validate.body);

  res.status(httpStatus.CREATED).send({
    status: httpStatus.CREATED,
    message: 'Create Detail User is Success',
    data: user
  });
});

const getUsers = catchAsync(async (req, res) => {
  const options = {
    page: parseInt(req.validate.query.page, 10) || 1,
    limit: parseInt(req.validate.query.limit, 10) || 5,
    sortBy: req.validate.query.sortBy || 'name',
    name: req.validate.query.name || '',
    role: req.validate.query.role || ''
  };
  const result = await userService.queryUsers(options);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get Users Success',
    data: result.users,
    totalData: result.totalData,
    totalPage: result.totalPage
  });
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.validate.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Get User Success',
    data: user
  });
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.validate.params.userId, req.validate.body);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Update User Success',
    data: user
  });
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.validate.params.userId);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    message: 'Delete User Success',
    data: null
  });
});

export { createDetailUser, getUsers, getUser, updateUser, deleteUser };
