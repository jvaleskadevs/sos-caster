"use server";

import { Address, createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { DIAMOND_LABS_TOKEN_ADDRESS, DIAMOND_LABS_SPENDER_ADDRESS } from "@/constants";
import { erc20Abi } from "@/abis";

const publicClient = await createPublicClient({
  chain: base,
  transport: http(process.env.ALCHEMY_RPC_BASE_URL ?? "")
});

export async function isDiamondLabsHolder(
  address: Address, 
  amount: bigint = BigInt(0)
): Promise<boolean> {
  const balance = await publicClient.readContract({
    address: DIAMOND_LABS_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address]
  });
  
  return typeof balance === "bigint" && balance > amount;
}

export async function hasEnoughAllowance(
  owner: Address, 
  spender: Address = DIAMOND_LABS_SPENDER_ADDRESS, 
  token: Address = DIAMOND_LABS_TOKEN_ADDRESS, 
  amount: bigint = BigInt(0)
): Promise<boolean> {
  const allowance = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, spender]
  });

  return typeof allowance === "bigint" && allowance >= amount;
}
