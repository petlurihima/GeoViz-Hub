const redis = require("redis");
const { sendNotification } = require("./notificationService");
const redisClient = redis.createClient();

redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("end", () => console.log("Redis Disconnected! Attempting to reconnect..."));

(async () => {
  await redisClient.connect();
})();

const publisher = redisClient.duplicate();
const subscriber = redisClient.duplicate();

(async () => {
  await publisher.connect();
  await subscriber.connect();
  console.log("Redis Publisher & Subscriber Connected");

  await subscriber.subscribe("cityAdded", async(message) => {
    console.log(`Received message from cityAdded: ${message}`);
    try {
        const cityData = JSON.parse(message);
        console.log("Calling sendNotification...");
        await sendNotification(`New city ${cityData.name} added!`);
      } catch (error) {
        console.error("Error handling cityAdded event:", error);
      }
  });
})();
module.exports = { publisher, subscriber };