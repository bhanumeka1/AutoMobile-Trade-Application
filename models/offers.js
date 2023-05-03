const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const offerSchema = new Schema({
  Name: { type: String, required: [true, "Item Name cannot be empty"] },
  Category: { type: String, required: [true, "Item Category cannot be empty"] },
  OfferedBy: { type: Schema.Types.ObjectId, ref: "User" },
  Status: { type: String },
});

const offerItem = mongoose.model("offer", offerSchema);

module.exports = offerItem;
