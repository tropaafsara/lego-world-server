const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 9000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qewqibf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db('legoWorld').collection('toys');
    const bookingCollection = client.db('legoWorld').collection('bookings');
    const toyCollection = client.db('legoWorld').collection('bookings');

    const indexKeys = { title: 1, category: 1 };
    const indexOptions = { name: "titleCategory" };
    const result = await toyCollection.createIndex(indexKeys, indexOptions);
    console.log(result);


    // app.get('/toys', async (req, res) => {
    //   const cursor = toysCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // })
    


    app.get("/searchByToyname/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            { toyName: { $regex: searchText, $options: "i" } },
            // { category: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });



    app.get('/toys', async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // app.get('/toys/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const query = { _id: new ObjectId(id) }
    //     const options = {
    //       projection: { title: 1, price: 1, service_id: 1, img: 1 },
    //   };

    //     const result = await toysCollection.findOne(query,options);
    //     res.send(result);
    // })

    
    

    app.get('/bookings', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    })

    
    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.findOne(query);
      res.send(result);
  })

    app.get('/bookings/:text', async (req, res) => {
      console.log(req.params.text);
      if (req.params.text == "lego-city" || req.params.text == "lego-architecture" || req.params.text == "lego-cars") {
        const result = await bookingCollection.find({ category: req.params.text }).toArray();
        return res.send(result);
      }
      const result = await bookingCollection.find({}).toArray();
      res.send(result);
    })

    

    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    
    

    app.patch('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedBooking = req.body;
      console.log(updatedBooking);
      const updateDoc = {
        $set: {
          status: updatedBooking.status
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    

    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })




    app.get("/bookings", async (req, res) => {
      const jobs = await toyCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.send(jobs);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('lego world is running ')
})

app.listen(port, () => {
  console.log(`lego is running on port: ${port}`);
})