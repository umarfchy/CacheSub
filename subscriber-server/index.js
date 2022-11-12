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

// configs
const redisUrl = `redis://${redisUsername}:${redisPassword}@${redisHost}:${redisPort}`;
const dbConfig = {
  host: sqlHost,
  user: sqlUser,
  password: sqlPassword,
  database: sqlDatabase,
};

// helper fn for DB
const createData = async (data) => {
  const sqlQuery = `INSERT INTO ${sqlTable} (data) VALUES ('${data}')`;
  const sqlConnection = await mysql.createConnection(dbConfig);
  return sqlConnection.execute(sqlQuery);
};

const subscriber = createClient({ url: redisUrl });
(async function () {
  try {
    subscriber.connect();

    // redis status logger
    subscriber.on("error", (err) => console.log("Redis error", err));
    subscriber.on("connect", () => console.log("\n Connected to Redis \n"));
    subscriber.on("ready", () => console.log("\n Redis ready for action! \n"));
    subscriber.on("reconnecting", () => {
      console.log("\nReconnecting to Redis...\n");
    });

    // call back fn is required
    subscriber.subscribe(channel, async (message) => {
      console.log("subscriber service:- ", message);
      await createData(message);
    });
  } catch (error) {
    // exited the reconnection logic
    console.error({ error });
  }
})();
