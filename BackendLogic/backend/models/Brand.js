const mongoose = require("mongoose");
const {Schema}=mongoose;

const brandSchema = new Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
},{
    collection:'barCharts'
});

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
