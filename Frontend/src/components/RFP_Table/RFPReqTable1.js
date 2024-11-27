
import React, { useState, useEffect, useContext } from 'react';
import './RFPReqTable.css'; // Import the CSS file
import { AppContext } from '../../context/AppContext';

import TableRow from './TableRow.js';
// import sendCheckedItems from '../../services/Apis'

const RFPReqTable = () => {

    const [itemData, setItemData] = useState(null); // Initially, no data
    const [FItem, setFItem] = useState([{
        name: "",
        Module_Code: "",
        F1_Code: "",
        F2_Code: "",
        isEditing: false,
        MorO: "",
        Comments: ""
      }]); // Initially, no data

    const { moduleData } = useContext(AppContext); // Access shared state
    // console.log(moduleData);


    useEffect(() => {
        // Define an async function to log array and set item data
        async function fetchArray() {
            const result = await moduleData; // Wait for moduleData to resolve if it's a Promise
            // console.log("result", result.functionalItemDetails); // Log the resolved array
            setItemData(result.itemDetails.l1); // Set the resolved data to local state
            setFItem(result.functionalItemDetails);
        }

        // Call logArray when moduleData changes
        if (moduleData) {
            fetchArray();
        }
    }, [moduleData]);

  

    const Tables =React.memo(({l2,index1,f1,index})=>{
        // console.log(items);
        console.log("rendering Table");
        // console.log(items);
        // console.log(l2);

        const unMatchingCodes = l2.l3.map(l3 => l3.code);
        // console.log(unMatchingCodes);
        let newItem = { F2_Code: '', F1_Code: `${index1} - ${index}`, name: unMatchingCodes[index] ,Module_Code:l2.code}
       
        const matchingCodes = FItem.filter(f => f.Module_Code.startsWith(l2.code));
        // console.log(matchingCodes);
        const f1items = matchingCodes.filter(f1=>f1.F2_Code.endsWith("00"))
        // console.log(f1items);
        // const f2items = matchingCodes.filter(f1=>!(f1.F2_Code.endsWith("00"))&&f1.F2_Code!==""&&f1.F2_Code.startsWith(f1.F1_Code))
        // console.log(f2items);
        return (
        <table className="item-table">
                <thead>
                    <tr>
                        <th>Modify</th>
                        <th>Requirement</th>
                        <th>M</th>
                        <th>O</th>
                        <th>Comments</th>
                        {/* <th>Score</th> */}
                    </tr>
                </thead>
                <tbody>
                    {/* {items[l]&&items[l].map((item, index) => ( */}
                    {f1items && f1items.length > 0 ? (
                        f1items.map((item, index) => {
                            const f2items = matchingCodes.filter(f1 => 
                                !f1.F2_Code.endsWith("00") &&
                                f1.F2_Code.startsWith(item.F1_Code)
                            );

                            return (
                                <React.Fragment key={item.code}>
                                    {/* {renderHierarchy([item], 'f1', 10, index1, index)} */}
                                    <TableRow
                                        key={item.F2_Code}
                                        item={item}
                                        levelType="f1"
                                        paddingLeft={10}
                                        TableIndex={index1}
                                        parentIndex={index}
                                        subIndex={index}
                                    />

                                    {f2items && f2items.map((level2, subIndex) => (
                                        <React.Fragment key={level2.code}>
                                            {/* {renderHierarchy([level2], 'f2', 50, index1, index, subIndex)} */}
                                            <TableRow
                                                key={item.F2_Code}
                                                item={item}
                                                levelType="f2"
                                                paddingLeft={50}
                                                TableIndex={index1}
                                                parentIndex={index}
                                                subIndex={index}
                                            />
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        // Render a single default row if f1items is empty
                        <React.Fragment>
                            {/* {renderHierarchy(
                                [newItem],
                                'f1',
                                10,
                                index1
                            )
                            } */}
                             {/* <TableRow
                                key={newItem.F2_Code}
                                item={newItem}
                                levelType="f1"
                                paddingLeft={10}
                                TableIndex={index1}
                                parentIndex={index}
                                subIndex={index}
                            /> */}
                            {/* {FItem.push(newItem)} */}
                        </React.Fragment>
                    )}

                </tbody>
                </table>  
        );
    })

    return (
        <div className="rfp-table">
            <div className="header">
                <div className="title">
                    <span>RFP No: {123456}  </span>
                    <span>RFP Title: {"Customer Onboarding"}</span>
                </div>
            </div>
            <div className="labels">
                <span>M-Mandatory | O-Optional </span>
                <span>A-Available | P-Partly available | C-Customizable | N-Not available</span>
            </div>
            <div className="module-header">
                {/* <span>1.1. Module L2</span> */}
                <span></span>
                
            {itemData && itemData.length > 0 && (
                <div>
                        {itemData.map((item, index1) => {
                          return(
                           <div key={index1}>

                           <span> {index1+1+". "}{item.name} </span>
                           {item.l2.map((l2, index) =>{
                            return(
                            <div key={l2.code}>

                            <span> {(index1+1)+"."+(Number(index)+1)}{" "+l2.name} </span>
                            {l2.l3 && l2.l3.length > 0 ? (
                                <>
                                    {l2.l3.map((l3, index) => (
                                    <div key={l3.code}>
                                        <span>{"L3: "+l3.name}</span>
                                        
                                        <Tables l2={l2} index1={index1} f1={"f1"} index={index} />
                                        {/* {renderTable(l2, index1, "f1",index)} */}
                                    </div>
                                    ))}
                                </>
                                ) : (
                                // renderTable(l2, index1, "l3",index)
                                <Tables l2={l2} index1={index1} f1={"l3"} index={index} />
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
            
            {/* <Button  text="Save as Draft" type="submit" />
            <Button text="Submit" type="submit" /> */}

        </div>
    );
};

export default RFPReqTable;