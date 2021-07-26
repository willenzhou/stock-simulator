"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const key_1 = __importDefault(require("./key"));
const fetch = require("node-fetch");
const base = 'https://cloud.iexapis.com/v1/stock/twitter/quote/latestPrice';
fetch(base + '?token=' + key_1.default, {
    method: "GET",
    headers: {
        'content-type': 'application/json'
    }
})
    .then((res) => res.text())
    .then((data) => {
    if (data === 'Unknown symbol') {
        console.log("Can't find stock!");
    }
    else
        (console.log(data));
});
