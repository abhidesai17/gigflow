const http = require('http');
require('dotenv').config();

const { connectDb } = require('./config/db');
const { createApp } = require('./app');
const { initSocket } = require('./socket');

async function bootstrap() {
  await connectDb(process.env.MONGO_URI);

  const app = createApp();
  const server = http.createServer(app);

  initSocket(server);

  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${port}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});
