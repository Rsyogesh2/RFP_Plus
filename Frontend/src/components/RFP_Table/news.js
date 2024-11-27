import React, { useState, useEffect, useContext } from 'react';
import './RFPReqTable.css'; // Import the CSS file
import { AppContext } from '../../context/AppContext';

import Button from '../Buttons/Button.js';
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
    // const [newFItem, setnewFItem] = useState( [{name: "",
    //     Module_Code: "",
    //     F1_Code: "10",
    //     F2_Code: "1000",
    //     F1:"true",
    //     F2:"false",
    //     isEditing: false,
    //     MorO: "",
    //     Comments: ""}]); // Initially, no data

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

  
    const findIndexByObject = (obj) => {
        return FItem.findIndex(
          (item) => item.F2_Code === obj.F2_Code && item.name === obj.name
        );
    };
    const handleEditToggle = (item,e) => {
        console.log(item);
        const index = findIndexByObject(item);
        const newData = [...FItem];
        newData[index].isEditing = !newData[index].isEditing;
        setFItem(newData);
        console.log(newData[index]);
    };
 
    const handleDelete = (item) => {
        // console.log(item.F2_Code);
        setFItem((prevItems) => {
            // Deep clone prevItems to avoid direct state mutation
            const updatedItems = prevItems.filter((f, i) => f.F2_Code !== item.F2_Code);
            console.log(updatedItems)
            // Return the modified items array to update the state
            return updatedItems;
        });
    };
    
    
    const handleAdd = (item) => {
        setFItem((prevItems) => {
        // const updatedItems = JSON.parse(JSON.stringify(prevItems));
        // const newItem = { name: 'New Item', F2_Code: item.F2_Code, isEditing: true };
        // updatedItems[item] = [];
        // // updatedItems[0].l2[l1].l3.push(newItem);
        //     updatedItems[item].splice(item + 1, 0, newItem);

        const itemsWithSameF2Code = prevItems.filter(
            (prevItem) => prevItem.F2_Code === item.F2_Code && prevItem.Module_Code === item.Module_Code
        );
        
        // Determine the increment value
        const increment = itemsWithSameF2Code.length + 1;
        console.log(itemsWithSameF2Code,increment);

        // Create a new item with auto-incremented F2_Code
        let newItem 
        if(itemsWithSameF2Code[0].F2_Code.endsWith("00")){
            newItem = { 
            name: 'New Item', 
            Module_Code:`${item.Module_Code}`,
            F1_Code:`${item.F1_Code}`,
            F2_Code: `${item.F2_Code}${"00"}`, 
            isEditing: true 
        };
        } else{
            newItem = { 
                name: 'New Item', 
                Module_Code:`${item.Module_Code}`,
                F1_Code:`${item.F1_Code}`,
                F2_Code: `${item.F2_Code}${"11"}`, 
                isEditing: true 
            };
        }
        console.log(newItem)
        // Return the updated items list with the new item added
        return [...prevItems, newItem];

        }
        )
        // return updatedItems;
    };
       
    const handleNameChange = (e) => {
        // Assuming `setItems` is a state setter function for an array of items
        setFItem((prevItems) =>
            prevItems.map((item) =>
                item.isEditing ? { ...item, name: e.target.value } : item
            )
        );
    };

    const handleMorOChange = (value,item,TableIndex,parentIndex,subIndex,index) => {
       console.log("fcode "+item.F2_Code+"TableIndex: "+TableIndex+" parentIndex: "+parentIndex+" subIndex "+subIndex+" index "+index)
       const indexofArray = findIndexByObject(item);
    //    consol
       console.log(indexofArray);
       const newData = [...FItem];
       console.log(FItem);
    //    console.log(newData.item.F2_Code);
          newData[indexofArray].MorO = value; // Update the MorO value
          
          setFItem(newData); // Update the state
        
      };
    
      // Handle the change for comments input
    const handleCommentsChange = useCallback ((e,item) => {
    // if (levelType !== 'l3') {
        const indexofArray = findIndexByObject(item);
        const newData = [...FItem];
        newData[indexofArray].Comments = e.target.value; // Update the comments value
        setFItem(newData); // Update the state
    // }
    },[FItem]);
    
    
    const renderRow = React.memo((levelData, levelType, paddingLeft = 10, TableIndex=null,parentIndex = null, subIndex = null) => {
        // console.log('Rendering level:', levelType, 'with data:', levelData);
    
        if (!levelData || !Array.isArray(levelData)) return console.log("its empty"); // Ensure levelData is defined and an array

        return levelData.map((item, index) => (
            <tr key={`${item.F2_Code}-${index}`} id={`${item.F2_Code}-${index}`}>

                {/* Checkbox for l2 and l3 levels */}

                {/* Edit button for l2 and l3 levels */}
                <td>
                {levelType !== 'l3' && (
                   <div key={item.code} style={{ display: 'flex', gap: '0px' }}>
                        <button className='Modifybtn'
                        onClick={(e) => handleEditToggle(item,e)}>
                            {item.isEditing ? "S" : "E"}
                        </button>
                        <button  className='Modifybtn' onClick={() => handleDelete(item)}>
                            D
                        </button>
                        <button className='Modifybtn'  onClick={() => handleAdd(item)}>
                            A
                        </button>
                    </div>
                )}
                </td>

                {/* Display name, bold for l1 level */}
                <td style={{ fontWeight: 'normal', paddingLeft: `${paddingLeft}px` }}>
                    {item.isEditing ? (
                        <input
                            type="text"
                            value={item.name}
                            onChange={handleNameChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleEditToggle(item,e);
                                }
                            }}
                        />
                    ) : (
                        levelType === 'f1' ? <span style={{ fontWeight: 500 }}>{item.name}</span>
                        : item.name
                    )}
                </td>

                {/* M and O radio buttons for l2 and l3 levels */}
                <td>
                    {
                        <input
                            type="radio"
                            name={`${item.F2_Code}-${TableIndex}-${index}-MorO`}
                            checked={item.MorO === true}
                        onChange={() => handleMorOChange(true,item,TableIndex,parentIndex,subIndex,index)}
                        />
                    }
                </td>
                <td>
                    {
                        <input
                            type="radio"
                            name={`${item.F2_Code}-${TableIndex}-${index}-MorO`}
                            checked={item.MorO === false}
                            onChange={() => handleMorOChange(false,item,TableIndex,parentIndex,subIndex,index)}
                        />
                    }
                </td>

                {/* Comments input for l2 and l3 levels */}
                <td>
                        <input
                            type="text"
                            value={item.Comments || ''}
                         onChange={(e) => handleCommentsChange(e,item)}
                        />
                    
                </td>
            </tr>
        ));
    });

    const renderTable =React.memo((items,Mindex,l,index)=>{
        // console.log(items);
        console.log("rendering Table");
        // console.log(items);
        // console.log(FItem);

        const unMatchingCodes = items.l3.map(l3 => l3.code);
        // console.log(unMatchingCodes);
        let newItem = { F2_Code: '', F1_Code: `${Mindex} - ${index}`, name: unMatchingCodes[index] ,Module_Code:items.code}
       
        const matchingCodes = FItem.filter(f => f.Module_Code.startsWith(items.code));
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
                                    {renderRow([item], 'f1', 10, Mindex, index)}
                                    
                                    {f2items && f2items.map((level2, subIndex) => (
                                        <React.Fragment key={level2.code}>
                                            {renderRow([level2], 'f2', 50, Mindex, index, subIndex)}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        // Render a single default row if f1items is empty
                        <React.Fragment>
                            {renderRow(
                                [newItem],
                                'f1',
                                10,
                                Mindex
                            )
                            }
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
                                        {renderTable(l2, index, "f1",index)}
                                    </div>
                                    ))}
                                </>
                                ) : (
                                renderTable(l2, index, "l3",index)
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

<span>{"L3: "+l3.name}</span>
</div>
))}
</>
) : (
<Table l2={l2} index1={index1} f1={f1}index ={index})/>