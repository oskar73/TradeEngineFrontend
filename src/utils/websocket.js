const WebSocket = require('ws');

var reconnectInterval = 1000
var ws;

var connect = function () {

    const ws = new WebSocket('wss://marketdata.tradermade.com/feedadv');

    ws.on('open', function open() {
        ws.send('{"userKey":"wsx87-Jw_pCkochqfjRA", "symbol":"EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, USDCHF"}');;
    });

    ws.on('close', function() {
        console.log('socket close : will reconnect in ' + reconnectInterval );
        setTimeout(connect, reconnectInterval)
    });

    ws.onmessage = (event) => {
        const data = event.data;
        console.log("data : ", data);
    };
};
connect();
