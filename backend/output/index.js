"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const key_1 = __importDefault(require("./key"));
const fetch = require('node-fetch');
const serviceAccount = require('../service-account.json');
const base = 'https://cloud.iexapis.com/v1/stock/';
const baseMethod = '/quote/latestPrice';
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
});
const db = firebase_admin_1.default.firestore();
const app = express_1.default();
app.use(cors_1.default());
app.use(express_1.default.static(path_1.default.join(__dirname, '../frontend/build')));
const port = 8080;
app.use(express_1.default.json());
const stocksCollection = db.collection('stocks');
const usersCollection = db.collection('users');
// get all stocks
app.get('/stocks', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stocks = yield stocksCollection.orderBy('name').get();
    res.json(stocks.docs.map((doc) => {
        const stock = doc.data();
        return Object.assign(Object.assign({}, stock), { id: doc.id });
    }));
}));
// get all stocks for a user given user id
app.get('/userStocks/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.params.userId;
    const stocks = yield usersCollection.doc(user_id).collection('stocks').get();
    res.json(stocks.docs.map((doc) => {
        const stock = doc.data();
        return Object.assign(Object.assign({}, stock), { id: doc.id });
    }));
}));
// make a user
app.post('/createUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // admin.auth().verifyIdToken(req.headers.idtoken as string)
    //   .then(async () => {
    //     const newUser: User = req.body;
    //     const addedUser = await usersCollection.add(newUser);
    //     res.send(addedUser.id);
    //   })
    //   .catch(() => res.send('auth error'));
    // const newUser: User = req.body;
    // const addedUser = await usersCollection.add(newUser);
    // res.send(addedUser.id);
    const name = req.query.name;
    const user_id = req.query.userId;
    // const user_id: string = req.body;
    yield usersCollection.doc(user_id).set({ name: name });
    // .then(() => {
    //   console.log("Document successfully written!");
    // })
    // .catch((error) => {
    //   console.error("Error writing document: ", error);
    // });
}));
app.post('/userstocks/:userid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.params.userid;
    const name = req.query.name;
    const user = yield usersCollection.doc(user_id).get();
    if (!user.exists) {
        res.send('User not found!');
    }
    else {
        const matchingStocks = yield usersCollection.doc(user_id).collection('stocks').where('name', '==', name).get();
        if (matchingStocks.empty) {
            let userStock = {
                name: name,
                price: 0,
                favorite: false,
                num_shares: 0
            };
            fetch('http://localhost:8080/stock?name=' + name, {
                method: "POST",
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then((res) => res.json())
                .then((data) => __awaiter(void 0, void 0, void 0, function* () {
                if (!(data.price)) {
                    res.send('Invalid stock');
                }
                else {
                    userStock.price = data.price;
                    yield usersCollection.doc(user_id).collection('stocks').add(userStock);
                    res.send(userStock);
                }
            }))
                .catch(() => res.send('Invalid stock'));
        }
        else {
            matchingStocks.forEach(doc => {
                fetch('http://localhost:8080/stock?name=' + name, {
                    method: "POST",
                    headers: {
                        'content-type': 'application/json'
                    }
                })
                    .then((res) => res.json())
                    .then((data) => __awaiter(void 0, void 0, void 0, function* () {
                    if (!(data.price)) {
                        res.send('Invalid stock');
                    }
                    else {
                        yield usersCollection.doc(user_id).collection('stocks').doc(doc.id).update({ price: data.price });
                        ;
                        res.send("Stock updated");
                    }
                }))
                    .catch(() => res.send('Invalid stock'));
            });
        }
    }
}));
app.post('/transaction/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.params.userId;
    const name = req.query.name;
    const numShares = req.body.shares;
    let type = req.query.type;
    if (type.toLowerCase() !== 'buy' && type.toLowerCase() !== 'sell') {
        res.send('invalid query');
        return;
    }
    const user = yield usersCollection.doc(user_id).get();
    if (!user.exists) {
        res.send('User not found!');
    }
    else {
        const matchingStocks = yield usersCollection.doc(user_id).collection('stocks').where('name', '==', name).get();
        let shares = 0;
        if (matchingStocks.empty) {
            res.send("Stock not found");
        }
        else {
            matchingStocks.forEach((doc) => __awaiter(void 0, void 0, void 0, function* () {
                shares = doc.get('num_shares');
                if (type.toLowerCase() === 'buy') {
                    yield usersCollection.doc(user_id).collection('stocks').doc(doc.id).update({ num_shares: shares + numShares });
                    res.send('updated!');
                }
                else {
                    if (shares < numShares) {
                        res.send('Not enough shares to sell!');
                    }
                    else {
                        yield usersCollection.doc(user_id).collection('stocks').doc(doc.id).update({ num_shares: shares - numShares });
                        res.send('updated!');
                    }
                }
            }));
        }
    }
}));
app.post('/stock', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.query.name;
    const matchingStocks = yield stocksCollection.where('name', '==', name).get();
    if (matchingStocks.empty) {
        fetch(base + name + baseMethod + '?token=' + key_1.default, {
            method: "GET",
            headers: {
                'content-type': 'application/json'
            }
        })
            .then((result) => result.text())
            .then((data) => __awaiter(void 0, void 0, void 0, function* () {
            if (data === 'Unknown symbol' || data === "Not found") {
                res.send("Invalid stock!");
            }
            else {
                const stock = {
                    name: name,
                    price: data
                };
                yield stocksCollection.add(stock);
                res.send(stock);
            }
        }));
    }
    else {
        matchingStocks.forEach(doc => {
            fetch(base + name + baseMethod + '?token=' + key_1.default, {
                method: "GET",
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then((result) => result.text())
                .then((data) => __awaiter(void 0, void 0, void 0, function* () {
                if (data === 'Unknown symbol' || data === "Not found") {
                    res.send("Invalid stock!");
                }
                else {
                    const stock = {
                        name: name,
                        price: data
                    };
                    yield stocksCollection.doc(doc.id).update(stock);
                    res.send(stock);
                }
            }));
        });
    }
    // 
    // 
}));
app.post('/favorite/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.params.userId;
    const name = req.query.name;
    const user = yield usersCollection.doc(user_id).get();
    if (!user.exists) {
        res.send('User not found!');
    }
    else {
        const matchingStocks = yield usersCollection.doc(user_id).collection('stocks').where('name', '==', name).get();
        let favorite = false;
        if (matchingStocks.empty) {
            res.send("Stock not found");
        }
        else {
            matchingStocks.forEach((doc) => __awaiter(void 0, void 0, void 0, function* () {
                favorite = doc.get('favorite');
                yield usersCollection.doc(user_id).collection('stocks').doc(doc.id).update({ favorite: !favorite });
                res.send("updated!");
            }));
        }
    }
}));
// delete a stock given user id and stock id
app.delete('/deleteStock/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.params.userId;
    const name = req.query.name;
    const user = yield usersCollection.doc(user_id).get();
    if (!user.exists) {
        res.send('User not found!');
    }
    else {
        const matchingStocks = yield usersCollection.doc(user_id).collection('stocks').where('name', '==', name).get();
        if (matchingStocks.empty) {
            res.send("Stock not found");
        }
        else {
            matchingStocks.forEach((doc) => __awaiter(void 0, void 0, void 0, function* () {
                yield usersCollection.doc(user_id).collection('stocks').doc(doc.id).delete();
                res.send("Stock deleted!");
            }));
        }
    }
}));
app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`));
