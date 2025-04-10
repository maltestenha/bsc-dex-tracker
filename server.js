const express = require('express');
const cors = require('cors');
const Web3 = require('web3');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.static(__dirname)); // Damit index.html geladen werden kann

const bscRpc = 'https://bsc-dataseed.binance.org/';
const web3 = new Web3(new Web3.providers.HttpProvider(bscRpc));

const factoryAddress = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73';
const factoryAbi = [{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"allPairsLen...

const factoryContract = new web3.eth.Contract(factoryAbi, factoryAddress);

app.get('/api/pairs', async (req, res) => {
    try {
        const length = await factoryContract.methods.allPairsLength().call();
        const latestPairs = [];

        const fetchCount = 10;
        for (let i = length - 1; i >= length - fetchCount; i--) {
            const pairAddress = await factoryContract.methods.allPairs(i).call();
            latestPairs.push({ index: i, address: pairAddress });
        }

        res.json(latestPairs);
    } catch (error) {
        console.error('Error fetching pairs:', error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(port, () => {
    console.log(`BSC DEX Tracker running at http://localhost:${port}`);
});