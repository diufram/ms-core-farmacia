import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const SalesRegistry = await hre.ethers.getContractFactory("SalesRegistry");
  const salesRegistry = await SalesRegistry.deploy();

  await salesRegistry.waitForDeployment();

  const targetAddress = await salesRegistry.getAddress();
  console.log("SalesRegistry deployed to:", targetAddress);

  // The environment variables are already handled in the main .env

  console.log("Environment variables written to:", addressFilePath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
