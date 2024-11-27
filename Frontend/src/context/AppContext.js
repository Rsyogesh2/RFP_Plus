// src/context/AppContext.js
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [moduleData, setModuleData] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [userPower, setUserPower] = useState([]);
    const [assignModule, setAssignModule] = useState([]);
    const [userName, setUserName] = useState();

    return (
        <AppContext.Provider value={{ moduleData, setModuleData, usersList,
         setUsersList,userPower,setUserPower,assignModule,setAssignModule,
         userName, setUserName}}>
            {children}
        </AppContext.Provider>
    );
};
