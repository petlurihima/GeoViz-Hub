const { createClient } = require("redis");
const redisClient = createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379, 
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000), 
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

// Handle disconnection
redisClient.on("end", () => {
  console.log("Redis Disconnected! Attempting to reconnect...");
  setTimeout(async () => {
    try {
      await redisClient.connect();
      console.log("Reconnected to Redis!");
    } catch (err) {
      console.error("Redis Reconnection Failed:", err);
    }
  }, 5000); 
});

(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Redis Connection Failed:", error);
  }
})();

module.exports = redisClient;