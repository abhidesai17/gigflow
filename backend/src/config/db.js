const mongoose = require('mongoose');

async function connectDb(uri) {
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
}

module.exports = { connectDb };
