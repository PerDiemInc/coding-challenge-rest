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

export default async function storeOverwriteRoutes(fastify: FastifyInstance) {
  // 1. Get all store overwrites
  fastify.get('/', async (_, reply) => {
    const data = await readData();
    reply.send(data);
  });

  // Get store overwrite by id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await readData();
    const filtered = data.filter(d => d.id === id);
    if (!filtered.length) {
      return reply.status(404).send({ message: 'Not found' });
    }
    return reply.send(filtered);
  });

  // 2. Get store overwrite for specific date
  fastify.get('/date/:month/:day', async (request, reply) => {
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
  fastify.put('/:id', async (request, reply) => {
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
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await readData();
    const filtered = data.filter(d => d.id !== id);
    if (filtered.length === data.length)
      return reply.status(404).send({ message: 'Not found' });
    await writeData(filtered);
    reply.send({ message: 'Deleted' });
  });

  // 5. Create a new store overwrite
  fastify.post('/', async (request, reply) => {
    const newItem = request.body as Omit<StoreOverwrite, 'id'>;

    // Validate day and month ranges
    if (newItem.day < 1 || newItem.day > 31 || newItem.month < 1 || newItem.month > 12) {
      return reply.status(400).send({
        message: 'Invalid date: day must be 1-31 and month must be 1-12'
      });
    }

    const data = await readData();
    const newEntry = { ...newItem, id: uuidv4() };
    data.push(newEntry);
    await writeData(data);
    reply.status(201).send(newEntry);
  });
}
