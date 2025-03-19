# 🌍 GeoViz Hub  

GeoViz Hub is a web application for visualizing city data using interactive charts and maps. It allows users to search cities, fetch location details, and display them dynamically while checking and storing data in MongoDB.  

## 🚀 Features  

- **City Search & Auto-Suggestions**: Fetch cities using country or state filters with an autocomplete feature.  
- **MongoDB Integration**: Cities are first checked in the database before fetching from the API.  
- **Map Visualization**: Displays city locations dynamically using stored coordinates.  
- **Real-Time Notifications**: Uses Redis as a message broker to send notifications when a new city is added to MongoDB.  
- **Chart Components**:  
  - Bar Chart 📊  
  - Stacked Bar Chart 📊  
  - Sunburst Chart 🌞  
  - Animated Donut Chart 🍩  
  - Donut Chart 🍩  
- **Saved Cities Management**: View and update saved city details, including pincodes.  
- **Breadcrumb Navigation**: Improves usability by showing the navigation path.  
- **PWA Support**: Enables offline usage with a service worker.  

## 🛠️ Tech Stack  

- **Frontend**: React, Bootstrap  
- **Backend**: Express.js, Node.js  
- **Database**: MongoDB  
- **Message Broker**: Redis (for notifications)  
- **Additional Features**: WebSockets (if applicable), API Integration, PWA  

## 📌 Usage Guide  

1. **Search for a City** – Enter a city name, and suggestions will appear.  
2. **View the Map** – If the city exists in MongoDB, it gets plotted on the map; otherwise, it's fetched and stored.  
3. **Receive Notifications** – Get notified when a new city is added (Redis-powered push notifications).  
4. **Interact with Charts** – View data-driven insights using various visualization components.  
5. **Update City Data** – Modify pincodes for saved cities.  

## 🚀 Getting Started  

### Prerequisites  
- Node.js installed  
- Redis server (for notifications)  
