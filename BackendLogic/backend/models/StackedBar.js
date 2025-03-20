const mongoose = require('mongoose');

const stackedBarChartSchema = new mongoose.Schema({
  category: { type: Number, required: true },
  series1: { type: Number, required: true },
  series2: { type: Number, required: true },
  series3: { type: Number, required: true },
}, {
  collection: 'stackedBar' 
});

const StackedBarChart = mongoose.model('StackedBarChart', stackedBarChartSchema);

module.exports = StackedBarChart;
