import {
  AccountWalletWithPrivateKey,
  AztecAddress,
  computeAuthWitMessageHash,
  computeMessageSecretHash,
  createPXEClient,
  ExtendedNote,
  Fq,
  Fr,
  getSchnorrAccount,
  Note
} from "@aztec/aztec.js";
// @ts-ignore
import {TokenContract} from "@aztec/noir-contracts/types";
import {bridgeContract} from "./fixtures/bridge";

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

export async function startBackgroundTask(): Promise<void> {
  let processedCounter = 0;
  const bridge = await bridgeContract.at(AztecAddress.fromString(process.env.BRIDGE_ADDRESS), await getRelayerWallet());
  setInterval(async () => {
    const counter = Number(await bridge.methods.get_counter().view());
    if (counter > processedCounter) {
      const swap = await bridge.methods.get_swap(processedCounter).view();

      // create new swap on L1
      // if swap was not executed on L2
      // if wasn't executed on L1
      // createSwap on L1
      // executeSwap on L1
      // executeSwap on L2

      processedCounter++;
    }
  }, 5000);
}