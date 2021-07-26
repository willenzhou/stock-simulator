import key from "./key";
const fetch = require("node-fetch")
const base = 'https://cloud.iexapis.com/v1/stock/twitter/quote/latestPrice'
fetch(base + '?token=' + key, {
    method: "GET",
    headers: {
        'content-type': 'application/json'
    }
})
.then((res: { text: () => any; }) => res.text())
.then((data: any) => {
    if (data === 'Unknown symbol') {
        console.log("Can't find stock!")
    } else (console.log(data))
}
)
