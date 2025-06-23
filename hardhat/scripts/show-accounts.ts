import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  for (const signer of signers) {
    console.log(await signer.getAddress());
  }
}

main();