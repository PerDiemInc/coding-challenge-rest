import { FastifyInstance } from 'fastify';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const FILE_PATH = path.join(__dirname, '../../data/store_times.json');

type StoreTime = {
  id: string;
  day_of_week: number;
  is_open: boolean;
  start_time: string;
  end_time: string;
};

async function readData(): Promise<StoreTime[]> {
  const data = await fs.readFile(FILE_PATH, 'utf8');
  return JSON.parse(data);
}

async function writeData(data: StoreTime[]) {
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
}

export default async function storeTimesRoutes(fastify: FastifyInstance) {
  // 1. Get all store times
  fastify.get('/', async (_, reply) => {
    const data = await readData();
    reply.send(data);
  });

  // Get store time by id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await readData();
    const filtered = data.filter(d => d.id === id);
    if (!filtered.length) {
      return reply.status(404).send({ message: 'Not found' });
    }
    return reply.send(filtered);
  });

  // 2. Get store time for specific day
  fastify.get('/day/:day_of_week', async (request, reply) => {
    const { day_of_week } = request.params as { day_of_week: string };
    const data = await readData();
    const filtered = data.filter(d => d.day_of_week === parseInt(day_of_week));
    if (!filtered.length) {
      return reply.status(404).send({ message: 'Not found' });
    }
    return reply.send(filtered);
  });

  // 3. Update a store time by ID
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as Partial<StoreTime>;
    const data = await readData();
    const index = data.findIndex(d => d.id === id);
    if (index === -1) return reply.status(404).send({ message: 'Not found' });
    data[index] = { ...data[index], ...updates };
    await writeData(data);
    reply.send(data[index]);
  });

  // 4. Delete a store time by ID
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await readData();
    const filtered = data.filter(d => d.id !== id);
    if (filtered.length === data.length)
      return reply.status(404).send({ message: 'Not found' });
    await writeData(filtered);
    reply.send({ message: 'Deleted' });
  });

  // 5. Create a new store time
  fastify.post('/', async (request, reply) => {
    const newItem = request.body as Omit<StoreTime, 'id'>;
    const data = await readData();
    const newEntry = { ...newItem, id: uuidv4() };
    data.push(newEntry);
    await writeData(data);
    reply.status(201).send(newEntry);
  });
}