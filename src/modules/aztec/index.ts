import {AccountWalletWithPrivateKey, AztecAddress, createPXEClient, Fq, getSchnorrAccount,} from "@aztec/aztec.js";
// @ts-ignore
import {TokenContract} from "@aztec/noir-contracts/types";
import {bridgeContract} from "./fixtures/bridge";
import dotenv from "dotenv";

dotenv.config();

const pxe = createPXEClient(process.env.PXE_URL || "http://localhost:8080");
const accounts: AccountWalletWithPrivateKey[] = [];


export async function getRelayerWallet() {
  return loadWallet(0);
}

export async function generateWallet() {
  const encryptionPrivateKey = Fq.random();
  const signingPrivateKey = Fq.random();
  const wallet = await getSchnorrAccount(
    pxe,
    encryptionPrivateKey,
    signingPrivateKey
  ).waitDeploy();

  accounts.push(wallet)

  return {
    walletId: accounts.length - 1,
    walletAddress: wallet.getAddress().toString()
  }
}

export async function loadWallet(id: number) {
  return accounts[id]
}

export async function getBridge() {
  return bridgeContract.at(AztecAddress.fromString(process.env.BRIDGE_ADDRESS), await getRelayerWallet())
}

export async function getCounter(bridge: bridgeContract) {
  return Number(await bridge.methods.get_counter().view());
}

export async function getSwap(bridge: bridgeContract, counter: number) {
  return bridge.methods.get_swap(counter).view();
}

export async function executeL2Swap(bridge: bridgeContract, counter: number, outTokenAmount: number) {
  const tx = await bridge.methods.execute_swap_public(counter, outTokenAmount).send().wait();

  return tx.status;
}