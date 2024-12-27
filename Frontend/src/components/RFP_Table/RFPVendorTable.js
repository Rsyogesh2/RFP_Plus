import React, { useState, useEffect, useContext } from 'react';
import './RFPVendorTable.css'; // Import the CSS file
// import {handleFetch,fetchModuleData} from '../../services/Apis'
import {fetchModuleandFitemData} from '../../services/Apis'
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { AppContext } from '../../context/AppContext';


const RFPVendorTable = ({ l1, userRole }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
  const [itemData, setItemData] = useState([]);
  const [FItem, setFItem] = useState([]);
  const [data, setdata] = useState([]);
  const { moduleData, userName, userPower, sidebarValue } = useContext(AppContext); // Access shared state
   
  async function fetchDetails(){
 
    const res = await fetchModuleandFitemData("RFP123");
    setdata(res);
    // const result = await fetchModuleData("RFP123");
    // console.log(result);
    // setItemData(result);
    // console.log(itemData);
    
  }
  useEffect(() => {
    // async function fetchArray() {
    //   // const res = await fetchModuleandFitemData("RFP123");
    //   // console.log(res.fitems);
    //   // console.log(res.modules);
    //   setFItem(data.fitems);
    //   setItemData(data.modules);
    // }
    // if (data) {
    //   fetchArray();
    // }
    async function fetchArray() {
      // const result = await moduleData; // Wait for moduleData to resolve if it's a Promise
      // console.log("result", result.functionalItemDetails); // Log the resolved array
      console.log("userName " + userName)
      console.log(l1)
      //23/11/2024
      try {
          // const queryParams = new URLSearchParams({ userName, l1: l1.l1module, userPower });
          // const response = await fetch(`${API_URL}/api/userAssignItemsbySub?${queryParams}`)
          // console.log(response);

          // // Check if the response is okay (status in the range 200-299)
          // if (!response.ok) {
          //     throw new Error(`HTTP error! Status: ${response.status}`);
          // }

          // const data = await response.json(); // Parse the JSON response
          // console.log(data);  // Handle the fetched data as needed
          
          // setItemData(data.itemDetails.l1); // Set the resolved data to local state
          // setName(data.itemDetails.Name); // Set the resolved data to local state
          console.log(moduleData);
          // setSidebarValue(data.itemDetails);
          setFItem(moduleData.functionalItemDetails);
          filterModule(moduleData);
      } catch (error) {
          console.error('Error sending checked items:', error); // Log any errors
      }

  } fetchArray();
  }, [data]);  // Only trigger fetch when `data` changes
  const filterModule = (data) => {

    const data1 = data.itemDetails.l1.filter(m=>m.code===l1.l1module);
    setItemData(data1); 
}

  // Second useEffect to log the updated state values when `FItem` or `itemData` change
  useEffect(() => {
    console.log("Updated FItem:", FItem);
    console.log("Updated itemData:", itemData);
  }, [FItem, itemData]);  // This will run whenever FItem or itemData changes

  
  const RenderRow = ({ item }, index, f, paddingLeft = 10) => {
    if (!item || item.deleted) return null; // Ensure we skip rendering if item is invalid
    // console.log(index);
  
    return (
      <tr key={item.F2_Code || index}>
        <td
          style={{
            fontWeight: f === "f2" ? "bold" : "normal",
            paddingLeft: `${paddingLeft}px`,
          }}
        >
          {item.name}
        </td>
        <td>{item.Mandatory === 0 ? "O" : "M"}</td>
        <td>{item.Comments}</td>
        <td><input type="radio" name={`${item.F2_Code} - ${item.Module_Code} `} /></td>
        <td><input type="radio"  name={`${item.F2_Code} - ${item.Module_Code} `}/></td>
        <td><input type="radio" name={`${item.F2_Code} - ${item.Module_Code} `} /></td>
        <td><input type="radio"  name={`${item.F2_Code} - ${item.Module_Code} `}/></td>
        <td><textarea style={{ border: 'none' }} /></td>
        <td><MdOutlineDriveFolderUpload />
        </td>
      </tr>
    );
  };
  
    
    const Tables =(l2,index1,f1,index)=>{
      // console.log(FItem);
      // console.log(l2);
      // console.log(FItem);
      // console.log(l2);

      const unMatchingCodes = l2.l3.map(l3 => l3.code);
      // console.log(unMatchingCodes);
      let newItem = { F2_Code: '', F1_Code: `${index1} - ${index}`, name: unMatchingCodes[index] ,Module_Code:l2.code}
     
      const matchingCodes = FItem.filter(f => f.Module_Code.startsWith(l2.code));
      // console.log(matchingCodes);
      const f1FItem = matchingCodes.filter(f1=>f1.F2_Code.endsWith("00"));
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
                                  {RenderRow({item},index, 'f1', 10, index1)}
                                  
                                  {f2FItem && f2FItem.map((level2, subIndex) => (
                                      <React.Fragment key={level2.F2_Code}>
                                          {RenderRow({level2},index, 'f2', 100, index1)}
                                      </React.Fragment>
                                  ))}
                              </React.Fragment>
                          );
                      })
                  ) : (
                      // Render a single default row if f1FItem is empty
                      <React.Fragment>
                          {RenderRow(
                              {newItem},
                              index,
                              'f1',
                              10,
                              index1
                          )
                          }
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
          <span>RFP No:</span> <span>RFP Title:</span>
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
                          return(
                           <div key={index1} className='level1'>

                           <span className='l1'> {index1+1+". "}{item.name} </span>
                           {item.l2.map((l2, index2) =>{
                            return(
                            <div key={l2.code} className='level2'>

                            <span className='l2'> {(index1+1)+"."+(Number(index2)+1)}{" "+l2.name} </span>
                            {l2.l3 && l2.l3.length > 0 ? (
                                <>
                                    {l2.l3.map((l3, index) => (
                                    <div key={l3.code} className='level3'>
                                        <span className='l3'>{(index1+1)+"."+(Number(index2)+1)+"."+(Number(index)+1)}{" "+l3.name}</span>
                                        
                                        {/* <Tables l2={l2} index1={index1} f1={"f1"} index={index} /> */}
                                        {Tables(l2, index1, "f1",index)}
                                    </div>
                                    ))}
                                </>
                                ) : (
                                Tables(l2, index1, "l3",index2)
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
     
      {/* <table className="item-table1"  id="table2">
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
          {FItem.map((item, index) => (
            !item.deleted &&
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.Mandatory==0?"O":"M"}</td>
              <td>{item.Comments} </td>
              
              <td><input type="checkbox" /></td>
              <td><input type="checkbox" /></td>
              <td><input type="checkbox" /></td>
              <td><input type="checkbox" /></td>
              <td><input type="text" /></td>
              <td><input type="file" /></td>
            </tr>
          ))}
          <tr>
           
            <td colSpan={11}></td>
          </tr>
        </tbody>
      </table> */}
      <button onClick={() => fetchDetails()}>Submit</button>
    </div>
  );
};

export default RFPVendorTable;