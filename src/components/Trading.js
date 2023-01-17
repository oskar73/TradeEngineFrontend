const axios = require('axios');
const _ = require('lodash');
const WebSocket = require('ws');

const pipSizes = {
    major_pairs: 0.0001,
    jpy_pairs: 0.01,
    oils: 0.01,
    metals: 0.01,
    cryptos: 0.0001,
    indices: 1
};

const ws = new WebSocket.Server({ port: 8080 });
let trading = false;
let currentPrices = {};

const getRealTimeData = async (symbol) => {
    try {
        const data = currentPrices[symbol];
        const value = data.value;
        const chg = data.chg; 
        const bid = value - chg / 2;
        const ask = value + chg / 2;
        return { bid, ask };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
    }
};

const executeOrder = (symbol, orderType, size, price) => {
    const latency = _.random(0, 0.1);
    const slippage = _.random(-0.0001, 0.0001);
    const executedPrice = price + slippage;
    return executedPrice;
};

const calculatePips = (entryPrice, exitPrice, assetType) => {
    const pipSize = pipSizes[assetType];
    return (exitPrice - entryPrice) / pipSize;
};

const checkStopLossTakeProfit = (currentPrice, stopLoss, takeProfit, entryPrice) => {
    if (currentPrice <= stopLoss) {
        return { action: 'stop_loss', price: currentPrice };
    } else if (currentPrice >= takeProfit) {
        return { action: 'take_profit', price: currentPrice };
    }
    return { action: null, price: null };
};

class Position {
    constructor(symbol, size, entryPrice, assetType, side, createdAt) {
        this.symbol = symbol;
        this.size = size;
        this.entryPrice = entryPrice;
        this.assetType = assetType;
        this.side = side;  // Buy or Sell
        this.createdAt = createdAt;
        this.stopLoss = entryPrice * (side === 'buy' ? (1 - 0.01) : (1 + 0.01));
        this.takeProfit = entryPrice * (side === 'buy' ? (1 + 0.02) : (1 - 0.02));
        this.unrealizedPnL = 0;
        this.realizedPnL = 0;
    }

    updateUnrealizedPnL(currentPrice) {
        const pips = calculatePips(this.entryPrice, currentPrice, this.assetType);
        this.unrealizedPnL = pips * this.size;
    }
}

class Account {
    constructor(balance) {
        this.balance = balance;
        this.positions = [];
        this.closedPositions = [];
    }

    openPosition(symbol, size, entryPrice, assetType, side) {
        const createdAt = new Date().toISOString();
        const position = new Position(symbol, size, entryPrice, assetType, side, createdAt);
        this.positions.push(position);
    }

    closePosition(position, exitPrice) {
        const pips = calculatePips(position.entryPrice, exitPrice, position.assetType);
        position.realizedPnL = pips * position.size;
        this.balance += position.realizedPnL;
        position.closedAt = new Date().toISOString();
        position.exitPrice = exitPrice;
        this.closedPositions.push(position);
        this.positions = this.positions.filter(p => p !== position);
    }

    updatePositions(currentPrices) {
        this.positions.forEach(position => {
            position.updateUnrealizedPnL(currentPrices[position.symbol]);
        });
    }

    getPositionsData() {
        return this.positions.map(position => ({
            instrument: position.symbol,
            side: position.side,
            size: position.size,
            entryPrice: position.entryPrice,
            stopLoss: position.stopLoss,
            takeProfit: position.takeProfit,
            createdAt: position.createdAt,
            unrealizedPnL: position.unrealizedPnL,
            positionId: _.uniqueId('pos_')
        }));
    }

    getClosedPositionsData() {
        return this.closedPositions.map(position => ({
            instrument: position.symbol,
            side: position.side,
            size: position.size,
            entryPrice: position.entryPrice,
            exitPrice: position.exitPrice,
            stopLoss: position.stopLoss,
            takeProfit: position.takeProfit,
            createdAt: position.createdAt,
            closedAt: position.closedAt,
            realizedPnL: position.realizedPnL,
            positionId: _.uniqueId('pos_'),
            reasonForClosing: position.realizedPnL >= 0 ? 'take_profit' : 'stop_loss'
        }));
    }

    toJSON() {
        return {
            balance: this.balance,
            openPositions: this.getPositionsData(),
            closedPositions: this.getClosedPositionsData()
        };
    }
}

const account = new Account(100000);  // Starting with $100,000

const tradingLoop = async () => {
    const symbols = ['EURUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'US30'];
    const assetTypes = ['major_pairs', 'jpy_pairs', 'metals', 'cryptos', 'indices'];
    const sides = ['buy', 'sell'];
    const stopLossPercentage = 0.01;
    const takeProfitPercentage = 0.02;

    while (trading) {
        account.updatePositions(currentPrices);

        for (const position of account.positions) {
            const currentPrice = currentPrices[position.symbol];
            const stopLoss = position.entryPrice * (1 - stopLossPercentage);
            const takeProfit = position.entryPrice * (1 + takeProfitPercentage);
            const { action, price } = checkStopLossTakeProfit(currentPrice, stopLoss, takeProfit, position.entryPrice);

            if (action) {
                account.closePosition(position, price);
            }
        }

        for (const [index, symbol] of symbols.entries()) {
            const assetType = assetTypes[index];
            const size = 10000;
            const side = sides[Math.floor(Math.random() * sides.length)];
            const { bid, ask } = await getRealTimeData(symbol);
            const entryPrice = (bid + ask) / 2;
            account.openPosition(symbol, size, entryPrice, assetType, side);
        }

        // Send the account data to the client
        ws.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(account.toJSON()));
            }
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};

ws.on('connection', socket => {
    socket.on('message', message => {
        const { action, symbol } = JSON.parse(message);

        if (action === 'start') {
            trading = true;
            tradingLoop(symbol);
        } else if (action === 'stop') {
            trading = false;
        }
    });

    socket.on('close', () => {
        trading = false;
    });
});

ws.on('message', data => {
    currentPrices = JSON.parse(data).reduce((acc, item) => {
        acc[item.key] = { value: parseFloat(item.value), chg: parseFloat(item.chg) };
        return acc;
    }, {});
});