import Fastify from 'fastify';
import storeTimesRoutes from './routes/store-times';

const fastify = Fastify({ logger: true });

fastify.register(storeTimesRoutes, { prefix: '/store-times' });

fastify.all('/', (req, res) => {
  return res.send({
    '[GET] /store-times': 'Get all store times',
    '[GET] /store-times/:id': 'Get a store time by id',
    '[POST] /store-times': 'Create a new store time',
    '[PUT] /store-times/:id': 'Update a store time by id',
    '[DELETE] /store-times/:id': 'Delete a store time by id',
  });
});

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});