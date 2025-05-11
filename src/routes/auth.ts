import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from '@fastify/jwt';
// In a real application, you would use a database
const MOCK_USER = {
  email: 'user@tryperdiem.com',
  password: bcrypt.hashSync('password', 10)
};

export default async function authRoutes(fastify: FastifyInstance) {
  // Register JWT plugin
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production'
  });

  fastify.post('/', {
    schema: {
      tags: ['authentication'],
      description: 'Authenticate user and return JWT token',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'User password'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token'
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    // In a real application, you would look up the user in a database
    if (email !== MOCK_USER.email) {
      return reply.status(401).send({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, MOCK_USER.password);
    if (!isValid) {
      return reply.status(401).send({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = await reply.jwtSign(
      {
        email,
        // Add any additional claims you want to include
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
      }
    );

    return { token };
  });

  // Optional: Add a verify route to test tokens
  fastify.get('/verify', {
    schema: {
      tags: ['authentication'],
      description: 'Verify JWT token',
      headers: {
        type: 'object',
        required: ['authorization'],
        properties: {
          authorization: {
            type: 'string',
            description: 'Bearer token'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            email: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      await request.jwtVerify();
      return { email: (request.user as { email: string }).email };
    } catch (err) {
      reply.status(401).send({ message: 'Invalid token' });
    }
  });
}