const mongoose = require('mongoose');

const donutSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  color: { type: String, required: true }
}, {
  collection: 'donut'  
});

const Donut = mongoose.model('Donut', donutSchema);

module.exports = Donut;
