const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;

mongoose
  .connect(
    "mongodb+srv://Rakesh:1072@booky.nr0hdzb.mongodb.net/Booky?retryWrites=true&w=majority&appName=booky"
  )
  .then("db connected");

const ItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
});
const Item = mongoose.model("Item", ItemSchema);

app.use(express.json());

app.put("/items/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    const { name, description, price } = req.body;

    const item = await Item.findByIdAndUpdate(
      itemId,
      { name, description, price },
      { new: true, upsert: true }
    );

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
