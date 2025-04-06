require('dotenv').config();

const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = new Alpaca({
    keyId: process.env.APCA_API_KEY_ID,
    secretKey: process.env.APCA_API_SECRET_KEY,
    paper: true, // use paper trading environment
  });

// Get our account information.
alpaca.getAccount().then((account) => {
  // Check if our account is restricted from trading.
  if (account.trading_blocked) {
    console.log("Account is currently restricted from trading.");
  }

  const accountBuyingPower = account.buying_power;
  console.log(accountBuyingPower);

  const balanceChange = account.equity - account.last_equity;
  console.log(balanceChange)
});

alpaca.getPositions().then((portfolio) => {
  // Print the quantity of shares for each position.
  portfolio.forEach(function (position) {
    console.log(`${position.qty} shares of ${position.symbol}`);
  });
});




