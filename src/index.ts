import path from 'path';
import fs from 'fs';

import Fastify from 'fastify';
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import basicAuth from '@fastify/basic-auth'

import storeTimesRoutes from './routes/store-times';
import storeOverwriteRoutes from './routes/store-overwrite';

const fastify = Fastify({ logger: true });

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const SWAGGER_USERNAME = process.env.SWAGGER_USERNAME || 'perdiem';
const SWAGGER_PASSWORD = process.env.SWAGGER_PASSWORD || 'perdiem';

// Define authentication
const authenticate = {realm: 'Swagger Documentation'}
fastify.register(basicAuth, {
  validate: async (username: string, password: string) => {
    if (username !== SWAGGER_USERNAME || password !== SWAGGER_PASSWORD) {
      throw new Error('Invalid credentials')
    }
  },
  authenticate
});


// Register Swagger
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Coding Challenge API Documentation',
      description: 'API documentation for the Coding Challenge REST API',
      version: '1.0.0'
    },
    host: `${HOST}:${PORT}`,
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'root', description: 'Root endpoints' },
      // Add more tags for your endpoint categories
    ],
    securityDefinitions: {
      basicAuth: {
        type: 'basic',
        description: 'Basic authentication for Swagger documentation'
      }
    }
  }
})

// Register Swagger UI
fastify.register(swaggerUI, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header: string) => header
})

// Add authentication to the Swagger UI route
fastify.addHook('onRequest', (request, reply, done) => {
  if (request.url.startsWith('/documentation')) {
    fastify.basicAuth(request, reply, done)
  } else {
    done()
  }
})

// Example of documenting a route
fastify.get('/', {
  schema: {
    tags: ['root'],
    description: 'Root endpoint returning hello world',
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  }
}, async () => {
  return { message: 'Hello World' }
})

fastify.register(storeTimesRoutes, { prefix: '/store-times' });
fastify.register(storeOverwriteRoutes, { prefix: '/store-overwrite' });

fastify.get('/favicon.ico', (_, res) => {
  try {
    const faviconPath = path.join(__dirname, '../static/favicon.ico')
    const faviconBuffer = fs.readFileSync(faviconPath)
    return res.code(200)
      .header('Content-Type', 'image/x-icon')
      .send(faviconBuffer)
  } catch (error) {
    return res.code(200).send({});
  }

});

fastify.listen({ port: Number(PORT), host: HOST }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🚀 Server listening at ${address}`);
});