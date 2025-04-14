import Redis from "ioredis";

const redisClient = () => {
  if (process.env.REDIS_URI) {
    console.log(`Redis Connection SuccesFull`);
    return process.env.REDIS_URI;
  }
  throw new Error(`Redis Connection Failed`);
};

export const redis = new Redis(redisClient());
