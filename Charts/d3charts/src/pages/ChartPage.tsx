import React from "react";

interface ChartPageProps {
    title: string;
    ChartComponent: React.ComponentType; 
  }

function ChartPage({ title, ChartComponent }:ChartPageProps) {
  return (
    <div className="chart-page">
      <h2>{title}</h2>
      <ChartComponent />
    </div>
  );
}

export default ChartPage;
