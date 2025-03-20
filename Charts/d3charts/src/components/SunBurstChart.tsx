import * as d3 from "d3";
import React, { useRef, useEffect, useState } from "react";

interface DataNode {
  name: string;
  value?: number;
  children?: DataNode[];
}

const SunburstChart: React.FC = () => {
  const svgRef: any = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<DataNode | null>(null);

  const safeStringify = (obj: any) => {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return;
          seen.add(value);
        }
        return value;
      },
      2
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
        const result = await response.json();
        // console.log("Fetched Data:", result);

        const rootData = {
          name: "Root",
          children: result, 
        };

        setData(rootData);
      } catch (error) {
        console.error("Error fetching categories data:", error);
      }
    };

    fetchData();
  }, []);

  const addValuesToLeafNodes = (node: DataNode): DataNode => {
    if (!node.children || node.children.length === 0) {
      return {
        ...node,
        value: node.value || 1, 
      };
    }
    return {
      ...node,
      children: node.children.map(addValuesToLeafNodes),
    };
  };

  useEffect(() => {
    if (!data) return;

    // console.log("Initial Data before Processing:", safeStringify(data));

    const dataWithValues = addValuesToLeafNodes(data);
    // console.log("Processed Data with Values:", safeStringify(dataWithValues));

    const width = 400;
    const height = 400;
    const radius = width / 2.5;

    const partition = d3.partition<DataNode>().size([2 * Math.PI, radius]);

    const root = d3
      .hierarchy<DataNode>(dataWithValues)
      .sum((d) => d.value || 0) 
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // console.log("Final Hierarchy:", safeStringify(root));

    const partitionedRoot = partition(root as d3.HierarchyRectangularNode<DataNode>);

    const arc = d3
      .arc<d3.HierarchyRectangularNode<DataNode>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1);

    const color = d3.scaleOrdinal(d3.schemeCategory10); 

    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const paths = g
        .selectAll("path")
        .data(partitionedRoot.descendants().slice(1) as d3.HierarchyRectangularNode<DataNode>[])
        .enter()
        .append("path")
        .attr("fill", (d) => color(d.data.name))
        .style("stroke", "#fff")
        .style("opacity", 0)
        .each(function (d) {
          const startArc = d3
            .arc<d3.HierarchyRectangularNode<DataNode>>()
            .startAngle((d) => d.x0)
            .endAngle((d) => d.x0)
            .innerRadius((d) => d.y0)
            .outerRadius((d) => d.y0); 

          d3.select(this).attr("d", startArc(d) as string);
        })
        .on("mouseover", function () {
          d3.select(this).style("opacity", 0.7);
        })
        .on("mouseout", function () {
          d3.select(this).style("opacity", 1);
        });

      const animateArcs = () => {
        paths
          .transition()
          .duration(3000) 
          .ease(d3.easeCubicInOut)
          .style("opacity", 1)
          .attrTween("d", function (d) {
            const interpolate = d3.interpolate(
              { x0: d.x0, x1: d.x0, y0: d.y0, y1: d.y0 },
              d
            );
            return function (t) {
              return arc(interpolate(t) as d3.HierarchyRectangularNode<DataNode>) || "";
            };
          });
      };

      animateArcs();

      g.selectAll("text")
        .data(partitionedRoot.descendants().slice(1) as d3.HierarchyRectangularNode<DataNode>[])
        .enter()
        .append("text")
        .attr("transform", (d) => {
          const x = ((d.x0 + d.x1) / 2) * (180 / Math.PI);
          const y = (d.y0 + d.y1) / 2;
          return `rotate(${x - 90}) translate(${y}, 0) rotate(${x < Math.PI ? 0 : 180})`;
        })
        .attr("text-anchor", (d) => ((d.x0 + d.x1) / 2 < Math.PI ? "start" : "end"))
        .attr("font-size", "12px")
        .text((d) => d.data.name);
    }
  }, [data]);

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "auto", paddingTop: "20px" }}>
      <svg ref={svgRef} width="400" height="400" style={{ marginLeft: "100px" }}></svg>
    </div>
  );
};

export default SunburstChart;
