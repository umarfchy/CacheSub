"use strict";
import dotenv from "dotenv";
import express from "express";
import { createClient } from "redis";
import mysql from "mysql2/promise";

dotenv.config();
// environment variables
const expressPort = process.env.PORT || 5001;

// redis
const redisUsername = process.env.REDIS_USERNAME || "";
const redisPassword = process.env.REDIS_PASSWORD || "password";
const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT || 6379;
const redisChannel = process.env.CHANNEL || "channel1";

// mysql
const sqlHost = process.env.MYSQL_HOST || "localhost";
const sqlUser = process.env.MYSQL_USERNAME || "root";
const sqlPassword = process.env.MYSQL_PASSWORD || "password";
const sqlDatabase = process.env.MYSQL_DATABASE || "mydb";
const sqlTable = process.env.MYSQL_TABLE || "mytable";

// debug with following -
// console.log({ expressPort, redisUsername, redisPassword, redisHost, redisPort, redisChannel });

console.log({ sqlHost, sqlUser, sqlPassword, sqlDatabase });

// configs
const redisUrl = `redis://${redisUsername}:${redisPassword}@${redisHost}:${redisPort}`;
const dbConfig = {
  host: sqlHost,
  user: sqlUser,
  password: sqlPassword,
  database: sqlDatabase,
};

const app = express();
const redisClient = createClient({ url: redisUrl });

const getData = async () => {
  const sqlQuery = `SELECT data FROM ${sqlTable}`;
  const sqlConnection = await mysql.createConnection(dbConfig);
  return sqlConnection.execute(sqlQuery);
};

const createData = async (data) => {
  const sqlQuery = `INSERT INTO ${sqlTable} (data) VALUES ('${data}')`;
  const sqlConnection = await mysql.createConnection(dbConfig);
  return sqlConnection.execute(sqlQuery);
};

const cacheToRedis = async (jsonData) => {
  const value = JSON.stringify({ isCached: "yes", data: jsonData });
  return redisChannel.set("key", value);
};

// express endpoints
app.use(express.json());
app.get("/", (_, res) => res.status(200).send("connected to server 1!"));
app.get("/data", async (_, res) => {
  try {
    const cachedData = await redisChannel.get("key");
    if (cachedData) {
      const results = JSON.parse(results);
      res.status(200).json({ message: "success", ...results });
      // ending the fn
      return;
    }

    const [data, _] = await getData();
    await cacheToRedis(data);

    res.status(200).json({ message: "success", isCached: "no", data });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }
});

app.post("/create", async (req, res) => {
  const { data } = req.body;
  try {
    const subscriberCount = await redisClient.publish(redisChannel, data);
    const delRes = await redisChannel.del("key");
    console.log(delRes);
    res.status(200).json({ message: "success", subscriberCount });
  } catch (error) {
    res.status(500).json({ message: "failure", error });
  }

  console.log(data);
});

app.listen(expressPort, () => console.log(`served on port ${expressPort}`));
