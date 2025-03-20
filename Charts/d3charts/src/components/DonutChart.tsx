import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { PieArcDatum } from "d3-shape";

interface DonutData {
  label: string;
  value: number;
  color: string;
}

const DonutChart: React.FC = () => {
  const svgRef : any = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<DonutData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/donut`);
        const result = await response.json();
        setData(result); 
      } catch (error) {
        console.error('Error fetching donut chart data:', error);
      }
    };

    fetchData();
  }, []);  

  useEffect(() => {
    if (data.length === 0) return;  

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 3;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<DonutData>().value(d => d.value);  
    const arc = d3.arc<PieArcDatum<DonutData>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);

    const arcs = svg.selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("fill", (d) => d.data.color)  
      .style("stroke", "#fff")
      .style("stroke-width", "2px")
      .style("opacity", 0)  

      .transition()
      .duration(3000) 
      .style("opacity", 1)  

      .attrTween("d", function (d: PieArcDatum<DonutData>) {
        const interpolate = d3.interpolate(
          { startAngle: 0, endAngle: 0 },  
          d  
        );
        return function (t) {
          const interpolatedData = interpolate(t);
          return arc(interpolatedData) || "";  
        };
      });

  }, [data]);  

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "auto", paddingTop: "20px" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default DonutChart;
