require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true, // This tells the compiler to compress the code
                runs: 200
            }
        }
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545"
        },
        amoy: {
            url: process.env.ALCHEMY_AMOY_URL,
            accounts: [process.env.PRIVATE_KEY]
        }
    }
};