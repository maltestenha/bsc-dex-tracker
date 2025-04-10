const express = require("express");
const cors = require("cors");
const Web3 = require("web3");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.static(__dirname));

const BSC_RPC = "https://bsc-dataseed.binance.org/";
const web3 = new Web3(new Web3.providers.HttpProvider(BSC_RPC));

const FACTORY_ADDRESS = "0xca143ce32fe78f1f7019d7d551a6402fc5350c73"; // PancakeSwap v2
const FACTORY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "token0", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "token1", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "pair", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "PairCreated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "allPairsLength",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "allPairs",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const factoryContract = new web3.eth.Contract(FACTORY_ABI, FACTORY_ADDRESS);

app.get("/api/pairs", async (req, res) => {
  try {
    const length = await factoryContract.methods.allPairsLength().call();
    const latestPairs = [];

    const count = 10;
    for (let i = length - 1; i >= length - count && i >= 0; i--) {
      const pair = await factoryContract.methods.allPairs(i).call();
      latestPairs.push({ index: i, address: pair });
    }

    res.json(latestPairs);
  } catch (error) {
    console.error("Error fetching pairs:", error);
    res.status(500).send("Error fetching data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
