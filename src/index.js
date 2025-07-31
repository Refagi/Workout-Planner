import app from './app.js';
import config from './config/config.js';
import logger from './config/logger.js';
import { prisma } from '../prisma/client.js';

let server;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Connected to Database');

    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
      logger.info(`Docs📚: http://localhost:${config.port}/v1/docs`);
      logger.info(`Docs📚: http://localhost:${config.port}/v1/`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exitCode = 1;
    process.exit();
  }
}

const exitHandler = () => {
  if (server) {
    server.close(async () => {
      logger.info('Server closed');
      await prisma.$disconnect();
      process.exitCode = 1;
      process.exit();
    });
  } else {
    process.exitCode = 1;
    process.exit();
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('Unexpected error:', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed due to SIGTERM');
    });
  }
});

startServer();
