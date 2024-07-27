const Redis = require("ioredis");

// const redis = new Redis(); // localhost:6379 => kalau install ke dalam laptop kalian
const redis = new Redis({
  port: 15066, // Redis port
  host: "redis-15066.c302.asia-northeast1-1.gce.redns.redis-cloud.com", // Redis host
  // username: "default", // needs Redis >= 6
  password: "ggfqmvi9GQSZCp1fUerYkLDF6S6cAoK9",
  // db: 0, // Defaults to 0
});

module.exports = redis
