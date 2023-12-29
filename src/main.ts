import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from 'node-fetch';

import {
  generateWallet,
  getRelayerWallet, startBackgroundTask,
} from "./modules/aztec";
import { BarretenbergSync } from "@aztec/bb.js";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

app.get('/relayerWallet', async (req: Request, res: Response) => {
  const address = (await getRelayerWallet()).getAddress().toString();

  res.send({
    address
  });
});

app.listen(port, async () => {
  await BarretenbergSync.initSingleton();
  await generateWallet();
  const configRequest = await fetch(`${process.env.API_URL}/config`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  const response = await configRequest.json();
  process.env.WMATIC_ADDRESS = response.data.WMATIC;
  process.env.USDT_ADDRESS = response.data.USDT;
  process.env.BRIDGE_ADDRESS = response.data.bridge;

  const relayerAddress: string = (await getRelayerWallet()).getAddress().toString();
  const setRelayerRequest = await fetch(`${process.env.API_URL}/setRelayer`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: JSON.stringify({
      relayerAddress,
    }),
  });

  await startBackgroundTask();

  console.log(`Server is Fire at http://localhost:${port}`);
});