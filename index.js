const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.PORT || 7000;

// MIDDLEWARE

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u6ptml9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const productCollection = client.db("productDB").collection("product");
    const cartCollection = client.db("productDB").collection("cartData");

    app.post("/product", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    app.post("/cartData", async (req, res) => {
      const cart = req.body;
      const result = await cartCollection.insertOne(cart);
      res.send(result);
    });

    app.get("/cartData/:user", async (req, res) => {
      const user = req.params.user;
      const query = {
        userName: user,
      };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/product/:brand", async (req, res) => {
      const brand = req.params.brand;
      const query = {
        brand: brand,
      };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/productDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: new ObjectId(id),
      };
      const data = req.body;
      const options = { upsert: true };
      const updateProduct = {
        $set: {
          name: data.name,
          brand: data.brand,
          price: data.price,
          rating: data.rating,
          type: data.type,
          image: data.image,
          shortDescription: data.shortDescription,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateProduct,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`my server running `);
});

app.listen(port, () => {
  console.log(`my server is running port: ${port}`);
});
