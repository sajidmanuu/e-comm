const express = require('express');
const mongoose=require('mongoose');

const cors = require('cors');
require('./frontend/src/db/config');
const User = require("./frontend/src/db/User");

const app = express();
const Product = require("./frontend/src/db/Product");
app.use(cors());
app.use(express.json());


app.post("/add-product", async (req, resp) => {
  try {
    const { name, price, category, company } = req.body;

    if (!name || !price) {
      return resp.status(400).json({ message: 'Name and price are required.' });
    }

    const product = new Product({ name, price, category, company });
    const result = await product.save();

    resp.status(201).json(result);
  } catch (error) {
    resp.status(500).json({ message: error.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await user.save();
    const sanitizedResult = result.toObject();
    delete sanitizedResult.password;
    res.status(200).send(sanitizedResult);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});



app.post("/login", async (req, resp) => {
  if (req.body.email && req.body.password) {
    try {
      console.log("Received login request:", req.body);

      // Assuming you have defined the User model correctly and connected to the database
      const user = await User.findOne({ email: req.body.email, password: req.body.password }).select("-password");

      if (!user) {
        console.log("Login successful. User:", user);
        resp.send({ user });
        
      } else {
        console.log("Login failed. No user found.");
        resp.status(404).send({ result: "no user found" });
      }
    } catch (error) {
      console.error("Error while logging in:", error);
      resp.status(500).send({ result: "an error occurred while logging in" });
    }
  } else {
    console.log("Login failed. Email and password are required.");
    resp.status(400).send({ result: "email and password are required" });
  }
});






app.get("/products", async (req, resp) => {
  let products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  }
  else {
    resp.send({ result: "no product found" })
  }
})

app.delete("/product/:id", async (req, resp) => {
  const result = await Product.deleteOne({ _id: req.params.id })
  resp.send(result);
})

app.get("/product/:id", async (req, res) => {
  try {
    let result = await Product.findOne({ _id: req.params.id });
    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ result: "no result found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.put("/product/:id", async (req, resp) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body
    }
  )
  resp.send(result)

});
app.get("/search/:key", async (req, resp) => {
  let result = await Product.find({
    "$or": [
      { name: { $regex: req.params.key } },
       {company:{$regex:req.params.key}},
       {category:{$regex:req.params.key}}
    ]
  });
  resp.send(result);
})

// app.listen(5000);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
