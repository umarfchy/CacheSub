"use strict";

require("dotenv");
const express = require("express");
const { createClient } = require("redis");

// environment variables
const port = process.env.PORT || 3000;
const username = process.env.REDIS_USERNAME || "";
const password = process.env.REDIS_PASSWORD || "password";
const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT || 6379;
const channel = process.env.CHANNEL || "channel1";

// for debug purpose
// console.log({ port, username, password, redisHost, redisPort, channel });

const app = express();
app.use(express.json());
// const publisher = createClient();
const publisher = createClient({
  url: `redis://${username}:${password}@${redisHost}:${redisPort}`,
});

publisher.connect();
publisher.on("error", (err) => console.log("Redis error", err));
publisher.on("connect", () => console.log("\n Connected to Redis \n"));
publisher.on("ready", () => console.log("\n Redis ready for action! \n"));
publisher.on("reconnecting", () => console.log("\n Reconnecting to Redis \n"));

// endpoints

app.get("/", (_, res) => res.status(200).send("connected to server 1!"));

app.get("/data", (_, res) => res.status(200).send("success fetching from DB"));

app.post("/create", async (req, res) => {
  const { data } = req?.body;
  try {
    const subscriberCount = await publisher.publish(channel, data);
    res.status(200).json({ message: "success", subscriberCount });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
});

app.listen(port, () => console.log(`Served on port ${port}`));
