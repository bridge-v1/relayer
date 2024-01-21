import dotenv from "dotenv";
import fetch from 'node-fetch';

import {
  generateWallet,
  getRelayerWallet,
} from "./modules/aztec";

import { startBackgroundTask } from "./modules/base";
import { BarretenbergSync } from "@aztec/bb.js";

dotenv.config();

async function run() {

  await BarretenbergSync.initSingleton();
  await generateWallet();
  const configRequest = await fetch(`${process.env.API_URL}/config`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  const response = await configRequest.json();
  // @ts-ignore
  process.env.BRIDGE_ADDRESS = response.data.bridge;

  const relayerAddress: string = (await getRelayerWallet()).getAddress().toString();
  const setRelayerRequest = await fetch(`${process.env.API_URL}/setRelayer`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ relayerAddress }),
  });

  console.log('all set. starting...')

  await startBackgroundTask();
}

run();
