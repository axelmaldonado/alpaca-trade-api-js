"use strict";

require("dotenv").config();

const api = require("./api");
const account = require("./resources/account");
const position = require("./resources/position");
const calendar = require("./resources/calendar");
const clock = require("./resources/clock");
const asset = require("./resources/asset");
const order = require("./resources/order");
const data = require("./resources/data");
const watchlist = require("./resources/watchlist");
const polygon = require("./resources/polygon");
const dataV2 = require("./resources/datav2/rest_v2");

const websockets = require("./resources/websockets");
const websockets_v2 = require("./resources/datav2/stock_websockets_v2");
const crypto_websocket = require("./resources/datav2/crypto_websocket_v2");

function Alpaca(config = {}) {
  this.configuration = {
    baseUrl:
      config.baseUrl ||
      process.env.APCA_API_BASE_URL ||
      (config.paper
        ? "https://paper-api.alpaca.markets"
        : "https://api.alpaca.markets"),
    dataBaseUrl:
      config.dataBaseUrl ||
      process.env.APCA_DATA_BASE_URL ||
      process.env.DATA_PROXY_WS ||
      "https://data.alpaca.markets",
    dataStreamUrl:
      config.dataStreamUrl ||
      process.env.APCA_API_STREAM_URL ||
      "https://stream.data.alpaca.markets",
    polygonBaseUrl:
      config.polygonBaseUrl ||
      process.env.POLYGON_API_BASE_URL ||
      "https://api.polygon.io",
    keyId: config.keyId || process.env.APCA_API_KEY_ID || "",
    secretKey: config.secretKey || process.env.APCA_API_SECRET_KEY || "",
    apiVersion: config.apiVersion || process.env.APCA_API_VERSION || "v2",
    oauth: config.oauth || process.env.APCA_API_OAUTH || "",
    usePolygon: config.usePolygon ? true : false, // should we use polygon
    // data or alpaca data
    feed: config.feed || "iex", // use 'sip' if you have PRO subscription
    verbose: config.verbose,
    exchanges: config.exchanges || [], // should be a string with comma separated exchanges
    // or a list of strings
  };
  this.data_ws = new websockets.AlpacaStreamClient({
    url: this.configuration.usePolygon
      ? this.configuration.baseUrl
      : this.configuration.dataBaseUrl,
    apiKey: this.configuration.keyId,
    secretKey: this.configuration.secretKey,
    oauth: this.configuration.oauth,
    usePolygon: this.configuration.usePolygon,
  });
  this.data_ws.STATE = websockets.STATE;
  this.data_ws.EVENT = websockets.EVENT;
  this.data_ws.ERROR = websockets.ERROR;

  this.trade_ws = new websockets.AlpacaStreamClient({
    url: this.configuration.baseUrl,
    apiKey: this.configuration.keyId,
    secretKey: this.configuration.secretKey,
    oauth: this.configuration.oauth,
    usePolygon: this.configuration.usePolygon,
  });
  this.trade_ws.STATE = websockets.STATE;
  this.trade_ws.EVENT = websockets.EVENT;
  this.trade_ws.ERROR = websockets.ERROR;

  this.data_stream_v2 = new websockets_v2.AlpacaStocksClient({
    url: this.configuration.dataStreamUrl,
    feed: this.configuration.feed,
    apiKey: this.configuration.keyId,
    secretKey: this.configuration.secretKey,
    verbose: this.configuration.verbose,
  });

  this.adjustment = dataV2.ADJUSTMENT;
  this.crypto_stream_v2 = new crypto_websocket.AlpacaCryptoClient({
    url: this.configuration.dataStreamUrl,
    apiKey: this.configuration.keyId,
    secretKey: this.configuration.secretKey,
    exchanges: this.configuration.exchanges,
    verbose: this.configuration.verbose,
  });
}

// Helper methods
Alpaca.prototype.httpRequest = api.httpRequest;
Alpaca.prototype.dataHttpRequest = api.dataHttpRequest;
Alpaca.prototype.polygonHttpRequest = api.polygonHttpRequest;

// Account
Alpaca.prototype.getAccount = account.get;
Alpaca.prototype.updateAccountConfigurations = account.updateConfigs;
Alpaca.prototype.getAccountConfigurations = account.getConfigs;
Alpaca.prototype.getAccountActivities = account.getActivities;
Alpaca.prototype.getPortfolioHistory = account.getPortfolioHistory;

