import fs from 'fs';
import { ethers } from 'ethers';
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.L1_RPC_URL);
const relayer = new ethers.Wallet(process.env.L1_PRIVATE_KEY || "", provider);
const contract = new ethers.Contract(
    process.env.L1_BRIDGE_ADDRESS || "",
    JSON.parse(fs.readFileSync('./src/modules/evm/artifacts/Bridge.json').toString()).abi,
    relayer
);

export async function getL1SwapData(swapId: number) {
    const result = {
        created: false,
        executed: false,
        outTokenAmount: 0
    };
    const swapData = await contract.swaps(swapId);
    if (Number(swapData.inTokenId) !== 0) {
        result.created = true;
    }
    if (Boolean(swapData.isExecuted)) {
        result.executed = true;
    }
    result.outTokenAmount = swapData.outTokenAmount;

    return result;
}

export async function createL1Swap(swapData: { id: any; isPrivate: any; inTokenId: any; outTokenId: any; inTokenAmount: any; l2Address: any; l2SecretHash: any; }) {
    const tx = await contract.createSwap(
        swapData.id,
        swapData.isPrivate,
        swapData.inTokenId,
        swapData.outTokenId,
        swapData.inTokenAmount,
        swapData.l2Address,
        swapData.l2SecretHash
    );
    tx.wait();

    return true;
}

export async function executeL1Swap(counter: number) {
    const tx = await contract.executeSwap(counter);
    tx.wait();

    return true;
}
