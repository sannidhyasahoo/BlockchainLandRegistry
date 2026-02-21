const hre = require("hardhat");

async function main() {
    console.log("Compiling and preparing deployment...");

    // Grab the contract blueprint
    const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");

    // Deploy the contract to the blockchain
    const registry = await LandRegistry.deploy();

    // Wait for the transaction to be finalized
    await registry.waitForDeployment();

    // Print the final address so you can use it in your React frontend
    console.log("✅ LandRegistry successfully deployed to:", await registry.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});