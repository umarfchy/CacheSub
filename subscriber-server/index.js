"use strict";
require("dotenv").config();
const { createClient } = require("redis");

// environment variables
const username = process.env.REDIS_USERNAME || "";
const password = process.env.REDIS_PASSWORD || "password";
const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT || 6379;
const channel = process.env.CHANNEL || "channel1";

const subscriber = createClient({
  url: `redis://${username}:${password}@${redisHost}:${redisPort}`,
});

// for debug purpose
// console.log({ port, username, password, redisHost, redisPort, channel });

(async function () {
  try {
    subscriber.connect();
    subscriber.on("error", (err) => console.log("Redis error", err));
    subscriber.on("connect", () => console.log("\n Connected to Redis \n"));
    subscriber.on("ready", () => console.log("\n Redis ready for action! \n"));
    subscriber.on("reconnecting", () => {
      console.log("\nReconnecting to Redis...\n");
    });

    // the call back fn is required
    subscriber.subscribe(channel, (message) => {
      console.log(message);
    });
  } catch (error) {
    // exited the reconnection logic
    console.error({ error });
  }
})();
