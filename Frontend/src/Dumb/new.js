import React, { useState,useEffect,useContext } from 'react';
import './RFPReqTable.css'; // Import the CSS file
import {AppContext} from '../../context/AppContext';

import Button from '../Buttons/Button.js';
// import sendCheckedItems from '../../services/Apis'

const RFPReqTable = () => {

  const [itemData, setItemData] = useState(null); // Initially, no data
  const [reqItemData, setReqItemData] = useState(); // Initially, no data

  const { moduleData } = useContext(AppContext); // Access shared state
  console.log(moduleData);
  // async function logArray() {
  //   const result = await moduleData;
  //   console.log("result",result); // This will log the resolved array to the console
  //   setItemData(result); 
  // }

  useEffect(() => {
    // Define an async function to log array and set item data
    async function fetchArray() {
        const result = await moduleData; // Wait for moduleData to resolve if it's a Promise
        console.log("result", result.l1); // Log the resolved array
        setItemData(result.l1); // Set the resolved data to local state
    }

    // Call logArray when moduleData changes
    if (moduleData) {
        fetchArray();
    }
}, [moduleData]);
    // moduleData.then((result) => {
    //   console.log(result); // This will log the resolved array to the console
    //   setItemData(result); 
    // });

    const handleEdit = (index) => {
      // Toggle an 'isEditing' property for the specific item to make it editable
      const updatedData = itemData.map((item, i) => 
          i === index ? { ...item, isEditing: !item.isEditing } : item
      );
      setItemData(updatedData);
  };

  const handleAdd = () => {
      // Add a new empty row to the table
      setItemData([
          ...itemData,
          { name: "", isEditing: true } // Start new row in editable mode
      ]);
  };

  const handleDelete = () => {
      // Filter out rows where the checkbox is not checked
      const updatedData = itemData.filter((item, index) => !item.checked);
      setItemData(updatedData);
  };

  const handleInputChange = (index, event) => {
      // Update the value of the `Requirement` field
      const updatedData = itemData.map((item, i) => 
          i === index ? { ...item, name: event.target.value } : item
      );
      setItemData(updatedData);
  };
// const handleInputChange = (index, event) => {
//     const newData = [...itemData];
//     newData[index].name = event.target.value;
//     setItemData(newData);
// };


  const handleCheckboxChange = (index) => {
      // Toggle checked property for each item
      const updatedData = itemData.map((item, i) => 
          i === index ? { ...item, checked: !item.checked } : item
      );
      setItemData(updatedData);
  };

  const handleSubmit = async () => {
    try {
        const response = await fetch('/api/rfpRequirement/saveItems', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: itemData }),
        });

        if (response.ok) {
            console.log("Data saved successfully");
        } else {
            console.error("Error saving data");
        }
    } catch (error) {
        console.error("Error:", error);
    }
    };
    const handleFinalChange = (index, field, event) => {
        const newData = [...reqItemData];
        newData[index][field] = event.target.value;
        setReqItemData(newData);
    };
    
    const handleFinalSubmit = () => {
        // Filter or transform data if needed
        const finalData = reqItemData.map(item => ({
            requirement: item.requirement,
            MorO: item.MorO,
            comments: item.comments
        }));
    
        // Send `finalData` to the backend
        console.log("Final data to send:", finalData);
        // Add code here to send `finalData` to your backend
    };
    
    const L3Component = ({ l3 }) => (
        <ul>
          {l3.map((item) => (
            <li key={item.code}>
              {item.name} (Code: {item.code})
            </li>
          ))}
        </ul>
      );
      
      // L2 Component
      const L2Component = ({ l2 }) => (
        <ul>
          {l2.map((item) => (
            <li key={item.code}>
              {item.name} (Code: {item.code})
              {item.l3 && item.l3.length > 0 && <L3Component l3={item.l3} />}
            </li>
          ))}
        </ul>
      );
      
      // L1 Component
      const L1Component = ({ l1 }) => (
        <ul>
          {l1.map((item) => (
            <li key={item.code}>
              {item.name} (Code: {item.code})
              {item.l2 && item.l2.length > 0 && <L2Component l2={item.l2} />}
            </li>
          ))}
        </ul>
      );

      const handleAddRow = (levelType, parentIndex, subIndex = null) => {
        const newData = [...itemData];
        
        if (levelType === 'l1') {
            newData.push({ name: "New l1 Item", code: Date.now(), l2: [] });
        } else if (levelType === 'l2') {
            newData[parentIndex].l2.push({ name: "New l2 Item", code: Date.now(), l3: [] });
        } else if (levelType === 'l3') {
            newData[parentIndex].l2[subIndex].l3.push({ name: "New l3 Item", code: Date.now() });
        }
        
        setItemData(newData);
    };

    // Toggle edit mode for a specific item
    const handleEditToggle = (levelType, parentIndex, subIndex = null, itemIndex = null) => {
        const newData = [...itemData];
        if (levelType === 'l1') {
            newData[parentIndex].isEditing = !newData[parentIndex].isEditing;
        } else if (levelType === 'l2') {
            newData[parentIndex].l2[subIndex].isEditing = !newData[parentIndex].l2[subIndex].isEditing;
        } else if (levelType === 'l3') {
            newData[parentIndex].l2[subIndex].l3[itemIndex].isEditing = !newData[parentIndex].l2[subIndex].l3[itemIndex].isEditing;
        }
        setItemData(newData);
    };

    // Update the name of a specific item
    const handleNameChange = (e, levelType, parentIndex, subIndex = null, itemIndex = null) => {
        const newData = [...itemData];
        const newValue = e.target.value;

        if (levelType === 'l1') {
            newData[parentIndex].name = newValue;
        } else if (levelType === 'l2') {
            newData[parentIndex].l2[subIndex].name = newValue;
        } else if (levelType === 'l3') {
            newData[parentIndex].l2[subIndex].l3[itemIndex].name = newValue;
        }
        
        setItemData(newData);
    };

    // Delete a row at a specific level
    const handleDeleteRow = (levelType, parentIndex, subIndex = null, itemIndex = null) => {
        const newData = [...itemData];
        
        if (levelType === 'l1') {
            newData.splice(parentIndex, 1);
        } else if (levelType === 'l2') {
            newData[parentIndex].l2.splice(subIndex, 1);
        } else if (levelType === 'l3') {
            newData[parentIndex].l2[subIndex].l3.splice(itemIndex, 1);
        }

        setItemData(newData);
    };
    const renderHierarchy = (levelData, levelType, paddingLeft = 0, parentIndex = null, subIndex = null) => {
        if (!levelData || !Array.isArray(levelData)) return null; // Ensure levelData is defined and an array
    
        return levelData.map((item, index) => (
            <tr key={`${item.code}-${index}`}>
                {/* Checkbox for l2 and l3 levels */}
                <td style={{ paddingLeft: `${paddingLeft}px` }}>
                    {levelType !== 'l1' && (
                        <input
                            type="checkbox"
                            checked={item.checked || false}
                            onChange={() => handleCheckboxChange(levelType, parentIndex, subIndex, index)}
                        />
                    )}
                </td>
    
                {/* Edit button for l2 and l3 levels */}
                <td>
                    {levelType !== 'l1' && (
                        <button onClick={() => handleEditToggle(levelType, parentIndex, subIndex, index)}>
                            {item.isEditing ? "Save" : "Edit"}
                        </button>
                    )}
                </td>
    
                {/* Display name, bold for l1 level */}
                <td>
                    {item.isEditing ? (
                        <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleNameChange(e, levelType, parentIndex, subIndex, index)}
                        />
                    ) : (
                        levelType === 'l1' ? <strong>{item.name}</strong> : item.name
                    )}
                </td>
    
                {/* M and O radio buttons for l2 and l3 levels */}
                <td>
                    {levelType !== 'l1' && (
                        <input
                            type="radio"
                            name={`${item.code}-MorO`}
                            checked={item.MorO === 'M'}
                            // onChange={() => handleMorOChange(levelType, parentIndex, subIndex, index, 'M')}
                        />
                    )}
                </td>
                <td>
                    {levelType !== 'l1' && (
                        <input
                            type="radio"
                            name={`${item.code}-MorO`}
                            checked={item.MorO === 'O'}
                            // onChange={() => handleMorOChange(levelType, parentIndex, subIndex, index, 'O')}
                        />
                    )}
                </td>
    
                {/* Comments input for l2 and l3 levels */}
                <td>
                    {levelType !== 'l1' && (
                        <input
                            type="text"
                            value={item.comments || ''}
                            // onChange={(e) => handleCommentsChange(e, levelType, parentIndex, subIndex, index)}
                        />
                    )}
                </td>
            </tr>
        ));
    };
    


    //   const renderHierarchy = (l1) => (
    //     <div>
    //         {l1 && l1.map((level1, index1) => (
    //             <div key={index1}>
    //                 <strong>{level1.name}</strong>
    //                 <div style={{ paddingLeft: "20px" }}>
    //                     {level1.l2 && level1.l2.map((level2, index2) => (
    //                         <div key={index2}>
    //                             <em>{level2.name}</em>
    //                             <div style={{ paddingLeft: "20px" }}>
    //                                 {level2.l3 && level2.l3.map((level3, index3) => (
    //                                     <div key={index3}>{level3.name}</div>
    //                                 ))}
    //                             </div>
    //                         </div>
    //                     ))}
    //                 </div>
    //             </div>
    //         ))}
    //     </div>
    // );
    

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
              <span>1.1. Module L2</span>
          </div>
        {/* <div>
        {itemData && itemData.length > 0 && (
        itemData.map((item, index) => (
        <div>{item}</div>
        ))) 
        }
        </div> */}
          
          <table className="item-table">
              <thead>
                  <tr>
                      <th>+/-</th>
                      <th>Edit</th>
                      <th>Requirement</th>
                      <th>M</th>
                      <th>O</th>
                      <th>Comments</th>
                  </tr>
              </thead>
              {itemData && itemData.length > 0 && (
                  <tbody>
                      {/* {itemData.map((item, index) => (
                        
                        // item.map((l2,index) => (
                          <tr key={index}>
                              <td>
                                  <input 
                                      type="checkbox" 
                                      checked={item.checked || false} 
                                      onChange={() => handleCheckboxChange(index)} 
                                  />
                              </td>
                              <td>
                                  <button onClick={() => handleEdit(index)}>
                                      {item.isEditing ? "Save" : "Edit"}
                                  </button>
                              </td>
                              <td>
                                {item.isEditing ? (
                                    <input
                                        type="text"
                                        value={item.l1[0].l2[0].name}
                                        onChange={(event) => handleInputChange(index, event)}
                                    />
                                ) : (
                                    renderHierarchy(item.l1)
                                )}
                            </td>
                              <td><input type="radio" name={`item-${index}`} 
                              onChange={() => handleFinalChange(index, 'MorO', { target: { value: 'M' } })}
                              /></td>
                              <td><input type="radio" name={`item-${index}`} 
                              onChange={() => handleFinalChange(index, 'MorO', { target: { value: 'O' } })}
                              /></td>
                              <td><input 
                              type="text" className='textArea' 
                              onChange={(event) => handleFinalChange(index, 'comments', event)}
                           /></td>
                          </tr>
                      ))
                    //   ))
                      } */}
                        {itemData.map((item, index) =>
                        item.l2.map((level1) => (
                            <React.Fragment key={level1.code}>
                                {renderHierarchy([level1], 'l1')}
                                {level1.l3 && level1.l3.map((level2) => (
                                    <React.Fragment key={level2.code}>
                                        {renderHierarchy([level2], 'l2', 20)}
                                        {level2.l3 && renderHierarchy(level2.l3, 'l3', 40)}
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))
                    )}
                  </tbody>
              )}
               <tr>
                          <td>
                              <button className="addBtn" onClick={handleAdd}>Add</button>
                          </td>
                          <td colSpan={5}>
                              <button className="deleteBtn" onClick={handleDelete}>Delete Selected</button>
                          </td>
                      </tr>
          </table>
          {/* <h1>Hierarchy Structure</h1>
          <L1Component l1={itemData} /> */}

          <Button onClick={handleSubmit} text="Save as Draft" type="submit" />
          <Button text="Submit" type="submit" />
          {/* <button onClick={handleSubmit}>Save as Draft</button>
          {/* <button onClick={handleFinalSubmit}>Save as Draft</button> */}
          {/* <button>Submit</button>  */}

      </div>
  );
};

export default RFPReqTable;

// Add this within your component (RFPReqTable)
    
    // const handleEditToggle = (levelType,ic,index,e) => {
    //     console.log("levelType: "+levelType," Item code: "+ic+" index: "+index);
    //     console.log(e);
    //     // item[0].l2[0].l3[0].name
    // setFItem((prevItems) => {
    //     const updatedItems = JSON.parse(JSON.stringify(ic));
    //     console.log(updatedItems);
    //     updatedItems.isEditing = !updatedItems.isEditing;
    //     return prevItems;
    // });
    // };
    // const handleEditToggle = (levelType, item, index, event) => {
        // setFItem((prevItems) => {
            // Make a deep copy of prevItems to avoid mutating state directly
            // const updatedItems = JSON.parse(JSON.stringify(prevItems));
            // updatedItems= prevItems.filter(i=>[...prevItems]+ if(i.code===item.code){
    //         //     i.isEditing =true;
    //         // })
            
    //         // Traverse to the correct item based on levelType and indices
    //         // updatedItems.isEditing =true;
    //         // if (levelType === 'l2') {
    //         //     currentLevel = currentLevel[index];
    //         // } else if (levelType === 'l3') {
    //         //     currentLevel = currentLevel[parentIndex].l2[subIndex].l3[index];
    //         // }
    
    //         // // Toggle isEditing for the targeted item
    //         // currentLevel.isEditing = !currentLevel.isEditing;
    
    //         // return updatedItems; // Return updated structure
    //     // });
    //     setFItem((prevItems) =>
    //         prevItems.map((i) => {
    //             // Check if the item code matches, then toggle isEditing
    //             if (i.code === item.code) {
    //                 return { ...i, isEditing: !i.isEditing }; // Toggle isEditing for matched item
    //             }
    //             return i; // Return unchanged item for non-matching cases
    //         })
    //     );
    // };
    // const handleEditToggle = (levelType, item,index,e) => {
    //     console.log(FItem);
    //     console.log(item);


    //     setFItem((prevItems) =>
           
    //         prevItems.map((i) =>{
    //             // console.log(i);

    //             if(i.F1_Code === item.F1_Code &&i.Module_Code === item.Module_Code){
    //                 return i.isEditing=true;
    //                 // console.log("===== ==================================");
    //                 // console.log(i);
    //             }
    //         }      
    //         // return i;
    //         )
    //     );
    // };

    // const handleEditToggle = (index) => {
    //     setFItem((prevItems) => {
    //         const updatedItems = prevItems.map((item, i) => {
    //             if (i === index) {
    //                 console.log("Toggling isEditing for item at index:", index); // Debug log
                    
    //                 return { ...item, isEditing: !item.isEditing }; // Toggle isEditing
    //             }
    //             return item;
    //         });
    // // updatedItems.isEditing = !updatedItems.isEditing;
    //         console.log("Updated items:", updatedItems); // Log to see if only the targeted item was updated
    //         return updatedItems;
    //     });
    // };