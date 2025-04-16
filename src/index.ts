import Fastify from 'fastify';
import storeTimesRoutes from './routes/store-times';
import storeOverwriteRoutes from './routes/store-overwrite';

const fastify = Fastify({ logger: true });

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

fastify.register(storeTimesRoutes, { prefix: '/store-times' });
fastify.register(storeOverwriteRoutes, { prefix: '/store-overwrite' });
fastify.all('/', (req, res) => {
  return res.send({
    '[GET] /store-times': 'Get all store times',
    '[GET] /store-times/day/:day_of_week': 'Get a store time by day of week',
    '[POST] /store-times': 'Create a new store time',
    '[PUT] /store-times/:id': 'Update a store time by id',
    '[DELETE] /store-times/:id': 'Delete a store time by id',
    '[GET] /store-overwrite': 'Get all store overwrites',
    '[GET] /store-overwrite/date/:month/:day': 'Get a store overwrite by date',
    '[POST] /store-overwrite': 'Create a new store overwrite',
    '[PUT] /store-overwrite/:id': 'Update a store overwrite by id',
    '[DELETE] /store-overwrite/:id': 'Delete a store overwrite by id',
  });
});

fastify.listen({ port: Number(PORT), host: HOST }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🚀 Server listening at ${address}`);
});