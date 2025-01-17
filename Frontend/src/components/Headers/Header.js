import React, { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";


const Header = () => {
  const { userPower, moduleData } = useContext(AppContext);
  // console.log(moduleData.entityName)
  return (
    <div className="header-ok">
      <h1>
        {moduleData ? moduleData.entityName : ""}
      </h1>
      <h2>{`${userPower} Module`}</h2>
    </div>
  );
};


export default Header;