// Positions
Alpaca.prototype.getPositions = position.getAll;
Alpaca.prototype.getPosition = position.getOne;
Alpaca.prototype.closeAllPositions = position.closeAll;
Alpaca.prototype.closePosition = position.closeOne;

// Calendar
Alpaca.prototype.getCalendar = calendar.get;

// Clock
Alpaca.prototype.getClock = clock.get;

// Asset
Alpaca.prototype.getAssets = asset.getAll;
Alpaca.prototype.getAsset = asset.getOne;

// Order
Alpaca.prototype.getOrders = order.getAll;
Alpaca.prototype.getOrder = order.getOne;
Alpaca.prototype.getOrderByClientId = order.getByClientOrderId;
Alpaca.prototype.createOrder = order.post;
Alpaca.prototype.replaceOrder = order.patchOrder;
Alpaca.prototype.cancelOrder = order.cancel;
Alpaca.prototype.cancelAllOrders = order.cancelAll;

// Data
Alpaca.prototype.getAggregates = data.getAggregates;
Alpaca.prototype.getBars = data.getBars;
Alpaca.prototype.lastTrade = data.getLastTrade; // getLastTrade is already preserved for polygon
Alpaca.prototype.lastQuote = data.getLastQuote; // getLastQuote is already preserved for polygon

//DataV2
Alpaca.prototype.getTradesV2 = dataV2.getTrades;
Alpaca.prototype.getBarsV2 = dataV2.getBars;
Alpaca.prototype.getQuotesV2 = dataV2.getQuotes;
Alpaca.prototype.getMultiTradesV2 = dataV2.getMultiTrades;
Alpaca.prototype.getMultiTradesAsyncV2 = dataV2.getMultiTradesAsync;
Alpaca.prototype.getMultiQuotesV2 = dataV2.getMultiQuotes;
Alpaca.prototype.getMultiQuotesAsyncV2 = dataV2.getMultiQuotesAsync;
Alpaca.prototype.getMultiBarsV2 = dataV2.getMultiBars;
Alpaca.prototype.getMultiBarsAsync = dataV2.getMultiBarsAsync;
Alpaca.prototype.getLatestTrade = dataV2.getLatestTrade;
Alpaca.prototype.getLatestQuote = dataV2.getLatestQuote;
Alpaca.prototype.getSnapshot = dataV2.getSnapshot;
Alpaca.prototype.getSnapshots = dataV2.getSnapshots;
Alpaca.prototype.getCryptoTrades = dataV2.getCryptoTrades;
Alpaca.prototype.getCryptoQuotes = dataV2.getCryptoQuotes;
Alpaca.prototype.getCryptoBars = dataV2.getCryptoBars;
Alpaca.prototype.getLatestCryptoTrade = dataV2.getLatestCryptoTrade;
Alpaca.prototype.getLatestCryptoQuote = dataV2.getLatestCryptoQuote;
Alpaca.prototype.getLatestCryptoXBBO = dataV2.getLatestCryptoXBBO;

// Watchlists
Alpaca.prototype.getWatchlists = watchlist.getAll;
Alpaca.prototype.getWatchlist = watchlist.getOne;
Alpaca.prototype.addWatchlist = watchlist.addWatchlist;
Alpaca.prototype.addToWatchlist = watchlist.addToWatchlist;
Alpaca.prototype.updateWatchlist = watchlist.updateWatchlist;
Alpaca.prototype.deleteWatchlist = watchlist.deleteWatchlist;
Alpaca.prototype.deleteFromWatchlist = watchlist.deleteFromWatchlist;

// Polygon
Alpaca.prototype.getExchanges = polygon.exchanges;
Alpaca.prototype.getSymbolTypeMap = polygon.symbolTypeMap;
Alpaca.prototype.getHistoricTradesV2 = polygon.historicTradesV2;
Alpaca.prototype.getHistoricQuotesV2 = polygon.historicQuotesV2;
Alpaca.prototype.getHistoricAggregatesV2 = polygon.historicAggregatesV2;
Alpaca.prototype.getLastTrade = polygon.lastTrade;
Alpaca.prototype.getLastQuote = polygon.lastQuote;
Alpaca.prototype.getConditionMap = polygon.conditionMap;
Alpaca.prototype.getCompany = polygon.company;
Alpaca.prototype.getDividends = polygon.dividends;
Alpaca.prototype.getFinancials = polygon.financials;
Alpaca.prototype.getSplits = polygon.splits;
Alpaca.prototype.getNews = polygon.news;
Alpaca.prototype.getSymbol = polygon.getSymbol;

module.exports = Alpaca;
