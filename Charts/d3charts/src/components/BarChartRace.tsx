import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

interface Brand {
  name: string;
  value: number;
}

interface Data {
  brands: Brand[];
}

const BarChartRace: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);  
  const svgRef: any = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/brands`); 
        const result = await response.json();
        const formattedData = [{ brands: result }]; 
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching brand data:", error);
      }
    };

    fetchData();
  }, []); 

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;  

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 100, bottom: 40, left: 10 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data[0].brands, (d) => d.value)!])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
      .domain(data[0].brands.map((d) => d.name))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    svg.selectAll("*").remove();  

    const bars = svg.append("g")
      .selectAll("rect")
      .data(data[0].brands)
      .enter().append("rect")
      .attr("x", margin.left)
      .attr("y", (d) => y(d.name)!)
      .attr("width", 0)  
      .attr("height", y.bandwidth())
      .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

    const texts = svg.append("g")
      .selectAll("text.value")
      .data(data[0].brands)
      .enter().append("text")
      .attr("class", "value")
      .attr("x", margin.left)
      .attr("y", (d) => y(d.name)! + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .style("font-size", "20px")
      .style("font-weight", "normal")
      .style("fill", "white")
      .text((d) => d.value.toLocaleString());

    const brandNames = svg.append("g")
      .selectAll("text.brandName")
      .data(data[0].brands)
      // .enter().append("text")
      .attr("class", "brandName")
      .attr("x", margin.left - 5)
      .attr("y", (d) => y(d.name)! + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text((d) => d.name);

    bars.transition()
      .duration(1000)
      .attr("width", (d) => (x(d.value) - margin.left) * 0.8);  

    texts.transition()
      .duration(1000)
      .attr("x", (d) => x(d.value) + 5);

    brandNames.transition()
      .duration(1000)
      .attr("x", margin.left - 5)
      .attr("y", (d) => y(d.name)! + y.bandwidth() / 2);

    const updateData = () => {
      const shuffledData = [...data[0].brands];
      shuffledData.sort(() => Math.random() - 0.5);

      x.domain([0, d3.max(shuffledData, (d) => d.value)!]);

      bars.data(shuffledData)
        .transition()
        .duration(1000)
        .attr("y", (d) => y(d.name)!)
        .attr("width", (d) => (x(d.value) - margin.left) * 0.8);

      texts.data(shuffledData)
        .transition()
        .duration(1000)
        .attr("y", (d) => y(d.name)! + y.bandwidth() / 2)
        .attr("x", (d) => x(d.value) + 5)
        .text((d) => d.value.toLocaleString());

      brandNames.data(shuffledData)
        .transition()
        .duration(1000)
        .attr("y", (d) => y(d.name)! + y.bandwidth() / 2)
        .text((d) => d.name);
    };

    const intervalId = setInterval(updateData, 2000);

    return () => clearInterval(intervalId);

  }, [data]);  

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "auto", paddingTop: "20px" }}>
      <svg ref={svgRef} width="100%" height="250px"></svg>
    </div>
  );
};

export default BarChartRace;
