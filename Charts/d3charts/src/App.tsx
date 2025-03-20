import {useState,useEffect} from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";
import AnimatedDonutChart from "./components/AnimatedDonutChart";
import BarChartRace from "./components/BarChartRace";
import DonutChart from "./components/DonutChart";
import StackedBarChart from "./components/StackedBarChart";
import SunburstChart from "./components/SunBurstChart";
import HomePage from "./pages/HomePage";
import ChartPage from "./pages/ChartPage";
import CitySearch from "./components/CitySearch";
import Notifications from "./components/Notifications";
import SavedCities from "./components/SavedCities";

function AppWrapper() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  return (
    <div className="app">
      <Notifications/>
       {!isOnline && <div style={{marginTop:"30px"}}>You are currently offline. Some features may not work.</div>}
      <Navbar />
      {!isHome && <Breadcrumbs />} 
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/barchart" element={<ChartPage title="Bar Chart Race" ChartComponent={BarChartRace} />} />
          <Route path="/stackedbarchart" element={<ChartPage title="Stacked Bar Chart" ChartComponent={StackedBarChart} />} />
          <Route path="/donutchart" element={<ChartPage title="Donut Chart" ChartComponent={DonutChart} />} />
          <Route path="/animateddonutchart" element={<ChartPage title="Animated Donut Chart" ChartComponent={AnimatedDonutChart} />} />
          <Route path="/sunburstchart" element={<ChartPage title="Sunburst Chart" ChartComponent={SunburstChart} />} />
          <Route path="/cities" element={<ChartPage title="Cities" ChartComponent={CitySearch} />} />
          <Route path="/savedCities" element={<ChartPage title="SavedCities" ChartComponent={SavedCities} />} />
        </Routes>
      </div>
    </div>
  );
}
function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
export default App;