import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css"; 

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="breadcrumbs">
      <Link to="/">Home</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        return (
          <span key={name}>
            {" > "}
            <Link to={routeTo}>{name.replace(/chart/gi, " Chart")}</Link>
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
