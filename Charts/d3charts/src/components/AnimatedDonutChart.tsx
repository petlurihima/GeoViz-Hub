import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { PieArcDatum } from "d3-shape";

interface DonutData {
  status: string;
  value: number;
  color?: string;
}

const AnimatedDonutChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<DonutData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/animated-donuts`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching animated donuts data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 3;

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie<DonutData>().value((d) => d.value);
    const arc = d3.arc<PieArcDatum<DonutData>>().innerRadius(radius * 0.6).outerRadius(radius);

    const paths = g
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("fill", (d, i) => d.data.color || colorScale(i.toString())) // Use API color or fallback
      .style("stroke", "#fff")
      .style("stroke-width", "2px")
      .style("opacity", 0);

    paths
      .transition()
      .duration(3000)
      .style("opacity", 1)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || "";
        };
      });

  }, [data]);

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "auto", paddingTop: "20px" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default AnimatedDonutChart;
