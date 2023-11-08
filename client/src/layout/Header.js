import React from "react";
import headerImage from "./header.jpg";
import logo from "./logo.png"

const style = {
  background: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7)), url(${headerImage})`,
  backgroundPosition: "center",
  backgroundSize: "100% auto",
};

function Header() {
  return (
    <div className="jumbotron jumbotron-fluid text-white mb-0" style={style}>
      <div className="container">
        <img src={logo} alt="" className="ml-4 pb-3 pt-3" />
        <p className="lead">
          Eat Good, <em>Eat Fast</em>!
        </p>
      </div>
    </div>
  );
}

export default Header;
