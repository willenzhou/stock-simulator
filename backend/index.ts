import admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import path from 'path';
import key from "./key";

const fetch = require('node-fetch')
const serviceAccount = require('../service-account.json');
const base = 'https://cloud.iexapis.com/v1/stock/'
const baseMethod = '/quote/latestPrice'
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend/build')))
const port = 8080;
app.use(express.json());

type StockInfo = {
  name: string;
  price: number;
  favorite: boolean;
  num_shares: number;
}

type StockInfoWithID = StockInfo & {
  id: string;
};


type Stock = {
  name: string;
  price: number;
};

type StockWithID = Stock & {
  id: string;
};

type User = {
  name: string;
  // firebase_id: string;
};

type UserWithID = User & {
  id: string;
};

const stocksCollection = db.collection('stocks');
const usersCollection = db.collection('users');

app.get('/', (req, res) => {
  res.send('it is working!')
});


// get all stocks
app.get('/stocks', async (_, res) => {
  const stocks = await stocksCollection.orderBy('name').get();
  res.json(
    stocks.docs.map(
      (doc): StockWithID => {
        const stock = doc.data() as Stock;
        return { ...stock, id: doc.id };
      }
    )
  );
});





// get all stocks for a user given user id
app.get('/userStocks/:userId', async (req, res) => {
  const user_id = req.params.userId;
  const stocks = await usersCollection.doc(user_id as string).collection('stocks').get();
  res.json(
    stocks.docs.map(
      (doc): StockInfoWithID => {
        const stock = doc.data() as StockInfo;
        return { ...stock, id: doc.id };
      }
    )
  );
});


// make a user
app.post('/createUser', async (req, res) => {
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
  const name = req.query.name as string;
  const user_id = req.query.userId as string;
  // const user_id: string = req.body;
  await usersCollection.doc(user_id as string).set({ name: name })
  // .then(() => {
  //   console.log("Document successfully written!");
  // })
  // .catch((error) => {
  //   console.error("Error writing document: ", error);
  // });
});


app.post('/userstocks/:userid', async (req, res) => {
  const user_id = req.params.userid;
  const name = req.query.name as string;
  const user = await usersCollection.doc(user_id as string).get();
  if (!user.exists) {
    res.send('User not found!')
  } else {
    const matchingStocks = await usersCollection.doc(user_id as string).collection('stocks').where('name', '==', name).get()

    if (matchingStocks.empty) {
      let userStock: StockInfo = {
        name: name,
        price: 0,
        favorite: false,
        num_shares: 0
      }
      fetch('http://localhost:8080/stock?name=' + name, {
        method: "POST",
        headers: {
          'content-type': 'application/json'
        }
      })
        .then((res: { json: () => any; }) => res.json())
        .then(async (data: Stock) => {
          if (!(data.price)) {
            res.send('Invalid stock')
          } else {
            userStock.price = data.price;
            await usersCollection.doc(user_id as string).collection('stocks').add(userStock);
            res.send(userStock);
          }
        })
        .catch(() => res.send('Invalid stock'))
    } else {
      matchingStocks.forEach(doc => {
        fetch('http://localhost:8080/stock?name=' + name, {
          method: "POST",
          headers: {
            'content-type': 'application/json'
          }
        })
          .then((res: { json: () => any; }) => res.json())
          .then(async (data: Stock) => {
            if (!(data.price)) {
              res.send('Invalid stock')
            } else {
              await usersCollection.doc(user_id as string).collection('stocks').doc(doc.id).update({ price: data.price });;
              res.send("Stock updated")
            }
          })
          .catch(() => res.send('Invalid stock'))
      }
      )

    }
  }
})

app.post('/transaction/:userId', async (req, res) => {
  const user_id = req.params.userId;
  const name = req.query.name;
  const numShares = req.body.shares;
  let type: string = req.query.type as string;
  if (type.toLowerCase() !== 'buy' && type.toLowerCase() !== 'sell') {
    res.send('invalid query');
    return;
  }
  const user = await usersCollection.doc(user_id as string).get();
  if (!user.exists) {
    res.send('User not found!')
  } else {
    const matchingStocks = await usersCollection.doc(user_id as string).collection('stocks').where('name', '==', name).get();
    let shares = 0;
    if (matchingStocks.empty) {
      res.send("Stock not found");
    } else {
      matchingStocks.forEach(async doc => {
        shares = doc.get('num_shares')
        if (type.toLowerCase() === 'buy') {
          await usersCollection.doc(user_id as string).collection('stocks').doc(doc.id).update({ num_shares: shares + numShares });
          res.send('updated!')
        } else {
          if (shares < numShares) {
            res.send('Not enough shares to sell!');
          } else {
            await usersCollection.doc(user_id as string).collection('stocks').doc(doc.id).update({ num_shares: shares - numShares });
            res.send('updated!')
          }
        }
      })

    }

  }

})

app.post('/stock', async (req, res) => {
  const name = req.query.name as string;
  const matchingStocks = await stocksCollection.where('name', '==', name).get();
  if (matchingStocks.empty) {
    fetch(base + name + baseMethod + '?token=' + key, {
      method: "GET",
      headers: {
        'content-type': 'application/json'
      }
    })
      .then((result: { text: () => any; }) => result.text())
      .then(async (data: any) => {
        if (data === 'Unknown symbol' || data === "Not found") {
          res.send("Invalid stock!")
        } else {
          const stock: Stock = {
            name: name,
            price: data
          }
          await stocksCollection.add(stock);
          res.send(stock);
        }
      })
  } else {
    matchingStocks.forEach(doc => {
      fetch(base + name + baseMethod + '?token=' + key, {
        method: "GET",
        headers: {
          'content-type': 'application/json'
        }
      })
        .then((result: { text: () => any; }) => result.text())
        .then(async (data: any) => {
          if (data === 'Unknown symbol' || data === "Not found") {
            res.send("Invalid stock!")
          } else {
            const stock: Stock = {
              name: name,
              price: data
            }
            await stocksCollection.doc(doc.id).update(stock);
            res.send(stock);
          }
        })
    })

  }
  // 
  // 
})

app.post('/favorite/:userId', async (req, res) => {
  const user_id = req.params.userId;
  const name = req.query.name;
  const user = await usersCollection.doc(user_id as string).get();
  if (!user.exists) {
    res.send('User not found!')
  } else {
    const matchingStocks = await usersCollection.doc(user_id as string).collection('stocks').where('name', '==', name).get();
    let favorite = false;
    if (matchingStocks.empty) {
      res.send("Stock not found");
    } else {
      matchingStocks.forEach(async doc => {
        favorite = doc.get('favorite')
        await usersCollection.doc(user_id as string).collection('stocks').doc(doc.id).update({ favorite: !favorite });
        res.send("updated!");
      })
    }
  }
})

// delete a stock given user id and stock id
app.delete('/deleteStock/:userId', async (req, res) => {
  const user_id = req.params.userId;
  const name = req.query.name;
  const user = await usersCollection.doc(user_id as string).get();
  if (!user.exists) {
    res.send('User not found!')
  } else {
    const matchingStocks = await usersCollection.doc(user_id as string).collection('stocks').where('name', '==', name).get();
    if (matchingStocks.empty) {
      res.send("Stock not found");
    } else {
      matchingStocks.forEach(async doc => {
        await usersCollection.doc(user_id as string).collection('stocks').doc(doc.id).delete();
        res.send("Stock deleted!");
      })
    }
  }
});

app.listen(process.env.PORT || port, () =>
  console.log(`Example app listening on port ${port}!`)
);