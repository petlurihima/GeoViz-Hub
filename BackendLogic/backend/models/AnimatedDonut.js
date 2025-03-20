const mongoose = require('mongoose');

const animatedDonutSchema = new mongoose.Schema({
  status: { type: String, required: true },
  value: { type: Number, required: true }
}, {
  collection: 'animateddonut' 
});

const AnimatedDonut = mongoose.model('AnimatedDonut', animatedDonutSchema);

module.exports = AnimatedDonut;
