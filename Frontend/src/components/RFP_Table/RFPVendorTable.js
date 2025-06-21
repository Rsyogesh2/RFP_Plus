import React, { useState, useEffect, useContext, useReducer } from 'react';
import './RFPVendorTable.css'; // Import the CSS file
// import {handleFetch,fetchModuleData} from '../../services/Apis'
import { fetchModuleandFitemData } from '../../services/Apis'
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { AppContext } from '../../context/AppContext';
import { handleSave } from '../../services/Apis'


const RFPVendorTable = ({ l1, rfpNo = "", rfpTitle = "", action = "" }) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const [itemData, setItemData] = useState([]);
    const [APCN, setAPCN] = useState({ isAvailableChecked: false, isPartlyAvailableChecked: false, isCustomizableChecked: false });
    const [FItem, setFItem] = useState([]);

    // const fItemReducer = (state, action) => {
    //     switch (action.type) {
    //         case "UPDATE_ITEM":
    //             return state.map(item =>
    //                 item.F2_Code === action.payload.F2_Code
    //                     ? { ...item, SelectedOption: action.payload.value }
    //                     : item
    //             );
    //         default:
    //             return state;
    //     }
    // };

    // const [FItem, dispatchFItem] = useReducer(fItemReducer, []);


    const [data, setdata] = useState([]);
    const [valueL1, setValueL1] = useState(null);
    const { moduleData, userName, userRole, userPower, sidebarValue } = useContext(AppContext); // Access shared state
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', or null
    const [file, setFile] = useState(null);
    const [fileURL, setFileURL] = useState("");

    const handleFileChange = (event, moduleCode, l2Code, l3Code) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;

        setItemData(prevItemData =>
            prevItemData.map(item =>
                item.code === moduleCode
                    ? {
                        ...item,
                        l2: item.l2.map(l2 =>
                            l2.code === l2Code
                                ? {
                                    ...l2,
                                    l3: l2.l3.map(l3 =>
                                        l3.code === l3Code
                                            ? { ...l3, file: uploadedFile, fileURL: URL.createObjectURL(uploadedFile) }
                                            : l3
                                    )
                                }
                                : l2
                        )
                    }
                    : item
            )
        );
    };

    const removeFile = (moduleCode, l2Code, l3Code) => {
        setItemData(prevItemData =>
            prevItemData.map(item =>
                item.code === moduleCode
                    ? {
                        ...item,
                        l2: item.l2.map(l2 =>
                            l2.code === l2Code
                                ? {
                                    ...l2,
                                    l3: l2.l3.map(l3 =>
                                        l3.code === l3Code
                                            ? { ...l3, file: null, fileURL: null }
                                            : l3
                                    )
                                }
                                : l2
                        )
                    }
                    : item
            )
        );
    };


    const handleDownload = (fileData) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(fileData);
        link.download = fileData.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // const handleFileChange = async (event) => {
    //     const selectedFile = event.target.files[0];

    //     if (selectedFile) {
    //         if (selectedFile.size > 5 * 1024 * 1024) {
    //             alert('File size exceeds 5MB. Please upload a smaller file.');
    //             setUploadStatus('error');
    //             return;
    //         }

    //         // Simulate upload process
    //         try {
    //             // Replace with your actual upload logic (API call)
    //             await fakeUpload(selectedFile);
    //             setUploadStatus('success');
    //         } catch (error) {
    //             setUploadStatus('error');
    //         }
    //     }
    // };

    // Simulated upload function (replace with your real API call)
    const fakeUpload = (file) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.5 ? resolve() : reject();
            }, 1000); // Simulates success or failure randomly
        });
    };
    async function fetchDetails() {

        // const res = await fetchModuleandFitemData("RFP123");
        // setdata(res);
        // const result = await fetchModuleData("RFP123");
        // console.log(result);
        // setItemData(result);
        // console.log(itemData);

    }
    useEffect(() => {
        async function fetchArray() {
            console.log("userName " + userName)
            console.log(l1);
            try {
                const response = await fetch(`${API_URL}/fetchAPCN?userName=${userName}&&rfpNo=${rfpNo || sidebarValue[0]?.rfp_no}&&userPower=${userPower}`);
                const data = await response.json();
                console.log(data.functionalScores[0])
                setAPCN(data.functionalScores[0]);
            } catch (error) {
                console.log("Error Fetch the  APCN Value: " + error)
            }

            //23/11/2024
            try {
                console.log(moduleData);

                if (l1 == "Vendor Admin") {
                    setItemData(moduleData.modules);
                    setFItem(moduleData.fitems);
                } else if (l1 == "Super Admin") {
                    setItemData(moduleData.modules);
                    setFItem(moduleData.fitems);
                } else {
                    filterModule(moduleData);
                    setFItem(moduleData.functionalItemDetails[0]);
                }

            } catch (error) {
                console.error('Error sending checked items:', error); // Log any errors
            }

        }
        if (l1 == "Vendor Admin") {
            fetchArray();
        } else if (l1?.l1module !== "" && valueL1 !== l1?.l1module) {
            fetchArray();
            setValueL1(l1.l1module);
        }
    }, [l1, moduleData]);  // Only trigger fetch when `data` changes
    const filterModule = (data) => {
        const data1 = data.itemDetails.l1[0].filter(m => m.code === l1.l1module);
        setItemData(data1);
    }

    // Second useEffect to log the updated state values when `FItem` or `itemData` change
    useEffect(() => {
        console.log("Updated FItem:", FItem);
        console.log("Updated itemData:", itemData);
    }, [FItem, itemData]);  // This will run whenever FItem or itemData changes


    const currentLevel = () => {
        console.log("vuserRole : " + userRole)
        switch (true) {
            case userPower === "User" && userRole === "Maker":
                return 1;
            case userPower === "User" && userRole === "Authorizer":
                return 2;
            case userPower === "User" && userRole === "Reviewer":
                return 3;
            case userPower === "Super Admin" || userRole === "Super Admin":
                return 4;
            case userPower === "Vendor User" && userRole === "Maker":
                return 5;
            case userPower === "Vendor User" && userRole === "Authorizer":
                return 6;
            case userPower === "Vendor User" && userRole === "Reviewer":
                return 7;
            case userPower === "Vendor Admin":
                return 8;
            default:
                return null;
        }
    };
    const nextStatus = () => {
        const levelNum = currentLevel();
        switch (levelNum) {
            case 1:
                return "Bank_Pending_Authorization";
            case 2:
                return "Bank_Pending_Reviewer";
            case 3:
                return "Bank_Pending_Admin";
            case 4:
                return "Vendor_Pending_Maker";
            case 5:
                return "Vendor_Pending_Authorization";
            case 6:
                return "Vendor_Pending_Reviewer";
            case 7:
                return "Vendor_Pending_Admin";
            case 8:
                return "Completed";
        }
    }
    const determineLevel = () => {
        if (userPower === "User" && userRole === "Maker") return 2;
        if (userPower === "User" && userRole === "Authorizer") return 3;
        if (userPower === "User" && userRole === "Reviewer") return 4;
        if (userPower === "Super Admin") return 5;
        if (userPower === "Vendor User" && userRole === "Maker") return 6;
        if (userPower === "Vendor User" && userRole === "Authorizer") return 7;
        if (userPower === "Vendor User" && userRole === "Reviewer") return 8;
        if (userPower === "Vendor Admin") return 4;
        return 5;
    };
    const adjustStageAndStatus = (payload, action, data) => {
        if (action === "Save as Draft") {
            payload.stage = "Draft";
            payload.Status = nextStatus();
            payload.assigned_to = null;
        } else if (["Submit", "Approve", "Submit to Bank"].includes(action)) {
            console.log(nextStatus())
            payload.Status = nextStatus();
            payload.assigned_to = data.assignedTo || null;
        } else if (action === "Reject") {
            payload.stage = "Rejected";
            payload.Status = "Rejected";
            payload.assigned_to = null;
        } else if (action === "Back to Maker") {
            payload.stage = "Draft";
            payload.Status = "Bank_Pending_Maker";
            payload.assigned_to = null;
        } else if (action === "Submit the RFP") {
            payload.stage = "Bank";
            payload.Status = "Completed";
            payload.assigned_to = null;
        }
        payload.stage = userPower === "Vendor User" ? "Vendor"
            : userPower === "User" ? "Bank"
                : userPower === "Vendor Admin" ? "Bank"
                    : userPower === "Super Admin" ? "Vendor"
                        : "";
        return payload;
    };
    const constructPayload = (action, data = {}) => {

        let payload = {
            module: itemData,
            items: FItem,
            rfp_no: sidebarValue[0]?.rfp_no || '',
            rfp_title: sidebarValue[0]?.rfp_title || '',
            bank_name: userPower === "User" ? sidebarValue[0]?.entity_name || '' : '',
            vendor_name: userPower === "User" ? "" : sidebarValue[0]?.entity_name || '',
            created_by: userName,
            level: userPower === "User" && data.action === "Back to Maker" ? 1 : userPower === "Vendor User" && data.action === "Save as Draft" ? 5
                : userPower === "Vendor User" && data.action === "Back to Maker" ? 5 : determineLevel(),
            Comments: data.comments || "",
            Priority: data.priority || "Medium",
            Handled_by: [{ name: userName, role: userRole }],
            Action_log: `${action} by ${userName} on ${new Date().toISOString()}`,
        };

        payload = adjustStageAndStatus(payload, action, data);
        console.log("Constructed Payload:", payload);
        return payload;
    };


    console.log(determineLevel())


    const findIndexByObject = (obj) => {
        return FItem.findIndex(
            (item) =>
                item.F2_Code === obj.F2_Code &&
                item.Module_Code === obj.Module_Code &&
                (!obj.New_Code || item.New_Code === obj.New_Code)
        );
    };
    const handleMandatoryChange = (value, item, TableIndex, parentIndex, subIndex, index) => {
        console.log("fcode " + item.F2_Code + "TableIndex: " + TableIndex + " parentIndex: " + parentIndex + " subIndex " + subIndex + " index " + index)
        const indexofArray = findIndexByObject(item);
        //    consol
        console.log(indexofArray);
        const newData = [...FItem];
        console.log(FItem);
        //    console.log(newData.item.F2_Code);
        newData[indexofArray].SelectedOption = value; // Update the Mandatory value

        setFItem(newData); // Update the state

    };
    const handleCommentsChange = (e, item) => {
        // if (levelType !== 'l3') {
        const indexofArray = findIndexByObject(item);
        const newData = [...FItem];
        newData[indexofArray].Remarks = e.target.value; // Update the comments value
        setFItem(newData); // Update the state
        // }
    };
    const RenderRow = (levelData, f, paddingLeft = 10, TableIndex = null, parentIndex = null, subIndex = null, indexval) => {

        if (!levelData || !Array.isArray(levelData) || levelData[0].deleted) return console.log("its empty"); // Ensure levelData is defined and an array

        // if (!levelData || levelData.deleted) return null; // Ensure we skip rendering if item is invalid
        // console.log(levelData)

        return levelData.map((item, index) => (

            // return (
            // <tr key={`${item.Module_Code}-${item.F2_Code}-${item.New_Code}`} id={`${item.Module_Code}-${item.F2_Code}-${item.New_Code}`}>
            <tr key={`${item.Module_Code}-${item.F2_Code}-${item.New_Code}`} id={`${item.Module_Code}-${item.F2_Code}-${item.New_Code}`}>
                <td
                    style={{
                        fontWeight: "normal",
                        paddingLeft: `${paddingLeft}px`,
                        whiteSpace: "wrap",
                    }}
                >
                    {item.name}
                </td>
                <td>{item.Mandatory === 0 ? "O" : "M"}</td>
                {/* <td style={{fontWeight:"normal"}}>{item.Comments}</td> */}

                {APCN?.isAvailableChecked !== 0 && <td>
                    <input
                        type="radio"
                        checked={item.A === 1 || item.SelectedOption === "A"}
                        onChange={userRole === "Maker" && (!FItem?.[0]?.vendor_level || FItem[0].vendor_level === 5) ? () => handleMandatoryChange("A", item, TableIndex, parentIndex, subIndex, index) : undefined}
                        name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}`}
                    />
                </td>}
                {APCN?.isPartlyAvailableChecked !== 0 && <td>
                    <input
                        type="radio"
                        checked={item.P === 1 || item.SelectedOption === "P"}
                        onChange={userRole === "Maker" && (!FItem?.[0]?.vendor_level || FItem[0].vendor_level === 5) ? () => handleMandatoryChange("P", item, TableIndex, parentIndex, subIndex, index) : undefined}
                        name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}`}
                    />
                </td>}
                {APCN?.isCustomizableChecked !== 0 && <td>
                    <input
                        type="radio"
                        checked={item.C === 1 || item.SelectedOption === "C"}
                        onChange={userRole === "Maker" && (!FItem?.[0]?.vendor_level || FItem[0].vendor_level === 5) ? () => handleMandatoryChange("C", item, TableIndex, parentIndex, subIndex, index) : undefined}
                        name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}`}
                    />
                </td>}
                <td>
                    <input
                        type="radio"
                        checked={item.N === 1 || item.SelectedOption === "N"}
                        onChange={userRole === "Maker" && (!FItem?.[0]?.vendor_level || FItem[0].vendor_level === 5) ? () => handleMandatoryChange("N", item, TableIndex, parentIndex, subIndex, index) : undefined}
                        name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}`}
                    />
                </td>

                {/* <td><input type="radio" checked={item.P === 1 ? true : false ||item.SelectedOption==="P"?true:false} onChange={() => handleMandatoryChange("P", item, TableIndex, parentIndex, subIndex, index)}
                    name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}`} /></td>
                <td><input type="radio" checked={item.C === 1 ? true : false ||item.SelectedOption==="C"?true:false} onChange={() => handleMandatoryChange("C", item, TableIndex, parentIndex, subIndex, index)}
                    name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}`} /></td>
                <td><input type="radio" checked={item.N === 1 ? true : false ||item.SelectedOption==="N"?true:false} onChange={() => handleMandatoryChange("N", item, TableIndex, parentIndex, subIndex, index)}
                    name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}`} /></td> */}
                <td style={{
                    padding: "0px",
                    height: "100%",
                    textAlign: "center",
                    fontWeight: "normal", // Important — force it here too!
                }}>
                    {userRole === 'Maker' && (!FItem?.[0]?.vendor_level || FItem[0].vendor_level === 5) ? (
                        <textarea
                            style={{
                                border: "none",
                                outline: "none",
                                resize: "none",
                                width: "100%",
                                minHeight: "80px", // 👈 Ensures there's room for multiple lines
                                height: "auto",     // 👈 Allows it to grow with content
                                boxSizing: "border-box",
                                padding: "4px",
                                margin: 0,
                                font: "inherit",
                                display: "block",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                            }}
                            value={item.Remarks}
                            onChange={(e) => handleCommentsChange(e, item)}
                        />
                    ) : (
                        <span style={{
                            fontWeight: "normal",
                            border: "none",
                            outline: "none",
                            resize: "none",
                            width: "100%",
                            height: "auto",     // 👈 Allows it to grow with content
                            boxSizing: "border-box",
                            padding: "4px",
                            margin: 0,
                            font: "inherit",
                            display: "block",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                        }}>{item.Remarks}</span>
                    )}
                </td>

                {/* <td>
                    <div>
                        <label htmlFor="fileUpload">
                            <MdOutlineDriveFolderUpload
                                size={20}
                                style={{
                                    cursor: 'pointer',
                                    color: uploadStatus === 'success' ? 'green' : uploadStatus === 'error' ? 'red' : 'black'
                                }}
                            />
                        </label>
                        <input
                            id="fileUpload"
                            type="file"
                            accept=".jpg,.png,.pdf,.docx"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            disabled={userRole !== 'Maker'}
                        />
                        {uploadStatus === 'success' && <p>File uploaded successfully!</p>}
                        {uploadStatus === 'error' && <p style={{ color: 'red' }}>File upload failed.</p>}
                    </div>
                </td> */}
            </tr>
        )
        );
    };


    const Tables = (l2, index1, f1, index, indexval) => {
        // console.log(FItem);
        // console.log(l2);
        // console.log(FItem);
        // console.log(l2);

        // const unMatchingCodes = l2.l3.map(l3 => l3.code);
        // // console.log(unMatchingCodes);
        // let newItem = { F2_Code: '', F1_Code: `${index1} - ${index}`, name: unMatchingCodes[index] ,Module_Code:l2.code}

        const matchingCodes = FItem.filter(f => f.Module_Code.startsWith(l2.code));
        // console.log(matchingCodes);
        const f1FItem = matchingCodes.filter(f1 => f1.F2_Code.endsWith("00"));
        // console.log(f1FItem);
        // const f2FItem = matchingCodes.filter(f1=>!(f1.F2_Code.endsWith("00"))&&f1.F2_Code!==""&&f1.F2_Code.startsWith(f1.F1_Code))
        // console.log(f2FItem);
        return (
            <table className="item-table1">
                <colgroup>
                    <col style={{ width: "40%" }} />
                    <col style={{ width: "6%" }} />
                    {APCN?.isAvailableChecked !== 0 && <col style={{ width: "6%" }} />}
                    {APCN?.isPartlyAvailableChecked !== 0 && <col style={{ width: "6%" }} />}
                    {APCN?.isCustomizableChecked !== 0 && <col style={{ width: "6%" }} />}
                    <col style={{ width: "6%" }} />
                    <col style={{ width: "30%" }} />
                    {/* <col style={{ width: "30%" }} /> */}
                </colgroup>
                <thead>
                    <tr className='header-row-vendor'>
                        <th>Requirement</th>
                        <th>M/O</th>
                        {/* <th>Comments</th> */}
                        {APCN?.isAvailableChecked !== 0 && <th>A</th>}
                        {APCN?.isPartlyAvailableChecked !== 0 && <th>P</th>}
                        {APCN?.isCustomizableChecked !== 0 && <th>C</th>}
                        <th>N</th>
                        {/* <th>P</th>
                        <th>C</th>
                        <th>N</th> */}
                        <th>Remarks</th>
                        {/* <th>Attach</th> */}
                    </tr>
                </thead>
                <tbody>
                    {/* {FItem[l]&&FItem[l].map((item, index) => ( */}
                    {f1FItem && f1FItem.length > 0 ? (
                        f1FItem.map((item, index) => {
                            const f2FItem = matchingCodes.filter(f1 =>
                                !f1.F2_Code.endsWith("00") &&
                                f1.F2_Code.startsWith(item.F1_Code)
                                // && !f1.New_Code
                            );

                            // console.log(f2FItem)
                            return (
                                <React.Fragment key={item.code}>
                                    {RenderRow([item], 'f1', 10, index1, index, indexval)}

                                    {f2FItem && f2FItem.map((level2, subIndex) => (
                                        <React.Fragment key={level2.F2_Code}>
                                            {RenderRow([level2], 'f2', 50, index1, index, subIndex, indexval)}
                                            {/* {RenderRow({level2},index, 'f2', 100, index1)} */}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        // Render a single default row if f1FItem is empty
                        <React.Fragment>
                            {/* {RenderRow(
                              {"newItem":"ok"},
                              index,
                              'f1',
                              10,
                              index1
                          )
                          } */}
                            {/* {FItem.push(newItem)} */}
                        </React.Fragment>
                    )}

                </tbody>
                <div></div>
            </table>

        );
    }

    return (
        <div className="rfp-table p-6 rounded-xl space-y-6">

            {/* RFP Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 items-center border-b border-gray-300 pb-4 gap-4">

                {/* Left: RFP No & Title */}
                <div className="space-y-1">
                    <div className="text-base font-bold text-[#2F4F8B]">
                        RFP No: {rfpNo || sidebarValue?.[0]?.rfp_no}
                    </div>
                    <div className="text-base font-bold text-[#2F4F8B]">
                        RFP Title: {rfpTitle || sidebarValue?.[0]?.rfp_title}
                    </div>
                </div>

                {/* Right: Labels */}
                <div className="flex flex-wrap justify-end md:justify-end items-center gap-2 text-xs">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        M-Mandatory | O-Optional
                    </span>

                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        A-Available | P-Partly | C-Customizable | N-Not
                    </span>

                    <span className={`px-3 py-1 rounded-full ${FItem?.[0]?.vendor_status === "Completed"
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'}`}>
                        {FItem?.[0]?.vendor_status === "Completed"
                            ? "Completed"
                            : Number(FItem?.[0]?.Level) > 4 && Number(FItem?.[0]?.vendor_level) !== 4
                                ? "Vendor Level"
                                : Number(FItem?.[0]?.Level) === 1
                                    ? "Maker Stage"
                                    : Number(FItem?.[0]?.Level) === 2
                                        ? "Authorizer Stage"
                                        : Number(FItem?.[0]?.Level) === 3
                                            ? "Reviewer Stage"
                                            : ""}
                    </span>
                </div>

            </div>


            {/* Module Header */}
            <div className="module-header space-y-6 w-full min-w-[100%] mx-auto">

                {itemData && itemData.length > 0 && (
                    itemData.map((item, index1) => (
                        <details key={item.code} className="border rounded-xl bg-white shadow p-4 space-y-4 w-full">
                            <summary className="cursor-pointer text-md font-bold text-[#2F4F8B] list-none outline-none">
                                {index1 + 1}. {item.name}
                            </summary>

                            {item.l2.map((l2, index2) => {
                                const indexval = `${index1 + 1}.${index2 + 1}`;

                                return (
                                    <details key={l2.code} className="pl-4 border rounded-lg bg-[#f9fafc] p-2 space-y-3 w-full">

                                        <summary className="cursor-pointer text-sm font-semibold text-[#2F4F8B] px-2 py-1 ">
                                            {indexval} {l2.name}
                                        </summary>

                                        {l2.l3 && l2.l3.length > 0 ? (

                                            l2.l3.map((l3, index) => {
                                                const indexval3 = `${index1 + 1}.${index2 + 1}.${index + 1}`;
                                                return (
                                                    <div key={l3.code} className="space-y-2">

                                                        {/* Level 3 Header Row */}
                                                        <div className="flex justify-between items-center px-2 py-1">

                                                            <span className="text-sm text-gray-800">
                                                                {indexval3} {l3.name}
                                                            </span>

                                                            {/* File uploader */}
                                                            <div className="flex space-x-2 text-xs">

                                                                {!l3.file ? (
                                                                    <label className="cursor-pointer text-blue-600 hover:text-blue-800">
                                                                        <input
                                                                            type="file"
                                                                            onChange={(e) => handleFileChange(e, item.code, l2.code, l3.code)}
                                                                            hidden
                                                                        />
                                                                        📂
                                                                    </label>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            className="text-green-600 hover:text-green-800"
                                                                            onClick={() => window.open(l3.fileURL, "_blank")}
                                                                        >
                                                                            👁 View
                                                                        </button>
                                                                        <button
                                                                            className="text-blue-600 hover:text-blue-800"
                                                                            onClick={() => handleDownload(l3.file)}
                                                                        >
                                                                            ⬇ Download
                                                                        </button>
                                                                        <button
                                                                            className="text-red-600 hover:text-red-800"
                                                                            onClick={() => removeFile(item.code, l2.code, l3.code)}
                                                                        >
                                                                            🗑 Remove
                                                                        </button>
                                                                    </>
                                                                )}

                                                            </div>

                                                        </div>

                                                        {/* Table Full Width */}
                                                        <div className="w-full">
                                                            {Tables(l3, index1, "f1", index, userRole)}
                                                        </div>

                                                    </div>
                                                )
                                            })

                                        ) : (
                                            <div className="w-full">
                                                {Tables(l2, index1, "l3", index2, indexval, userRole)}
                                            </div>
                                        )}

                                    </details>
                                )
                            })}
                        </details>
                    ))
                )}

            </div>


            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end pt-6 border-t border-gray-300 mt-8">

                {(userRole === "Authorizer") && Number(FItem?.[0]?.vendor_level) === 6 && (
                    <>
                        <button
                            className="px-5 py-2 bg-[#2F4F8B] text-white rounded-xl hover:bg-[#1e3669] transition"
                            onClick={() => handleSave(constructPayload("Submit", {}), userPower, "RFP Authorized Successfully")}
                        >
                            Authorize
                        </button>

                        <button
                            className="px-5 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                            onClick={() => handleSave(constructPayload("Back to Maker", { action: "Back to Maker" }), userPower, "RFP Sent Back to Maker")}
                        >
                            Back to Maker
                        </button>
                    </>
                )}

                {userRole === "Maker" && Number(FItem?.[0]?.vendor_level ?? FItem?.[0]?.Level) === 5 && (
                    <>
                        <button
                            className="px-5 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition"
                            onClick={() => handleSave(constructPayload("Save as Draft", { action: "Save as Draft" }), userPower, "RFP Saved as Draft")}
                        >
                            Save as Draft
                        </button>

                        <button
                            className="px-5 py-2 bg-[#2F4F8B] text-white rounded-xl hover:bg-[#1e3669] transition"
                            onClick={() => handleSave(constructPayload("Submit", {}), userPower, "RFP Submitted to Authorizer")}
                        >
                            Submit to Authorizer
                        </button>
                    </>
                )}

                {userPower === "Vendor Admin" && FItem?.length > 0 &&
                    FItem.every(item => Number(item?.vendor_level) === 7) && (
                        <button
                            className="px-5 py-2 bg-[#2F4F8B] text-white rounded-xl hover:bg-[#1e3669] transition"
                            onClick={() => handleSave(constructPayload("Submit", { action: "Submit the RFP" }), "Vendor Admin", "RFP Submitted to Bank")}
                        >
                            Submit the RFP
                        </button>
                    )}

                {userPower === "Vendor Admin" && action === "Submit RFP" && FItem?.length > 0 &&
                    FItem.every(item => Number(item?.vendor_level) === 4) && (
                        <div className="px-5 py-2 bg-green-100 text-green-700 rounded-xl">
                            RFP is Submitted to Bank
                        </div>
                    )}

            </div>

        </div>

    );
};

export default RFPVendorTable;