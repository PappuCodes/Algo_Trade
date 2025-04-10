const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = new Alpaca(); // uses env vars
const WebSocket = require('ws');

const wss = new WebSocket("wss://stream.data.alpaca.markets/v1beta1/news");

wss.on('open', function(){
    console.log("Websocket connected");

    const authMsg = {
        action: 'auth',
        key: process.env.APCA_API_KEY_ID,
        secret: process.env.APCA_API_SECRET_KEY
    };

    wss.send(JSON.stringify(authMsg));

    const subscribeMsg = {
        action: 'subscribe',
        news: ['*'],
    };
    wss.send(JSON.stringify(subscribeMsg));
});

wss.on('message', async function(message) {
    console.log("Raw message:", message);

    try {
        const parsed = JSON.parse(message);
        const events = Array.isArray(parsed) ? parsed : [parsed];

        for (const event of events) {
            if (event.T === "n" && Array.isArray(event.symbols) && event.symbols.length > 0) {
                const tickerSymbol = event.symbols[0];
                const headline = event.headline;
                console.log(`${headline} 🗞 News came in for ${tickerSymbol}, placing order...`);

                try {
                    const order = await alpaca.createOrder({
                        symbol: tickerSymbol,
                        qty: 1,
                        side: 'sell',
                        type: 'market',
                        time_in_force: 'day'
                    });

                    console.log(`💸 Selling ${tickerSymbol}: ${order.id}`);
                } catch (orderErr) {
                    console.error(`❌ Order failed for ${tickerSymbol}:`, orderErr.message);
                }
            } else {
                console.log(" ℹ️ Non-news or untradeable message:", event);
            }
        }
    } catch (err) {
        console.error("🚨 Failed to parse message:", err.message);
    }
});

