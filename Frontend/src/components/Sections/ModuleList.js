import React, { useState, useEffect, useContext, useImperativeHandle, forwardRef } from 'react';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import sendCheckedItems from '../../services/Apis';
import { AppContext } from '../../context/AppContext';
import './ModuleList.css';

const ModuleList = forwardRef(({ title, url }, ref) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const [modules, setModules] = useState([]);
    const [items, setItems] = useState([]);
    const { setModuleData, setAssignModule, userName } = useContext(AppContext);

    // Fetch module names on initial load
    useEffect(() => {
        fetchModulesandProducts();
    }, []);

    const fetchModulesandProducts = async () => {
        try {
            const queryParams = new URLSearchParams({ userName });
            const response = await fetch(`${API_URL}/api${url}?${queryParams}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }); // Adjust the endpoint as needed
            const data = await response.json();
            console.log(url)
            let formattedModules;

            if (url == "/assignModule") {
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
            if (url == "/assignModule") {
                const updatedModules = [...modules];
                console.log(updatedModules);
                updatedModules[index].expanded = true;
                setModules(updatedModules);
            } else {
                const response = await fetch(`${API_URL}/api/${url}/${moduleName}/subItems`); // Adjust the endpoint
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
        console.log(modules)
        const checkedItems = modules.flatMap((module) =>
            module.subItems
                .filter((subItem) => subItem.selected)
                .map((subItem) => ({
                    parent: module.name,
                    parentCode: module.Code,
                    subItem: subItem.name,
                    subItemCode: subItem.Code
                }))
        );
        console.log("Checked Items:", checkedItems);
        console.log(checkedItems)
        const subItems = checkedItems.map(item => item.subItem);
        const subItems1 = checkedItems.map(item => console.log(item));
        console.log(subItems);

        setAssignModule(subItems);
        setModuleData(sendCheckedItems(subItems));
        if (i === "RFPCreation") {
            return [subItems, checkedItems]
        } else if (i === "RFPAssignedtoSuperUser") {
            return subItems
        }
        alert("RFP getCheckedItems");

    };
    // Function to clear selection
    const clearSelection = () => {
        setModuleData([]); // Reset the selected items state
    };
    useImperativeHandle(ref, () => ({
        getCheckedItems,
        clearSelection,  // Exposing the clearSelection method
    }));
    // const fetchItemsDetails = async (checkedItems) => {
    //     try {
    //         const response = await fetch(`${API_URL}/api/products/${checkedItems}/itemDetails`); // Adjust the endpoint
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
        <div className="bg-white p-6 rounded-xl w-full max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{title}</h2>

            <div className="rounded-lg overflow-hidden border border-gray-200">
                <table className="w-full text-sm text-gray-800">
                    <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Modules</th>
                            <th className="px-4 py-3 text-center">Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modules.map((module, index) => (
                            <React.Fragment key={index}>
                                <tr className="border-t hover:bg-gray-50 transition duration-200">
                                    <td
                                        className="px-4 py-3 font-medium text-blue-700 cursor-pointer whitespace-normal"
                                        onClick={() => toggleExpand(index)}
                                    >
                                        {module.name}
                                    </td>
                                    <td
                                        className="px-4 py-3 cursor-pointer text-blue-600"
                                        onClick={() => toggleExpand(index)}
                                    >
                                        <div className="flex justify-center items-center text-xl">
                                            {module.expanded ? <AiOutlineMinus /> : <AiOutlinePlus />}
                                        </div>
                                    </td>

                                </tr>

                                {module.expanded &&
                                    module.subItems?.map((subItem, subIndex) => (
                                        <tr key={`${index}-${subIndex}`} className="border-t bg-gray-50 hover:bg-gray-100">
                                            <td className="pl-8 pr-4 py-2 text-gray-700 text-sm whitespace-normal">
                                                <span className="inline-block mr-1 text-gray-400">↳</span>
                                                {subItem.name}
                                            </td>
                                            <td className="w-[60px] px-2 py-0 align-middle">
                                                <div className="h-full flex items-center justify-center py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={subItem.selected}
                                                        onChange={() => toggleCheckbox(index, subIndex)}
                                                        className="form-checkbox h-4 w-4 text-blue-600 !m-0 !mr-0"
                                                    />
                                                </div>
                                            </td>


                                        </tr>

                                    ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>


    );
});

export default ModuleList;
