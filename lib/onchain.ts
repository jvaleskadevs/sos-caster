"use server";

import { Address, createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { DIAMOND_LABS_TOKEN_ADDRESS } from "@/constants";
import { erc20Abi } from "@/abis";

const publicClient = await createPublicClient({
  chain: base,
  transport: http(process.env.ALCHEMY_RPC_BASE_URL ?? "")
});

export async function isDiamondLabsHolder(address: Address): Promise<boolean> {
  const balance = await publicClient.readContract({
    address: DIAMOND_LABS_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address]
  });
  
  return typeof balance === "bigint" && balance > BigInt(0);
}
