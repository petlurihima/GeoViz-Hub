import React from "react";
import { Link } from "react-router-dom";
import AnimatedDonutChart from "../components/AnimatedDonutChart";
import BarChartRace from "../components/BarChartRace";
import DonutChart from "../components/DonutChart";
import StackedBarChart from "../components/StackedBarChart";
import SunburstChart from "../components/SunBurstChart";

function HomePage() {
  return (
    <div className="chart-container">
      <div>
        <h3><Link to="/barchart">Bar Chart Race</Link></h3>
        <BarChartRace />
      </div>
      <div>
        <h3><Link to="/stackedbarchart">Stacked Bar Chart</Link></h3>
        <StackedBarChart />
      </div>
      <div>
        <h3><Link to="/donutchart">Donut Chart</Link></h3>
        <DonutChart />
      </div>
      <div>
        <h3><Link to="/animateddonutchart">Animated Donut Chart</Link></h3>
        <AnimatedDonutChart />
      </div>
      <div>
        <h3><Link to="/sunburstchart">Sunburst Chart</Link></h3>
        <SunburstChart />
      </div>
    </div>
  );
}

export default HomePage;
