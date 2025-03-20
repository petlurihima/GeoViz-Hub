const mongoose = require("mongoose");

const mongoURL = "mongodb+srv://charts:charts@cluster0.x73aq.mongodb.net/charts?retryWrites=true&w=majority&appName=Cluster0";

const mongodb = async () => {
  try {
    await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = mongodb;
