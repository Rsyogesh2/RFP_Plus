import React, { useState, useEffect, useContext } from 'react';
import './RFPVendorTable.css'; // Import the CSS file
// import {handleFetch,fetchModuleData} from '../../services/Apis'
import { fetchModuleandFitemData } from '../../services/Apis'
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { AppContext } from '../../context/AppContext';
import { handleSave } from '../../services/Apis'


const RFPVendorTable = ({ l1 }) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const [itemData, setItemData] = useState([]);
    const [FItem, setFItem] = useState([]);
    const [data, setdata] = useState([]);
    const [valueL1, setValueL1] = useState(null);
    const { moduleData, userName, userRole, userPower, sidebarValue } = useContext(AppContext); // Access shared state
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', or null

    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB. Please upload a smaller file.');
                setUploadStatus('error');
                return;
            }

            // Simulate upload process
            try {
                // Replace with your actual upload logic (API call)
                await fakeUpload(selectedFile);
                setUploadStatus('success');
            } catch (error) {
                setUploadStatus('error');
            }
        }
    };

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
            console.log(l1)
            //23/11/2024
            try {
                console.log(moduleData);
                // setSidebarValue(data.itemDetails);
                setFItem(moduleData.functionalItemDetails);
                filterModule(moduleData);
            } catch (error) {
                console.error('Error sending checked items:', error); // Log any errors
            }

        } if (l1.l1module !== "" && valueL1 !== l1.l1module) {
            fetchArray();
            setValueL1(l1.l1module);
        }
    }, [l1]);  // Only trigger fetch when `data` changes
    const filterModule = (data) => {

        const data1 = data.itemDetails.l1.filter(m => m.code === l1.l1module);
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
            level: userPower === "User" && data.action === "Back to Maker" ? 1
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
                    }}
                >
                    {item.name}
                </td>
                <td>{item.Mandatory === 0 ? "O" : "M"}</td>
                <td>{item.Comments}</td>
                <td><input type="radio" checked={item.A === 1 ? true : false} onChange={() => handleMandatoryChange("A", item, TableIndex, parentIndex, subIndex, index)}
                    name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}`} /></td>
                <td><input type="radio" checked={item.P === 1 ? true : false} onChange={() => handleMandatoryChange("P", item, TableIndex, parentIndex, subIndex, index)}
                    name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}`} /></td>
                <td><input type="radio" checked={item.C === 1 ? true : false} onChange={() => handleMandatoryChange("C", item, TableIndex, parentIndex, subIndex, index)}
                    name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}`} /></td>
                <td><input type="radio" checked={item.N === 1 ? true : false} onChange={() => handleMandatoryChange("N", item, TableIndex, parentIndex, subIndex, index)}
                    name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}`} /></td>
                <td style={{ padding: "5px", height: '100%',textAlign:"center" }}>
                    {userRole !== 'Maker' ? (
                        <span style={{ fontWeight:"normal"}}>{item.Remarks}</span>
                    ) : (
                        <textarea
                            style={{
                                border: 'none',
                                outline: 'none',
                                resize: 'none',
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box',
                                display: 'block'
                            }}
                            value={item.Remarks}
                            onChange={(e) => handleCommentsChange(e, item)}
                        />
                    )}
                </td>

                <td>
                    <div>
                        <label htmlFor="fileUpload">
                            <MdOutlineDriveFolderUpload
                                size={30}
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
                </td>
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
                {/* <colgroup>
              <col style={{ width: "8%" }} />
              <col style={{ width: "70%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "1%" }} />
              <col style={{ width: "25%" }} />
          </colgroup> */}
                <thead>
                    <tr>
                        <th>Requirement</th>
                        <th>M/O</th>
                        <th>Comments</th>
                        <th>A</th>
                        <th>P</th>
                        <th>C</th>
                        <th>N</th>
                        <th>Remarks</th>
                        <th>Attach</th>
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
        <div className="rfp-table">
            <div className="header">
                <div className="title">
                    <span>RFP No: {sidebarValue && sidebarValue[0]?.rfp_no}</span>
                    <span>&nbsp;&nbsp; RFP Title: {sidebarValue && sidebarValue[0]?.rfp_title}</span>
                </div>
                <div className="labels">
                    <span>M-Mandatory | O-Optional</span>
                    <span>A-Available | P-Partly available | C-Customizable | N-Not available</span>
                </div>
            </div>

            <div className="module-header">
                {/* start here */}
                {itemData && itemData.length > 0 && (
                    <div>
                        {itemData.map((item, index1) => {
                            return (
                                <div key={index1} className='level1'>

                                    <span className='l1'> {index1 + 1 + ". "}{item.name} </span>
                                    {item.l2.map((l2, index2) => {
                                        const indexval = (index1 + 1) + "." + (Number(index2) + 1);

                                        return (
                                            <div key={l2.code} className='level2'>

                                                <span className='l2'> {(index1 + 1) + "." + (Number(index2) + 1)}{" " + l2.name} </span>
                                                {l2.l3 && l2.l3.length > 0 ? (
                                                    <>
                                                        {l2.l3.map((l3, index) => (
                                                            <div key={l3.code} className='level3'>
                                                                <span className='l3'>{(index1 + 1) + "." + (Number(index2) + 1) + "." + (Number(index) + 1)}{" " + l3.name}</span>

                                                                {/* <Tables l2={l2} index1={index1} f1={"f1"} index={index} /> */}
                                                                {Tables(l3, index1, "f1", index, userRole)}
                                                            </div>
                                                        ))}
                                                    </>
                                                ) : (
                                                    Tables(l2, index1, "l3", index2, indexval, userRole)
                                                    // Tables(l2, index1, "l3",index2)
                                                    // <Tables l2={l2} index1={index1} f1={"l3"} index={index} />
                                                )}
                                            </div>
                                        )
                                    }
                                    )}
                                </div>
                            )

                        })}
                    </div>
                )}

            </div>
            {/* Show Submit button only for Authorizer or Reviewer */}
            {(userRole === "Authorizer" || userRole === "Reviewer") && (
                <button className="submitbtn" onClick={() => handleSave(constructPayload("Submit", {}), "Vendor User")}>
                    Submit
                </button>
            )}
            {(userRole === "Authorizer" || userRole === "Reviewer") && (
                <button onClick={() => handleSave(constructPayload("Back to Maker", { action: "Back to Maker" }), "Vendor User")}>
                    Back to Maker
                </button>
            )}

            {/* Optional Save as Draft button for Maker */}
            {userRole === "Maker" && (
                <button onClick={() => handleSave(constructPayload("Save as Draft", {}), "Vendor User")}>
                    Save as Draft
                </button>
            )}
            {userRole === "Maker" && (
                <button className="submitbtn" onClick={() => handleSave(constructPayload("Submit", {}), "Vendor User")}>
                    Submit
                </button>
            )}
        </div>
    );
};

export default RFPVendorTable;