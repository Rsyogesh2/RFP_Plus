// src/context/AppContext.js
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [moduleData, setModuleData] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [userPower, setUserPower] = useState();
    const [assignModule, setAssignModule] = useState([]);
    const [userName, setUserName] = useState();
    const [name, setName] = useState();
    const [userRole, setUserRole] = useState();
    const [globalFItems, setGlobalFItems] = useState();
    const [sidebarValue, setSidebarValue] = useState(
       { rfp_no: "", module_name: [] }, // Default value to avoid undefined errors
    );
    const [rfpNumber,setRfpNumber] = useState();

    return (
        <AppContext.Provider value={{ moduleData, setModuleData, usersList,
         setUsersList,userPower,setUserPower,assignModule,setAssignModule,
         userName, setUserName,sidebarValue, setSidebarValue, setUserRole,
        userRole,globalFItems, setGlobalFItems,name, setName,rfpNumber,setRfpNumber}}>
            {children}
        </AppContext.Provider>
    );
};
