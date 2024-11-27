import React, { useState, useEffect,useContext , useImperativeHandle, forwardRef } from 'react';

import sendCheckedItems from '../../services/Apis';
import {AppContext} from '../../context/AppContext';
import './ModuleList.css';

const ModuleList = forwardRef(({title,url},ref) => {
    const [modules, setModules] = useState([]);
    const [items, setItems] = useState([]);
    const { setModuleData,setAssignModule,userName } = useContext(AppContext);

    // Fetch module names on initial load
    useEffect(() => {
        fetchModulesandProducts();
    }, []);

    const fetchModulesandProducts = async () => {
        try {
            const queryParams = new URLSearchParams({ userName });
            const response = await fetch(`/api${url}?${queryParams}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }); // Adjust the endpoint as needed
            const data = await response.json();
            console.log(url)
            let formattedModules;
            
            if(url=="/assignModule"){
                 formattedModules = data.map((module) => ({
                    ...module,
                    isExpandable: true,
                    expanded: false,
                }))
                console.log("assignModule");
            } else {
             formattedModules = data.map((module) => ({
                ...module,
                isExpandable: true,
                expanded: false,
                subItems: [],
            }));
            console.log("notmodule");
        }
            setModules(formattedModules);
            console.log(formattedModules);
        } catch (error) {
            console.error("Failed to fetch modules:", error);
        }
    };

    const fetchSubItems = async (index, moduleName) => {
        try {
            if(url=="/assignModule"){
                const updatedModules = [...modules];
                console.log(updatedModules);
                updatedModules[index].expanded = true;
                setModules(updatedModules);
            }else{
                const response = await fetch(`/api/${url}/${moduleName}/subItems`); // Adjust the endpoint
                const subItems = await response.json();
                const updatedModules = [...modules];
                console.log(updatedModules);
                updatedModules[index].subItems = subItems;
                updatedModules[index].expanded = true;
                setModules(updatedModules);
                console.log(updatedModules);
            }
        } catch (error) {
            console.error(`Failed to fetch sub-items for ${moduleName}:`, error);
        }
    };

    const toggleExpand = (index) => {
        console.log("toggle clicked");
        const module = modules[index];
        if (module.isExpandable) {
            // If it's expandable but not yet expanded, fetch the sub-items
            if (!module.expanded) {
                fetchSubItems(index, module.name);
                console.log(index, module.name);
            } else {
                // If already expanded, just collapse it without an API call
                const updatedModules = [...modules];
                updatedModules[index].expanded = false;
                setModules(updatedModules);
            }
        }
    };

    const toggleCheckbox = (moduleIndex, subIndex) => {
        const updatedModules = [...modules];
        updatedModules[moduleIndex].subItems[subIndex].selected = 
            !updatedModules[moduleIndex].subItems[subIndex].selected;
        setModules(updatedModules);
    };

    const getCheckedItems = (i) => {
        const checkedItems = modules.flatMap((module) =>
            module.subItems
                .filter((subItem) => subItem.selected)
                .map((subItem) => ({
                    parent: module.name,
                    subItem: subItem.name,
                }))
        );
        console.log("Checked Items:", checkedItems);
        console.log(i)
        const subItems = checkedItems.map(item => item.subItem);
        console.log(subItems);
        
        setAssignModule(subItems);
        setModuleData(sendCheckedItems(subItems));
        if(i==="RFPCreation"){
            return subItems
        } else if(i==="RFPAssignedtoSuperUser"){
            return subItems
        }
        alert("RFP getCheckedItems");
       
    };
    useImperativeHandle(ref, () => ({
        getCheckedItems,
      }));
    // const fetchItemsDetails = async (checkedItems) => {
    //     try {
    //         const response = await fetch(`/api/products/${checkedItems}/itemDetails`); // Adjust the endpoint
    //         const subItems = await response.json();
    //         console.log(subItems)
    //         // const updatedModules = [...modules];
    //         // updatedModules[index].subItems = subItems;
    //         // updatedModules[index].expanded = true;
    //         // setItems(updatedModules);
    //         // console.log(updatedModules);
    //     } catch (error) {
    //         console.error(`Failed to fetch sub-items for ${checkedItems}:`, error);
    //     }
    // };

   
    
    return (
        <div className="module-list">
            <h2>{title}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Modules</th>
                        <th>Select</th>
                    </tr>
                </thead>
                <tbody>
                    {modules.map((module, index) => (
                        <React.Fragment key={index}>
                            <tr>
                                <td onClick={() => toggleExpand(index)} className="expandable">
                                    {module.name}
                                </td>
                                <td className="plus-cell" onClick={() => toggleExpand(index)}>
                                    {module.expanded ? "-" : "+"}
                                </td>
                            </tr>
                            {/* Render sub-items with checkboxes if the module is expanded */}
                            {module.expanded && module.subItems && (
                                module.subItems.map((subItem, subIndex) => (
                                    <tr key={`${index}-sub-${subIndex}`}>
                                        <td className="sub-item">- {subItem.name}</td>
                                        <td className="checkbox-cell">
                                            <input
                                                type="checkbox"
                                                checked={subItem.selected}
                                                onChange={() => toggleCheckbox(index, subIndex)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {/* <button onClick={getCheckedItems}>Get Checked Items</button> */}
        </div>
    );
});

export default ModuleList;
