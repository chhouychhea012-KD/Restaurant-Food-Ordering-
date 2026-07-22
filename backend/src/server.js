const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

async function start() {
  await sequelize.authenticate();
  app.listen(env.port, () => {
    console.log(`Golden Land Restaurant API listening on http://localhost:${env.port}/api/v1`);
  });
}

start().catch((error) => {
  console.error('Unable to start API server:', error);
  process.exit(1);
});
