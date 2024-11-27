import React, { useState, useEffect, useContext } from 'react';
import './RFPReqTable.css'; // Import the CSS file
import { AppContext } from '../../context/AppContext';

const TableRow = (item, levelType, paddingLeft = 10, TableIndex=null,parentIndex = null, subIndex = null) => {
    // console.log('Rendering level:', levelType, 'with data:', levelData);
   const levelData =item;
   console.log(levelData);
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
    
    useEffect(() => {
        // Define an async function to log array and set item data
        async function fetchArray() {
            const result = await moduleData; // Wait for moduleData to resolve if it's a Promise
            // console.log("result", result.functionalItemDetails); // Log the resolved array
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
    const handleCommentsChange = (e,item) => {
    // if (levelType !== 'l3') {
        const indexofArray = findIndexByObject(item);
        const newData = [...FItem];
        newData[indexofArray].Comments = e.target.value; // Update the comments value
        setFItem(newData); // Update the state
    // }
    };
    // if (!levelData || !Array.isArray(levelData)) return console.log("its empty"); // Ensure levelData is defined and an array

    return levelData.map((item, index) => (
            <tr key={`${item.F2_Code}-${index}`} id={`${item.F2_Code}-${index}`}>

                {/* Checkbox for l2 and l3 levels */}

                {/* Edit button for l2 and l3 levels */}
                <td>
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
};

export default TableRow;
