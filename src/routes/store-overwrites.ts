import { FastifyInstance } from 'fastify';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const FILE_PATH = path.join(__dirname, '../../data/store_overwrite.json');

type StoreOverwrite = {
  id: string;
  day: number;
  month: number;
  is_open: boolean;
  start_time: string;
  end_time: string;
};

async function readData(): Promise<StoreOverwrite[]> {
  const data = await fs.readFile(FILE_PATH, 'utf8');
  return JSON.parse(data);
}

async function writeData(data: StoreOverwrite[]) {
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
}

export default async function storeOverwritesRoutes(fastify: FastifyInstance) {
  // 1. Get all store overwrites
  fastify.get('/', {
    schema: {
      tags: ['store-overwrites'],
      description: 'Get all store overwrites',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              day: { type: 'number' },
              month: { type: 'number' },
              is_open: { type: 'boolean' },
              start_time: { type: 'string' },
              end_time: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (_, reply) => {
    const data = await readData();
    reply.send(data);
  });

  // Get store overwrite by id
  fastify.get('/:id', {
    schema: {
      tags: ['store-overwrites'],
      description: 'Get store overwrite by ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Store overwrite ID' }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              day: { type: 'number' },
              month: { type: 'number' },
              is_open: { type: 'boolean' },
              start_time: { type: 'string' },
              end_time: { type: 'string' }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await readData();
    const filtered = data.filter(d => d.id === id);
    if (!filtered.length) {
      return reply.status(404).send({ message: 'Not found' });
    }
    return reply.send(filtered);
  });

  // 2. Get store overwrite for specific date
  fastify.get('/date/:month/:day', {
    schema: {
      tags: ['store-overwrites'],
      description: 'Get store overwrites for a specific date',
      params: {
        type: 'object',
        required: ['month', 'day'],
        properties: {
          month: { type: 'string', description: 'Month (1-12)' },
          day: { type: 'string', description: 'Day (1-31)' }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              day: { type: 'number' },
              month: { type: 'number' },
              is_open: { type: 'boolean' },
              start_time: { type: 'string' },
              end_time: { type: 'string' }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { month, day } = request.params as { month: string; day: string };
    const data = await readData();
    const filtered = data.filter(d =>
      d.month === parseInt(month) &&
      d.day === parseInt(day)
    );
    if (!filtered.length) {
      return reply.status(404).send({ message: 'Not found' });
    }
    return reply.send(filtered);
  });

  // 3. Update a store overwrite by ID
  fastify.put('/:id', {
    schema: {
      description: 'Update a store overwrite by ID',
      tags: ['store-overwrites'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Store overwrite ID' }
        }
      },
      body: {
        type: 'object',
        properties: {
          day: { type: 'number', minimum: 1, maximum: 31 },
          month: { type: 'number', minimum: 1, maximum: 12 },
          is_open: { type: 'boolean' },
          start_time: { type: 'string', pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$' },
          end_time: { type: 'string', pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            day: { type: 'number' },
            month: { type: 'number' },
            is_open: { type: 'boolean' },
            start_time: { type: 'string' },
            end_time: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as Partial<StoreOverwrite>;
    const data = await readData();
    const index = data.findIndex(d => d.id === id);
    if (index === -1) return reply.status(404).send({ message: 'Not found' });
    data[index] = { ...data[index], ...updates };
    await writeData(data);
    reply.send(data[index]);
  });

  // 4. Delete a store overwrite by ID
  fastify.delete('/:id', {
    schema: {
      tags: ['store-overwrites'],
      description: 'Delete a store overwrite by ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Store overwrite ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await readData();
    const filtered = data.filter(d => d.id !== id);
    if (filtered.length === data.length)
      return reply.status(404).send({ message: 'Not found' });
    await writeData(filtered);
    reply.send({ message: 'Deleted' });
  });

  // 5. Create a new store overwrite
  fastify.post('/', {
    schema: {
      tags: ['store-overwrites'],
      description: 'Create a new store overwrite',
      body: {
        type: 'object',
        required: ['day', 'month', 'is_open', 'start_time', 'end_time'],
        properties: {
          day: { type: 'number', minimum: 1, maximum: 31 },
          month: { type: 'number', minimum: 1, maximum: 12 },
          is_open: { type: 'boolean' },
          start_time: { type: 'string', pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$' },
          end_time: { type: 'string', pattern: '^([0-1][0-9]|2[0-3]):[0-5][0-9]$' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            day: { type: 'number' },
            month: { type: 'number' },
            is_open: { type: 'boolean' },
            start_time: { type: 'string' },
            end_time: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const newItem = request.body as Omit<StoreOverwrite, 'id'>;
    const data = await readData();
    const newEntry = { ...newItem, id: uuidv4() };
    data.push(newEntry);
    await writeData(data);
    reply.status(201).send(newEntry);
  });
}
