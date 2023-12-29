import {executeL2Swap, getBridge, getCounter, getSwap} from "../aztec";
import { createL1Swap, executeL1Swap, getL1SwapData } from "../evm";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function startBackgroundTask(): Promise<void> {
    let processedCounter = 0;
    const bridge = await getBridge();
    while (true) {
        const counter = await getCounter(bridge);
        if (counter > processedCounter) {
            const swap = await getSwap(bridge, processedCounter);

            if (Number(swap.is_executed) === 0) {
                console.log(`[swap #${processedCounter}] found`);
                const swapData = {
                    id: processedCounter,
                    isPrivate: Boolean(swap.is_private),
                    inTokenId: String(swap.in_token_id),
                    outTokenId: String(swap.out_token_id),
                    inTokenAmount: String(swap.in_token_amount),
                    l2Address: String(swap.l2_address),
                    l2SecretHash: String(swap.l2_secret_hash)
                }
                let l1SwapData = await getL1SwapData(processedCounter);
                if (!l1SwapData.executed) {
                    console.log(`[swap #${processedCounter}] not executed on L1`);
                    if (!l1SwapData.created) {
                        console.log(`[swap #${processedCounter}] not created on L1`);
                        const creationStatus = await createL1Swap(swapData);
                        await sleep(120000);

                        console.log(`[swap #${processedCounter}] created on L1 with status ${creationStatus}`);
                    }
                    const l1ExecutionStatus = await executeL1Swap(processedCounter);
                    await sleep(120000);

                    console.log(`[swap #${processedCounter}] executed on L1 with status ${l1ExecutionStatus}`);
                } else {
                    console.log(`[swap #${processedCounter}] already executed on L1`);
                }
                l1SwapData = await getL1SwapData(processedCounter);
                const l2ExecutionStatus = await executeL2Swap(bridge, processedCounter, Number(l1SwapData.outTokenAmount));
                console.log(`[swap #${processedCounter}] executed on L2 with status ${l2ExecutionStatus}`);
            }
            processedCounter++;
            await sleep(5000);
        }

        await sleep(1000);
    }
}