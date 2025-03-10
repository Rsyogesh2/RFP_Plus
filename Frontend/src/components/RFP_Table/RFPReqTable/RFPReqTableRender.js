 // Function to render the Rows of the Table
export const renderHierarchy = (levelData, levelType, paddingLeft = 10, TableIndex = null, parentIndex = null, subIndex = null, indexval) => {
    // console.log('Rendering level:', levelType, 'with data', levelData,TableIndex,parentIndex," subIndex "+subIndex,"  indexval "+indexval);

    if (!levelData || !Array.isArray(levelData)) return console.log("its empty"); // Ensure levelData is defined and an array
    // console.log("levelData");
    // console.log(levelData);

    return levelData.map((item, index) => {
        const date = new Date(item.Modified_Time);
        const formattedDate = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        // date.setMinutes(date.getMinutes() + 330); // Adding 5 hours and 30 minutes
        // const formattedDate = date.toLocaleString('en-IN');
        // console.log(formattedDate);
        return (
            <tr key={`${item.Module_Code}-${item.F2_Code}-${index}`} id={`${item.Module_Code}-${item.F2_Code}-${index}`}>

                {/* Checkbox for l2 and l3 levels */}

                {/* Edit button for l2 and l3 levels */}
                <td>
                    <div key={item.code} style={{ display: 'flex', gap: '0px' }}>
                        <button className='Modifybtn'
                            onClick={(e) => handleEditToggle(item, e)}>
                            {item.isEditing ? "S" : "E"}
                        </button>
                        <button className='Modifybtn' onClick={() => handleDelete(item)}>
                            D
                        </button>
                        <button className='Modifybtn' onClick={() => handleAdd(item)}>
                            A
                        </button>
                    </div>
                </td>

                {/* Display name, bold for l1 level */}
                <td
                    style={{
                        paddingLeft: `${paddingLeft}px`,
                        whiteSpace: 'normal',  // Enables text wrapping
                        wordWrap: 'break-word',  // Breaks long words
                        maxWidth: '300px' // Adjust as needed for better control
                    }}
                >
                    {!item.deleted && item.isEditing ? (
                        <input
                            type="text"
                            value={item.name}
                            placeholder="New Item"
                            onChange={handleNameChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleEditToggle(item, e);
                                }
                            }}
                        />
                    ) : (
                        <span
                            style={{
                                textDecoration: item.deleted ? 'line-through' : 'none',
                                fontWeight: 'normal'
                            }}
                        >
                            {item.name}
                        </span>
                    )}
                </td>


                {/* M and O radio buttons for l2 and l3 levels */}
                <td style={{ textAlign: 'center' }}>
                    {
                        <input
                            type="radio"
                            name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-Mandatory`}
                            checked={item.Mandatory === 1 || item.Mandatory === true}
                            onChange={() => handleMandatoryChange(true, item, TableIndex, parentIndex, subIndex, index)}
                        />
                    }
                </td>
                <td style={{ textAlign: 'center' }}>
                    {
                        <input
                            type="radio"
                            name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-Mandatory`}
                            checked={item.Mandatory === 0 || item.Mandatory === false}
                            onChange={() => handleMandatoryChange(false, item, TableIndex, parentIndex, subIndex, index)}
                        />
                    }
                </td>

                {/* Comments input for l2 and l3 levels */}
                <td style={{ padding: "4px", height: '100%' }}>
                    <textarea
                        type="text"
                        value={item.Comments || ''}
                        onChange={(e) => handleCommentsChange(e, item)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            resize: 'none',
                            width: '100%',
                            height: '100%',
                            boxSizing: 'border-box',
                            display: 'block'
                        }}
                    />
                </td>


                <td>
                    {item.Modified_Time && (
                        <p style={{
                            fontSize: '11px', wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            textOverflow: 'clip'
                        }}
                        >
                            {formattedDate} </p>)}
                </td>
                <td>
                    {item.Modified_Time &&
                        <p style={{ fontSize: '11px' }}>{item.Edited_By}</p>
                    }
                </td>
            </tr>
        )
    });
};
export const readHierarchy = (levelData, levelType, paddingLeft = 10, TableIndex = null, parentIndex = null, subIndex = null, indexval) => {
    // console.log('Rendering level:', levelType, 'with data', levelData, TableIndex, parentIndex, " subIndex " + subIndex, "  indexval " + indexval);

    if (!levelData || !Array.isArray(levelData) || (levelData[0].deleted && levelData[0].Level === 4)) return console.log("its empty"); // Ensure levelData is defined and an array

    return levelData.map((item, index) => {
        const date = new Date(item.Modified_Time);
        const formattedDate = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        // console.log(formattedDate);


        return (
            <tr key={`${item.Module_Code}-${item.F2_Code}-${index}`} id={`${item.Module_Code}-${item.F2_Code}-${index}`}>

                <td style={{
                    fontWeight: 'normal',
                    whiteSpace: 'normal',  // Enables text wrapping
                    wordWrap: 'break-word',  // Breaks long words
                    paddingLeft: `${paddingLeft}px`
                }}>
                    <span style={{
                        // fontWeight: levelType === 'f1' ? 300 : 'normal',
                        textDecoration: item.deleted ? 'line-through' : 'none'
                    }}>
                        {item.name}
                    </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                    {
                        <input
                            type="radio"
                            name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-Mandatory`}
                            checked={item.Mandatory === 1 || item.Mandatory}
                        />
                    }
                </td>
                <td style={{ textAlign: 'center' }}>
                    {
                        <input
                            type="radio"
                            name={`${item.Module_Code}-${subIndex}-${item.F2_Code}-${TableIndex}-${indexval}-${item.New_Code}-Mandatory`}
                            checked={item.Mandatory === 0 || !item.Mandatory}
                        />
                    }
                </td>

                <td>
                    <p style={{
                        fontSize: '12px',
                        fontWeight: 'normal',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        overflow: 'hidden',
                        textOverflow: 'clip'
                    }}>{item.Comments || ''}</p>
                </td>
                <td>
                    {item.Modified_Time && (
                        <p style={{
                            fontSize: '10px', wordWrap: 'break-word',
                            whiteSpace: 'normal',
                            overflow: 'hidden',
                            textOverflow: 'clip',
                            margin: '-2px 2px',
                            fontWeight: 'semi-bold'
                        }}
                        >
                            {formattedDate} </p>)}
                </td>
                <td>
                    {item.Modified_Time &&
                        <p style={{ fontSize: '11px' }}>{item.Edited_By}</p>
                    }
                </td>
            </tr>
        )
    });
};
//==================================================================================================//

// Function to render the Tables
export const Tables = (l2, index1, f1, index, indexval) => {
    let newItems;
    if (userRole === "Maker") {
        newItems = {
            F2_Code: '1000',
            F1_Code: `10`,
            name: "Add here...",
            Module_Code: l2.code
        };
    } else {
        newItems = {
            F2_Code: '1000',
            F1_Code: `10`,
            name: "No Items",
            Module_Code: l2.code
        };
    }

    // console.log(FItem);
    // console.log(newItems);
    // console.log(newItems[index]);

    const matchingCodes = FItem?.filter(f => f?.Module_Code?.startsWith(l2.code)) || [];
    const f1items = matchingCodes
        .filter(f1 => f1?.F2_Code?.endsWith("00") && !f1.F1_Code.endsWith("00"))
        .sort((a, b) => {
            // First, compare by F1_Code (converted to number)
            const f1Comparison = Number(a.F1_Code) - Number(b.F1_Code);

            // If F1_Code is the same, then compare by New_Code
            if (f1Comparison !== 0) {
                return f1Comparison;
            }

            // Compare New_Code if F1_Code is the same
            return Number(a.New_Code) - Number(b.New_Code);
        });
    // console.log(f1items)
    return (
        <table className="item-table">
            <colgroup>
                {userRole === "Maker" && (!FItem?.[0]?.Level || Number(FItem[0].Level) === 1) && <col style={{ width: "8%" }} />}
                <col style={{ width: "60%" }} />
                <col style={{ width: "0%" }} />
                <col style={{ width: "0.1%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
                <tr>
                    {userRole === "Maker" && (!FItem?.[0]?.Level || Number(FItem[0].Level) === 1) && <th className="col-modify">Modify</th>}
                    <th className="col-requirement">Requirement</th>
                    <th className="col-m">M</th>
                    <th className="col-o">O</th>
                    <th className="col-comments">Internal Comments</th>
                    <th className="col-modified-time">Modified Time</th>
                    <th className="col-edited-by">Edited By</th>
                </tr>
            </thead>
            <tbody>
                {f1items && f1items.length > 0 ? (
                    f1items.map((item, index) => {
                        const f2items = matchingCodes
                            .filter(f1 =>
                                f1?.F2_Code &&
                                !f1.F2_Code.endsWith("00") &&
                                f1.F2_Code.startsWith(item.F1_Code)
                            )
                            .sort((a, b) => {
                                // Sort by F2_Code first (as a number)
                                const f2Comparison = Number(a.F2_Code) - Number(b.F2_Code);

                                // If F2_Code is the same, sort by New_Code
                                if (f2Comparison !== 0) {
                                    return f2Comparison;
                                }

                                // Sort by New_Code if F2_Code matches
                                return Number(a.New_Code) - Number(b.New_Code);
                            });


                        return (
                            <React.Fragment key={item.code || index}>
                                {userRole === 'Maker' && (!FItem?.[0]?.Level || Number(FItem[0].Level) === 1)
                                    ? renderHierarchy([item], 'f1', 10, index1, index, indexval)
                                    : readHierarchy([item], 'f1', 10, index1, index, indexval)}

                                {f2items.map((level2, subIndex) => (
                                    <React.Fragment key={level2.code || subIndex}>
                                        {userRole === 'Maker' && (!FItem?.[0]?.Level || Number(FItem[0].Level) === 1)
                                            ? renderHierarchy([level2], 'f2', 50, index1, index, subIndex, indexval)
                                            : readHierarchy([level2], 'f2', 50, index1, index, subIndex, indexval)}
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        );
                    })
                ) : (
                    <React.Fragment>
                        {newItems ? (
                            userRole === 'Maker' && (!FItem?.[0]?.Level || Number(FItem[0].Level) === 1)
                                ? renderHierarchy([newItems], 'f1', 10, index1)
                                : readHierarchy([newItems], 'f1', 10, index1)
                        ) : (
                            <tr>
                                <td colSpan="7">No data available</td>
                            </tr>
                        )}
                    </React.Fragment>
                )}
            </tbody>
        </table>
    );
};