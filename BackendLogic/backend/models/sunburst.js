const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  children: [this]
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  children: [childSchema]
}, {
  collection: 'sunburst'
});

const Sunburst = mongoose.model('Sunburst', categorySchema);

module.exports =Sunburst;
