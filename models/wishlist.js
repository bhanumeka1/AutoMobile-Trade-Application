const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const saveSchema = new Schema({
  Name: { type: String, required: [true, "ItemName cannot be empty"] },
  Category: { type: String, required: [true, "Item Category cannot be empty"] },
  SavedBy: { type: Schema.Types.ObjectId, ref: "User" },
  Status: { type: String },
});

const saveItem = mongoose.model("wishlist", saveSchema);

module.exports = saveItem;
