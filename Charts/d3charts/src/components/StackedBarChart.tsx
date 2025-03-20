import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const StackedBarChart: React.FC = () => {
  const svgRef :any = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stackedbarchart`);
        const result = await response.json();
        setData(result); 
      } catch (error) {
        console.error('Error fetching stacked bar chart data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;  

    const width = 900;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };

    const keys = ["series1", "series2", "series3"];
    const stack = d3.stack().keys(keys);
    const stackedData = stack(data);

    const x = d3.scaleBand()
      .domain(data.map(d => d.category.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1]) || 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal<string>()
      .domain(keys)
      .range(["#1f77b4", "#6baed6", "#9ecae1"]);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const group = svg.append("g");

    const bars = group.selectAll("g")
      .data(stackedData)
      .join("g")
      .attr("fill", d => color(d.key));

    bars.selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", d => x(d.data.category.toString()) || 0)
      .attr("y", height)
      .attr("width", x.bandwidth() * 0.9)
      .attr("height", 0)
      .style("opacity", 0)
      .transition()
      .delay((_, i) => i * 50)
      .duration(500)
      .ease(d3.easeLinear)
      .style("opacity", 1)
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr("y", d => y(d[1]) || height - margin.bottom)
      .attr("height", d => Math.max(0, y(d[0]) - y(d[1])) || 0);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % 5 === 0)));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y).ticks(5) as any);

  }, [data]);

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "auto", paddingTop: "20px" }}>
      <svg ref={svgRef} width="100%" height="250px"></svg>
    </div>
  );
};

export default StackedBarChart;
