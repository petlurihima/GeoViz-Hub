const express = require('express')
const cors = require('cors');
const app = express()
const port = 5000
const Brand = require('./models/Brand');
const StackedBarChart=require('./models/StackedBar');
const Donut=require('./models/donut');
const mongodb=require("./db");
const AnimatedDonut = require('./models/AnimatedDonut');
const Sunburst = require('./models/sunburst');
const City=require("./models/City");
const countries=require("./models/Country");
const bodyParser = require("body-parser");
const { publisher, subscriber } = require("./redisPublisherSubscriber");
const { addSubscription, sendNotification,removeSubscription } = require("./notificationService");
mongodb();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const corsOptions = {
  origin: 'http://localhost:3000', 
  methods: "GET, POST",
  allowedHeaders: "Content-Type",
  exposedHeaders: "Cache-Control" 
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

subscriber.on("message", (channel, message) => {
    if (channel === "cityAdded") {
        console.log(`New city added: ${message}`);
        const cityData = JSON.parse(message);
        sendNotification(`A new city has been added: ${cityData.name}, ${cityData.country}`);
    }
});

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "public, max-age=3600"); 
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/brands', async (req, res) => {
    try {
      const brands = await Brand.find(); 
      res.json(brands); 
      // console.log(brands)
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving brand data' });
    }
  });

  app.get('/api/stackedbarchart', async (req, res) => {
    try {
      const stackedData = await StackedBarChart.find();
      // console.log('Fetched data:', stackedData);  
      if (!stackedData || stackedData.length === 0) {
        console.log('No data found in the stackedBar collection.');
        return res.status(404).json({ message: 'No data found for stacked bar chart' });
      }
      res.json(stackedData);
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving stacked bar chart data' });
    }
  });
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await Sunburst.find();
      if (categories.length === 0) {
        return res.status(404).json({ message: 'No categories found' });
      }
      res.json(categories);  
    } catch (err) {
      console.error('Error retrieving categories:', err);
      res.status(500).json({ message: 'Error retrieving categories' });
    }
  });
  app.get('/api/donut', async (req, res) => {
    try {
      const categories = await Donut.find();  
      if (categories.length === 0) {
        return res.status(404).json({ message: 'No categories found' });
      }
      res.json(categories);  
    } catch (err) {
      console.error('Error retrieving categories:', err);
      res.status(500).json({ message: 'Error retrieving categories' });
    }
  });
  
  app.get('/api/animated-donuts', async (req, res) => {
    try {
      const animatedDonuts = await AnimatedDonut.find(); 
      if (animatedDonuts.length === 0) {
        return res.status(404).json({ message: 'No animated donuts found' });
      }
      res.json(animatedDonuts);  
    } catch (err) {
      console.error('Error retrieving animated donuts:', err);
      res.status(500).json({ message: 'Error retrieving animated donuts' });
    }
  });
  // fetching countries
app.get("/api/countries", async (req, res) => {
  try {
    const countrylist = await countries.find(); 
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.json(countrylist);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "Error fetching countries", error });
  }
});
// Fetch city from MongoDB
app.get("/api/cities/:name", async (req, res) => {
  const cityName = req.params.name;
  try {
    const city = await City.findOne({ name: cityName });
    if (city) {
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.json({ found: true, city });
    } else {
      res.status(200).json({ found: false, message: "City not found" });
    }
  } catch (err) {
    console.error("Error fetching city:", err);
    res.status(500).json({ message: "Server error" });
  }
});
//saving city info to mongoDB
app.route("/api/cities")
.get(async(req,res)=>{
  try{
    const cities=await City.find()
    res.json(cities);
  }catch(error){
    console.error("Error fetching cities ",error)
    res.status(500).json({message:"server error"})
  }
})
.post(async (req, res) => {
  console.log("Received body:", req.body);  
  const { name, location } = req.body;
  if (!name || !location || !location.lat || !location.lon) {
    return res.status(400).json({ message: "Missing required fields. Ensure lat/lon are provided." });
  }
  try {
    let city = await City.findOne({ name });
    if (city) {
      console.log("City already exists in MongoDB:", city);
      return res.status(200).json({ success: true, city });
    }
    console.log("Saving new city to MongoDB:", { name, location });
    city = new City({ name, location });
    await city.save();
    console.log("City saved successfully:", city);
    publisher.publish("cityAdded", JSON.stringify({ name, location }));
    res.status(201).json({ success: true, city });
  } catch (err) {
    console.error("Error saving city in MongoDB:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// app.put("/api/cities/:id", async (req, res) => {
//   const { id } = req.params;
//   const { pincode } = req.body;

//   try {
//     if (!pincode) {
//       return res.status(400).json({ error: "Pincode is required" });
//     }

//     const updatedCity = await City.findByIdAndUpdate(
//       id,
//       { pincode },
//       { new: true } // Return updated document
//     );

//     if (!updatedCity) {
//       return res.status(404).json({ error: "City not found" });
//     }

//     res.status(200).json({ message: "Pincode updated successfully!", city: updatedCity });
//   } catch (err) {
//     console.error("Error updating city:", err);
//     res.status(500).json({ error: "Failed to update pincode" });
//   }
// });

app.put("/api/cities/:id",async(req,res)=>{
  const {id}=req.params;
  const {pincode}=req.body;
  try{
    await City.findByIdAndUpdate(id,{pincode});
    res.status(200).json({message:"pincode updated successfully"});
  }catch(err){
    res.status(500).json({error:"Failed to update pincode"})
  }
})
app.put('/api/cities/update-all', async (req, res) => {
  console.log("Request received at /api/cities/update-all"); // 🔍 Check if the request reaches here

  try {
      console.log("Received updates:", req.body.updates); // 🔍 Check if req.body exists
      const updates = req.body.updates;

      if (!updates || typeof updates !== 'object') {
          return res.status(400).json({ error: "Invalid updates format" });
      }

      const updatePromises = Object.entries(updates)
          .filter(([_, pincode]) => pincode !== "" && pincode !== undefined) 
          .map(([cityId, pincode]) => City.findByIdAndUpdate(cityId, { pincode }, { new: true }));

      if (updatePromises.length === 0) {
          return res.status(400).json({ error: "No valid pincodes to update" });
      }

      await Promise.all(updatePromises);
      res.json({ message: "Pincodes updated successfully" });
  } catch (error) {
      console.error("Error updating cities:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/subscribe", async(req, res) => {
  await addSubscription(req.body);
  res.status(201).json({ message: "Subscribed successfully" });
});
app.post("/api/unsubscribe", (req, res) => {
  removeSubscription(req.body);
  res.status(200).json({ message: "Unsubscribed successfully" });
});

// Call sendNotification() when we add a new feature
app.post("/api/notify", (req, res) => {
  sendNotification(req.body.message);
  res.status(200).json({ message: "Notification sent" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})