// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// async function testConnection() {
//     try {
//       // Execute a simple query
//       const [result] = await db.query('select * from First_table');
//       ////console.log('Database connected successfully:', result);
//     } catch (err) {
//       console.error('Database connection failed:', err.message);
//     } finally {
//       // End the pool (optional)
//       db.end();
//     }
//   }

//   testConnection();
router.get('/api/hello', async (req, res) => {
  try {
    const [rows] = await db.query('select * from First_table');
    ////console.log(rows);
    res.status(200).json(rows);
  } catch (error) {
    //console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});
// router.get('/modules', async (req, res) => {
//     try {
//         const [rows] = await db.query('SELECT ItemL1Description FROM mastermaintenance');
//         //////console.log(rows[0].name);
//         res.status(200).json(rows);
//     } catch (error) {
//         //console.error(error);
//         res.status(500).json({ error: 'Database query failed' });
//     }
// });
// router.get('/products', async (req, res) => {
//     try {
//         const [rows] = await db.query('SELECT ProductDescription FROM mastermaintenance');
//         //////console.log(rows[0].name);
//         res.status(200).json(rows);
//     } catch (error) {
//         //console.error(error);
//         res.status(500).json({ error: 'Database query failed' });
//     }
// });
// router.get('/response-options', async (req, res) => {
//     try {
//         const [rows] = await db.query('SELECT ItemL1Description FROM mastermaintenance');
//         //////console.log(rows[0].name);
//         res.status(200).json(rows);
//     } catch (error) {
//         //console.error(error);
//         res.status(500).json({ error: 'Database query failed' });
//     }
// });

router.get('/modules', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT distinct Module_Group as name FROM RFP_L1_modules');
    //////console.log(rows[0].name);
    res.status(200).json(rows);
  } catch (error) {
    //console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});
router.get('/assignModule', async (req, res) => {
  const userName = req.query.userName; // Extract 'userName' from query parameters

  try {
    // Query to fetch assigned modules for the user
    const assignedQuery = `SELECT modules AS name FROM Assingned_Rfp_SuperUser WHERE email = ?`;
    const [modulesResult] = await db.query(assignedQuery, [userName]);

    if (modulesResult.length === 0) {
      return res.status(404).json({ message: "No modules assigned to the user." });
    }

    // Extract the module names into an array
    const modulesArray = modulesResult.map((row) => row.name);

    // Query to fetch the module groups and their descriptions
    const formattedModules = modulesArray.map((val) => `'${val}'`).join(", ");
    const groupQuery = `
      SELECT DISTINCT Module_Group, L1_Module_Description
      FROM RFP_L1_modules
      WHERE L1_Module_Description IN (${formattedModules});
    `;
    const [groupedResult] = await db.query(groupQuery);

    // Transform the result into the desired structure
    const groupedData = groupedResult.reduce((acc, row) => {
      const group = acc.find((g) => g.Module_Group_name === row.Module_Group);

      if (group) {
        group.names.push(row.L1_Module_Description);
      } else {
        acc.push({
          Module_Group_name: row.Module_Group,
          names: [row.L1_Module_Description],
        });
      }
      return acc;
    }, []);

    // Final response formatting
    const response = groupedData.map((group) => ({
      name: group.Module_Group_name,
      expanded: false, // Default state
      subItems: group.names.map((name) => ({ name, selected: false })), // Sub-items
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Database query failed" });
  }
});




router.post("/rfpCreation", async (req, res) => {
  const { rfpDetails, modules, products, userName } = req.body;

  // Process modules and products
  console.log("RFP Details:", rfpDetails);
  console.log("Modules:", modules);
  console.log("Products:", products);
  console.log("User Name:", userName);
  const modulecreation = JSON.stringify(modules);
  const productscreation = JSON.stringify(products);
  ////console.log(modulecreation)
  try {

    const query = `
        INSERT INTO RFP_Creation (rfp_no,rfp_title,userName, email,modules,products) 
        VALUES (?, ?,?, ?,?,?)`;
    const values = [rfpDetails.rfpNo, rfpDetails.rfpTitle, userName, userName, modulecreation, productscreation];
    console.log(values)
    await db.query(query, values);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error adding user:', err.message);
    res.status(500).json({ success: false, error: 'Failed to add user' });
  }
});
router.get('/assignRFPNoonly', async (req, res) => {
  const userName = req.query.userName; // Extract 'userName' from query parameters
  ////console.log("Received userName:", userName);

  try {
    const assignedQuery = `SELECT rfp_no FROM RFP_Creation WHERE email='${userName}'`;
    const [modulesResult] = await db.query(assignedQuery);

    ////console.log("Modules Result:", modulesResult); // Debugging the structure of modulesResult

    if (modulesResult.length === 0) {
      return res.status(404).json({ message: "No modules assigned to the user." });
    }

    // Building the IN clause safely
    res.status(200).json(modulesResult);

  } catch (error) {
    //console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});
router.get('/assignUsersRFPNo', async (req, res) => {
  const userName = req.query.userName; // Extract 'userName' from query parameters
  //console.log("Received userName:", userName);

  try {
    let assignedQuery
    const [userPower] = await db.query(`SELECT Role FROM Users_Login WHERE Username='${userName}'`);
    //console.log("Received userPower:", userPower);
    if (userPower[0].Role == "Super Admin") {
      assignedQuery = `SELECT rfp_no,modules,rfp_title FROM RFP_Creation WHERE email='${userName}'`;

    } else if (userPower[0].Role == "Vendor Admin") {
      assignedQuery = `SELECT rfp_reference_no as rfp_no,entity_name FROM vendor_admin_users WHERE email='${userName}'`;
    }
    const [modulesResult] = await db.query(assignedQuery);
    //console.log("Received modulesResult:", modulesResult);
    ////console.log("Modules Result:", modulesResult); // Debugging the structure of modulesResult

    if (modulesResult.length === 0) {
      return res.status(404).json({ message: "No modules assigned to the user." });
    }

    // Building the IN clause safely
    res.status(200).json(modulesResult);

  } catch (error) {
    //console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

router.get('/assignRFPUserDetails', async (req, res) => {
  const { rfpNo, userName } = req.query;
  console.log(rfpNo);
  if (!rfpNo) {
    return res.status(400).json({ error: "RFP number is required." });
  }

  try {
    // Step 1: Fetch Modules
    const assignedQuery = `SELECT modules,rfp_title FROM RFP_Creation WHERE rfp_no = ?`;
    const [modulesResult] = await db.query(assignedQuery, [rfpNo]);

    if (!modulesResult.length) {
      return res.status(404).json({ error: "No modules found for the given RFP number." });
    }

    const modulesArray = modulesResult[0].modules;
    //console.log("modulesArray");
    //console.log(modulesArray);
    const [result] = await db.query(
      `SELECT L1_Code, L1_Module_Description 
       FROM rfp_l1_modules 
       WHERE L1_Module_Description IN (?) 
       OR L1_Code IN (?)`,
      [modulesArray, [95, 96, 97]]
    );


    //console.log(result);
    const l1Codes = result.map(row => row.L1_Code);
    const data = { l1: [] };

    if (l1Codes.length) {
      const placeholders = l1Codes.map(() => `L2_Code LIKE CONCAT(?, '%')`).join(" OR ");
      const queryString = `SELECT L2_Description AS name, L2_Code FROM RFP_L2_Modules WHERE ${placeholders}`;
      const [l2Result] = await db.query(queryString, l1Codes);

      for (const l1 of result) {
        const l2Codes = l2Result
          .filter(row => row.L2_Code.startsWith(l1.L1_Code))
          .map(row => ({ name: row.name, code: row.L2_Code, l3: [] }));

        if (l2Codes.length) {
          const l2CodesArray = l2Codes.map(l2 => l2.code);
          const placeholders1 = l2CodesArray.map(() => `L3_Code LIKE CONCAT(?, '%')`).join(" OR ");
          const queryString1 = `SELECT L3_Description AS name, L3_Code FROM RFP_L3_Modules WHERE ${placeholders1}`;
          const [l3Result] = await db.query(queryString1, l2CodesArray);

          for (const l2 of l2Codes) {
            l2.l3 = l3Result
              .filter(row => row.L3_Code.startsWith(l2.code))
              .map(row => ({ name: row.name, code: row.L3_Code }));
          }
        }

        data.l1.push({ name: l1.L1_Module_Description, code: l1.L1_Code, l2: l2Codes });
      }
    }

    const [userPower] = await db.query(`SELECT Role FROM Users_Login WHERE Username='${userName}'`);
    //console.log("Received userPower:", userPower);

    let assignedUsers;
    // Step 2: Fetch Assigned Users
    if (userPower[0].Role == "Super User") {
      [assignedUsers] = await db.query(
        `SELECT user_name, is_active as active, date_from as fromDate, date_to as toDate, is_maker as maker,
         is_authorizer as authorizer, is_reviewer as reviewer, module_name 
         FROM User_Modules_Assignment 
         WHERE rfp_no = ? `,
        [rfpNo]
      );
    } else if (userPower[0].Role == "Vendor Admin") {
      [assignedUsers] = await db.query(
        `SELECT user_name, is_active as active, date_from as fromDate, date_to as toDate, is_maker as maker,
         is_authorizer as authorizer, is_reviewer as reviewer, module_name 
         FROM VendorUser_Modules_Assignment 
         WHERE rfp_no = ? `,
        [rfpNo]
      );
    }
    console.log(assignedUsers);
    let parsedUsers;
    if (assignedUsers != undefined) {
      parsedUsers = assignedUsers.map(user => {
        // user.modulename.l1.l2.push("Scoring Criteria");
         return {
        ...user,
        selectedModules: (() => {
          try {
            return JSON.parse(user.module_name || []);
          } catch {
            return []; // Default to empty array if JSON parse fails
          }
        })(),
      }});
    }
  console.log("parsedUsers");
  console.log(data);

  data.l1.push({name:"Others",code:99,l2:[{name:"Scoring Criteria",code:9999}]});
  // { name: 'Vendor specifications', code: 97, l2: [Array] }
    // Consolidate Response
    res.status(200).json({
      modules: data,
      assignedUsers: parsedUsers || [],
      rfp_title: modulesResult[0].rfp_title
    });
  } catch (error) {
    console.error("Error fetching RFP details:", error);
    res.status(500).json({ error: "Failed to fetch RFP details." });
  }
});



router.get('/modules/:moduleName/subItems', async (req, res) => {
  const { moduleName } = req.params;

  try {
    //////console.log("Error fetching sub-items:");
    // Use parameterized query to prevent SQL injection
    const [rows] = await db.query(
      `SELECT L1_Module_Description as name,L1_Code FROM RFP_L1_modules WHERE Module_Group = ?`,
      [moduleName]
    );

    // Check if any sub-items were returned
    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.status(404).json({ error: "No sub-items found for this module" });
    }
  } catch (error) {
    //console.error("Error fetching sub-items:", error);
    res.status(500).json({ error: "An error occurred while fetching sub-items" });
  }
});

router.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT distinct Product_Group as name FROM RFP_Products');
    //////console.log(rows[0].name);
    res.status(200).json(rows);
  } catch (error) {
    //console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

router.get('/products/:moduleName/subItems', async (req, res) => {
  const { moduleName } = req.params;

  try {
    //////console.log("Error fetching sub-items:");
    // Use parameterized query to prevent SQL injection
    const [rows] = await db.query(
      `SELECT Financial_Products as name FROM RFP_Products WHERE Product_Group = ?`,
      [moduleName]
    );

    // Check if any sub-items were returned
    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.status(404).json({ error: "No sub-items found for this module" });
    }
  } catch (error) {
    //console.error("Error fetching sub-items:", error);
    res.status(500).json({ error: "An error occurred while fetching sub-items" });
  }
});

router.post('/products/itemDetails', async (req, res) => {
  try {
    const { checkedItems } = req.body; // Destructure checkedItems from request body
    var fItems = [];
    // Log checkedItems
    //console.log("checkedItems: " + checkedItems);

    // Fetch L1_Code based on checkedItems
    const [result] = await db.query(
      `SELECT L1_Code, L1_Module_Description FROM rfp_l1_modules WHERE L1_Module_Description IN (?)`,
      [checkedItems]
    );

    // Extract L1_Code values into an array
    const l1Codes = result.map(row => row.L1_Code);
    //////console.log("L1 Code : " + l1Codes);

    // Initialize an object to hold the nested structure
    const data = { l1: [] };

    // Fetch L2 based on the extracted L1_Code values
    const placeholders = l1Codes.map(() => `L2_Code LIKE CONCAT(?, '%')`).join(" OR ");
    const queryString = `SELECT L2_Description AS name, L2_Code FROM RFP_L2_Modules WHERE ${placeholders}`;
    const [l2Result] = await db.query(queryString, l1Codes);

    // Populate the l1 array in the data object
    for (const l1 of result) {
      const l2Codes = l2Result
        .filter(row => row.L2_Code.startsWith(l1.L1_Code)) // Filter L2 results that correspond to the current L1_Code
        .map(row => ({ name: row.name, code: row.L2_Code, l3: [] })); // Create an object for L2 with a nested l3 array

      // Fetch L3 based on the extracted L2_Code values
      if (l2Codes.length > 0) {
        const l2CodesArray = l2Codes.map(l2 => l2.code);
        //////console.log(l2CodesArray);
        //////console.log("l2CodesArray");
        const placeholders1 = l2CodesArray.map(() => `L3_Code LIKE CONCAT(?, '%')`).join(" OR ");
        const queryString1 = `SELECT L3_Description AS name, L3_Code FROM RFP_L3_Modules WHERE ${placeholders1}`;
        const [l3Result] = await db.query(queryString1, l2CodesArray);
        const l3CodesArray = l3Result.map(l3 => l3.L3_Code);
        //////console.log(l3CodesArray);
        //////console.log("l3CodesArray");
        // Populate the l3 array in each L2 object
        for (const l2 of l2Codes) {
          l2.l3 = l3Result
            .filter(row => row.L3_Code.startsWith(l2.code)) // Filter L3 results that correspond to the current L2_Code
            .map(row => ({ name: row.name, code: row.L3_Code })); // Create an object for L3
        }
        const matchingL3Codes = l3CodesArray.filter(l3Code =>
          l2CodesArray.some(l2Code => l3Code.startsWith(l2Code))
        );

        // Filter l2CodesArray to find L2_Codes that do not match any L3_Code prefix
        const unmatchedL2Codes = (l2CodesArray.filter(l2Code =>
          !l3CodesArray.some(l3Code => l3Code.startsWith(l2Code))).map(item => item + "00")
        );
        //////console.log(matchingL3Codes);  // Output: ['501010', '501011', '501012', '501013', '501014', '501310', '501311', '501312', '501313']
        //////console.log(unmatchedL2Codes.concat(matchingL3Codes));
        let combinedArray = unmatchedL2Codes.concat(matchingL3Codes)
        //////console.log(combinedArray);
        //////console.log("combinedArray"); 
        // const placeholders2 = l2CodesArray.map(() => `Module_Code LIKE CONCAT(?, '%')`).join(" OR ");
        let newl26d;

        newl26d = l2CodesArray.map(value => value + '00');
        // //////console.log(newl26d);
        // // const queryString2 = `SELECT Description AS name FROM RFP_FunctionalItems WHERE ${placeholders1}`
        // //  [l2CodesArray];
        const queryString2 = `SELECT Description AS name,Module_Code,F1_Code,F2_Code FROM RFP_FunctionalItems WHERE Module_Code IN 
                (${combinedArray.map(() => '?').join(', ')})`
        // //  [newl26d];
        const [f1Result] = await db.query(queryString2, combinedArray);
        //////console.log(f1Result);
        // fItems = f1Result;
        const updatedF1Result = f1Result.map(item => ({
          ...item,
          MorO: true,  // Set the desired value for newKey1
          deleted: false   // Set the desired value for newKey2
        }));
        fItems.push(...updatedF1Result);

      }
      // RFP_FunctionalItems
      // Push the L2 objects to the current L1 object
      data.l1.push({ name: l1.L1_Module_Description, code: l1.L1_Code, l2: l2Codes });
    }
    // Check if any sub-items were returned
    if (l2Result.length > 0) {
      res.json({ success: true, itemDetails: data, functionalItemDetails: fItems });
    } else {
      res.status(404).json({ error: "No sub-items found for this module" });
    }
  } catch (error) {
    //console.error(error); // Log the error for debugging
    res.status(500).send('Internal Server Error'); // Handle errors
  }
});

router.post('/rfpRequirement/saveItems', async (req, res) => {
  const { items } = req.body;
  //////console.log("Items saved successfully")

  // Assuming you have a database function `saveItems` to save the data
  try {
    await saveItems(items);
    res.status(200).send("Items saved successfully");
  } catch (error) {
    //console.error("Error saving items:", error);
    res.status(500).send("Error saving items");
  }
});
const saveItems = async (items) => {
  // Loop through items and insert/update them in the database
  items.forEach(async (item) => {
    //////console.log(item);
    // Perform database operation here
    // Example: await db.collection('items').updateOne({ id: item.id }, { $set: item }, { upsert: true });
  });
};

router.post('/insertFItem', async (req, res) => {
  const { module, items, rfp_no, rfp_title, stage } = req.body;
  //console.log(module);
  //console.log(items);
  //console.log(rfp_title,rfp_no);
  const entity_name = "Coastal"
  // Start a transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    //Insert into L1, L2, and L3 tables
    for (const l1Item of module) {
      const { name, code, l2 } = l1Item;
    
      // Insert or Update into L1 table
      await connection.query(
        `INSERT INTO RFP_Saved_L1_Modules (L1_Code, L1_Module_Description, RFP_No,stage)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         L1_Code = VALUES(L1_Code),
         L1_Module_Description = VALUES(L1_Module_Description), RFP_No = VALUES(RFP_No),stage = VALUES(stage)`,
        [code, name, rfp_no,stage]
      );
    
      if (l2 && l2.length > 0) {
        const l2Values = [];
        const l3Values = [];
    
        for (const l2Item of l2) {
          l2Values.push([l2Item.code, l2Item.name, rfp_no,stage]);
    
          if (l2Item.l3 && Array.isArray(l2Item.l3)) {
            for (const l3Item of l2Item.l3) {
              l3Values.push([l3Item.code, l3Item.name, rfp_no,stage]);
            }
          }
        }
    
        // Batch Insert or Update into L2 table
        if (l2Values.length > 0) {
          const l2Placeholders = l2Values.map(() => "(?, ?, ?, ?)").join(", ");
          await connection.query(
            `INSERT INTO RFP_Saved_L2_Modules (L2_Code, L2_Module_Description, RFP_No,stage)
             VALUES ${l2Placeholders}
             ON DUPLICATE KEY UPDATE 
             L2_Code = VALUES(L2_Code),
             L2_Module_Description = VALUES(L2_Module_Description), RFP_No = VALUES(RFP_No),stage = VALUES(stage)`,
            l2Values.flat()
          );
        }
    
        // Batch Insert or Update into L3 table
        if (l3Values.length > 0) {
          const l3Placeholders = l3Values.map(() => "(?, ?, ?, ?)").join(", ");
          await connection.query(
            `INSERT INTO RFP_Saved_L3_Modules (L3_Code, L3_Module_Description, RFP_No, stage)
             VALUES ${l3Placeholders}
             ON DUPLICATE KEY UPDATE
             L3_Code = VALUES(L3_Code)
             L3_Module_Description = VALUES(L3_Module_Description), RFP_No = VALUES(RFP_No),stage = VALUES(stage)`,
            l3Values.flat()
          );
        }
      }
    }
    


    const insertQuery = `
    INSERT INTO RFP_FunctionalItem_Draft (RFP_Title, RFP_No, Requirement, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, deleted,stage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    ON DUPLICATE KEY UPDATE 
      RFP_Title = VALUES(RFP_Title),
      Requirement = VALUES(Requirement),
      New_Code = VALUES(New_Code),
      Mandatory = VALUES(Mandatory),
      Comments = VALUES(Comments),
      deleted = VALUES(deleted),
      stage = VALUES(stage)
  `;

    for (const item of items) {
      const values = [
        rfp_title,
        rfp_no,
        item.name,
        item.Module_Code,
        item.F1_Code,
        item.F2_Code,
        item.New_Code,
        item.MorO,
        item.Comments,
        item.deleted,
        item.stage
      ];

      await connection.query(insertQuery, values);
    }

    // Commit the transaction
    await connection.commit();
    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error) {
    // Rollback the transaction in case of error
    await connection.rollback();
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'Error inserting data' });
  } finally {
    connection.release();
  }
});


// Saved RFP Details with Items and modules
router.get('/getSavedData', async (req, res) => {
  // const { rfpNo } = req.query;
  // console.log(rfpNo);
  if (!rfpNo) {
    return res.status(400).json({ error: 'RFP_No is required' });
  }

  try {
    // Step 1: Fetch all L1 modules with the specified RFP_No
    const [l1Rows] = await db.query('SELECT * FROM RFP_Saved_L1_Modules WHERE RFP_No = ?', [rfpNo]);

    // Step 2: Fetch related FItem data
    const dropQuery = `
            SELECT RFP_Title, RFP_No, Requirement AS name, Module_Code, F1_Code, F2_Code,
             New_Code, Mandatory, Comments, deleted,stage
            FROM RFP_FunctionalItem_Draft 
            WHERE RFP_No =?`;
    const [fetchedArray] = await db.query(dropQuery, [rfpNo]);

    // Step 3: Iterate over each L1 record and build the nested structure for L2 and L3
    const modules = await Promise.all(l1Rows.map(async (l1Item) => {
      const { L1_Code, L1_Module_Description } = l1Item;

      // Fetch related L2 modules for the current L1 module and specified RFP_No
      const [l2Rows] = await db.query('SELECT * FROM RFP_Saved_L2_Modules WHERE RFP_No = ? ', [rfpNo]);

      // For each L2, fetch related L3 modules and build L2-L3 structure
      const l2Modules = await Promise.all(l2Rows.map(async (l2Item) => {
        const { L2_Code, L2_Module_Description } = l2Item;

        // Fetch related L3 modules for the current L2 module and specified RFP_No
        const [l3Rows] = await db.query('SELECT * FROM RFP_Saved_L3_Modules WHERE RFP_No = ?', [rfpNo]);

        // Map L3 data into a structured format
        const l3Modules = l3Rows.map(l3Item => ({
          code: l3Item.L3_Code,
          name: l3Item.L3_Module_Description
        }));

        // Return L2 structure with nested L3 modules
        return {
          code: L2_Code,
          name: L2_Module_Description,
          l3: l3Modules
        };
      }));

      // Return L1 structure with nested L2 (and L3) modules
      return {
        name: L1_Module_Description,
        code: L1_Code,
        l2: l2Modules
      };
    }));

    // Combine module data and functional item data into one response
    const responseData = {
      modules, // L1, L2, L3 data
      fitems: fetchedArray // Functional Item data
    };
    // console.log("responseData :"+responseData);
    // console.log(responseData);
    // Send the combined data in response
    res.json(responseData);

  } catch (error) {
    console.error('Error retrieving combined data:', error);
    res.status(500).json({ error: 'Error retrieving combined data' });
  }
});


// router.get('/getModuleData', async(req, res) => {
//     // const rfpNo = req.query.rfpNo;
//     //////console.log("getModuleData")
//     const { rfpNo } = req.query;  // Assuming RFP_No is provided as a query parameter
//     //////console.log(rfpNo)
//     if (!rfpNo) {
//         return res.status(400).json({ error: 'RFP_No is required' });
//     }

//     try {
//         // Step 1: Fetch all L1 modules with the specified RFP_No
//         const [l1Rows] = await db.query('SELECT * FROM RFP_Saved_L1_Modules WHERE RFP_No = ?', [rfpNo]);
//         //////console.log(l1Rows)
//         // Step 2: Iterate over each L1 record and build the nested structure
//         const modules = await Promise.all(l1Rows.map(async (l1Item) => {
//             const { L1_Code, L1_Module_Description } = l1Item;

//             // Step 3: Fetch related L2 modules for the current L1 module and specified RFP_No
//             const [l2Rows] = await db.query(
//                 'SELECT * FROM RFP_Saved_L2_Modules WHERE RFP_No = ? ', 
//                 [rfpNo]
//             );
//             //////console.log(l2Rows);
//             // Step 4: For each L2, fetch related L3 modules and build L2-L3 structure
//             const l2Modules = await Promise.all(l2Rows.map(async (l2Item) => {
//                 const { L2_Code, L2_Module_Description } = l2Item;

//                 // Fetch related L3 modules for the current L2 module and specified RFP_No
//                 const [l3Rows] = await db.query(
//                     'SELECT * FROM RFP_Saved_L3_Modules WHERE RFP_No = ?', 
//                     [rfpNo]
//                 );
//                 //////console.log(l3Rows);
//                 // Map L3 data into a structured format
//                 const l3Modules = l3Rows.map(l3Item => ({
//                     code: l3Item.L3_Code,
//                     name: l3Item.L3_Module_Description
//                 }));

//                 // Return L2 structure with nested L3 modules
//                 return {
//                     code: L2_Code,
//                     name: L2_Module_Description,
//                     l3: l3Modules
//                 };
//             }));

//             // Return L1 structure with nested L2 (and L3) modules
//             return {
//                 name: L1_Module_Description,
//                 code: L1_Code,
//                 l2: l2Modules
//             };
//         }));

//         // Send the structured data in response
//         res.json(modules);
//         // //////console.log(modules)

//     } catch (error) {
//         //console.error('Error retrieving module data:', error);
//         res.status(500).json({ error: 'Error retrieving module data' });
//     }
// });

// router.get('/fetchFItem', async (req, res) => {
//     const { rfpNo } = req.query;
//     ////console.log(rfpNo);
//     try {
//         //////console.log("fetchFItem");
//         const dropQuery = `SELECT RFP_Title, RFP_No, Requirement AS name, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, deleted 
//                            FROM RFP_FunctionalItem_Draft 
//                            WHERE RFP_No =?`;

//         const [fetchedArray] = await db.query(dropQuery,[rfpNo]); // Use db.promise() with await for async handling
//         ////console.log(fetchedArray);
//         res.status(200).json({ message: 'Data fetched successfully', data: fetchedArray });
//     } catch (error) {
//         //console.error('Error fetching data:', error);
//         res.status(500).json({ error: 'Database query failed' });
//     }
// });


router.get('/userItemsinSidebar', async (req, res) => {
  console.log("userItemsinSidebar");
  try {
    //console.log("in sidebar")
    const userName = req.query.userName;// Destructure checkedItems from request body
    const userPower = req.query.userPower;// Destructure checkedItems from request body
    var fItems = [];
    var data = [];
    //console.log(userName);
    // Test the first query
    if (userPower == "User") {
      const [userDetails] = await db.query(
        `SELECT user_name, entity_Name, createdby FROM Users_table WHERE email = ?`,
        [userName]
      );
      console.log("User Details:", userDetails);

      // Ensure userDetails is not undefined
      if (!userDetails) {
        throw new Error("User not found.");
      }

      // Test the second query
      const [result] = await db.query(
        `SELECT user_name, is_active, date_from, date_to, is_maker, is_authorizer, is_reviewer,
     module_name, rfp_no 
     FROM User_Modules_Assignment 
     WHERE user_name = ? AND createdby = ? `,
        [userDetails[0].user_name, userDetails[0].createdby]
      );
      //console.log("User Modules Assignment:", result);
      for (i = 0; i < result.length; i++) {
        const { module_name } = result[i];
        const { rfp_no } = result[i];
        const [rfp_title] = await db.query(
          `select rfp_title from RFP_Creation where rfp_no=?`, [rfp_no]);
        //console.log(rfp_title)                  

        data.push({ module_name, rfp_no, rfp_title: rfp_title[0].rfp_title })
        //console.log(data)
      }
    } else if (userPower == "Vendor User") {
      const [userDetails] = await db.query(
        `SELECT user_name, entity_Name, createdby FROM Vendor_Users_table WHERE email = ?`,
        [userName]
      );
      //console.log("User Details:", userDetails);

      // Ensure userDetails is not undefined
      if (!userDetails) {
        throw new Error("User not found.");
      }

      // Test the second query
      const [result] = await db.query(
        `SELECT user_name, is_active, date_from, date_to, is_maker, is_authorizer, is_reviewer,
     module_name, rfp_no 
     FROM VendorUser_Modules_Assignment 
     WHERE user_name = ? AND createdby = ? `,
        [userDetails[0].user_name, userDetails[0].createdby]
      );
      //console.log("User Modules Assignment:", result);
      for (i = 0; i < result.length; i++) {
        const { module_name } = result[i];
        const { rfp_no } = result[i];
        const [rfp_title] = await db.query(
          `select rfp_title from RFP_Creation where rfp_no=?`, [rfp_no]);
        //console.log(rfp_title)                  

        data.push({ module_name, rfp_no, rfp_title: rfp_title[0].rfp_title })
        //console.log(data)
      }

    }

    // console.log(data);
    // console.log("data");
    // //console.log(module_name)
    res.status(200).send(data);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send('Internal Server Error'); // Handle errors

  }
});

router.get('/userAssignItemsbySub', async (req, res) => {
  try {
    console.log("userAssignItemsbySub")
    const { userName, l1, userPower } = req.query;// Destructure checkedItems from request body
    var fItems = [];
    //console.log(l1);
    // //console.log(userName);
    // //console.log(userPower);
    // Test the first query
    let userDetails;
    let result;
    if (userPower == "User") {
      [userDetails] = await db.query(
        `SELECT user_name, entity_Name, createdby FROM Users_table WHERE email = ?`,
        [userName]
      );

      // Ensure userDetails is not undefined
      if (!userDetails) {
        throw new Error("User not found.");
      }

      // Test the second query
      [result] = await db.query(
        `SELECT user_name, is_active, date_from, date_to, is_maker, is_authorizer, is_reviewer,
   module_name, rfp_no 
   FROM User_Modules_Assignment 
   WHERE user_name = ? AND createdby = ?`,
        [userDetails[0].user_name, userDetails[0].createdby]
      );
      //console.log("User Modules Assignment:", result);

    } else if (userPower == "Vendor User") {
      [userDetails] = await db.query(
        `SELECT user_name, entity_Name, createdby FROM Vendor_Users_table WHERE email = ?`,
        [userName]
      );

      // Ensure userDetails is not undefined
      if (!userDetails) {
        throw new Error("User not found.");
      }

      // Test the second query
      [result] = await db.query(
        `SELECT user_name, is_active, date_from, date_to, is_maker, is_authorizer, is_reviewer,
   module_name, rfp_no 
   FROM VendorUser_Modules_Assignment 
   WHERE user_name = ? AND createdby = ? `,
        [userDetails[0].user_name, userDetails[0].createdby]
      );
      //console.log("Vendor User Modules Assignment:", result);

    }

    // //console.log("User Details:", userDetails);


    console.log(result)
    console.log("result")
    // const { module_name } = result[0];
    const { rfp_no } = result[0];
    // //console.log(rfp_no)
    //console.log(module_name)
    //console.log(l1)
    //console.log("result1:  "+result1);

    // Initialize an object to hold the nested structure
    const data = { l1: [], rfp_no,Name: userDetails[0].user_name };
    let combined=[];
    for (const res of result) { // Iterate through all entries in `result`
      // const { rfp_no } = res;
      for (const l1 of res.module_name) { // Process each `l1` (module_name)
        const l2Codes = l1.l2module || [];

        if (l2Codes.length > 0) {
          const l2CodesArray = l2Codes.map(l2 => l2.code);
          const placeholders1 = l2CodesArray.map(() => `L3_Code LIKE CONCAT(?, '%')`).join(" OR ");
          const queryString1 = `SELECT L3_Description AS name, L3_Code FROM RFP_L3_Modules WHERE ${placeholders1}`;

          const [l3Result] = await db.query(queryString1, l2CodesArray);
          const l3CodesArray = l3Result.map(l3 => l3.L3_Code);

          // Populate `l3` for each `l2`
          for (const l2 of l2Codes) {
            l2.l3 = l3Result
              .filter(row => row.L3_Code.startsWith(l2.code))
              .map(row => ({ name: row.name, code: row.L3_Code }));
          }

          const unmatchedL2Codes = l2CodesArray
            .filter(l2Code => !l3CodesArray.some(l3Code => l3Code.startsWith(l2Code)))
            .map(code => code + "00");

          const combinedArray = unmatchedL2Codes.concat(l3CodesArray);

          let queryString2;
          if (userPower === "User") {
            queryString2 = `
          SELECT Description AS name, Module_Code, F1_Code, F2_Code 
          FROM RFP_FunctionalItems 
          WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')})
        `;
          } else if (userPower === "Vendor User") {
            queryString2 = `
          SELECT Requirement AS name, Module_Code, F1_Code, F2_Code, New_Code, Mandatory AS MorO, Comments, deleted 
          FROM rfp_functionalitem_draft 
          WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')})
        `;
          }

          const [f1Result] = await db.query(queryString2, combinedArray);

          const updatedF1Result = f1Result.map(item => ({
            ...item,
            MorO: item.MorO ?? true, // Set default if `Mandatory` is null
            deleted: item.deleted ?? false, // Set default if `deleted` is null
          }));

          fItems.push(...updatedF1Result);
        }

        // Push the processed `l2` with `l3` to `l1`
        data.l1.push({ name: l1.moduleName, code: l1.code, l2: l2Codes });
      }
      // combined.push({data,rfp_no})
    }
    // console.log(combined)
    // Finalize response
    if (data.l1.length > 0) {
      res.json({ success: true, itemDetails: data, functionalItemDetails: fItems });
    } else {
      res.status(404).json({ error: "No sub-items found for these modules" });
    }

  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send('Internal Server Error'); // Handle errors
  }
});

router.get('/getSavedFItems', async (req, res) => {
  try {
    const { rfp_no } = req.query; // Get the RFP_No from the request query
    const connection = await db.getConnection();

    // Fetch data from L1, L2, L3, and FunctionalItem tables
    const [l1Results] = await connection.query(
      `SELECT L1_Code AS code, L1_Module_Description AS name FROM RFP_Saved_L1_Modules WHERE RFP_No = ?`,
      [rfp_no]
    );

    // Initialize an array to hold the complete module structure
    const modules = [];

    for (const l1 of l1Results) {
      // Fetch L2 modules for each L1
      const [l2Results] = await connection.query(
        `SELECT L2_Code AS code, L2_Module_Description AS name FROM RFP_Saved_L2_Modules WHERE RFP_No = ? AND L2_Code LIKE CONCAT(?, '%')`,
        [rfp_no, l1.code]
      );

      // Fetch L3 modules for each L2 and map to the L2 structure
      for (const l2 of l2Results) {
        const [l3Results] = await connection.query(
          `SELECT L3_Code AS code, L3_Module_Description AS name FROM RFP_Saved_L3_Modules WHERE RFP_No = ? AND L3_Code LIKE CONCAT(?, '%')`,
          [rfp_no, l2.code]
        );
        l2.l3 = l3Results; // Add L3 modules to the corresponding L2 module
      }

      // Add L2 modules to the corresponding L1 module
      l1.l2 = l2Results;

      // Push the L1 module structure to the modules array
      modules.push(l1);
    }

    // Fetch Functional Items
    const [functionalItems] = await connection.query(
      `SELECT Requirement AS name, Module_Code, F1_Code, F2_Code, New_Code, Mandatory AS MorO, Comments, deleted 
       FROM RFP_FunctionalItem_Draft WHERE RFP_No = ?`,
      [rfp_no]
    );

    // Send the combined result as a response
    res.status(200).json({
      success: true,
      modules,
      functionalItems
    });

    connection.release(); // Release the database connection
  } catch (error) {
    console.error('Error fetching saved items:', error);
    res.status(500).json({ error: 'Error fetching saved items' });
  }
});


// router.get('/userAssignItems', async (req, res) => {
//   try {
//     //console.log("result")
//     const userName = req.query.userName;// Destructure checkedItems from request body
//     var fItems = [];
//     //console.log(userName);
//     // Test the first query
//     const [userDetails] = await db.query(
//       `SELECT user_name, entity_Name, createdby FROM Users_table WHERE email = ?`,
//       [userName]
//     );
//     //console.log("User Details:", userDetails);

//     // Ensure userDetails is not undefined
//     if (!userDetails) {
//       throw new Error("User not found.");
//     }

//     // Test the second query
//     const [result] = await db.query(
//       `SELECT user_name, is_active, date_from, date_to, is_maker, is_authorizer, is_reviewer,
//    module_name, rfp_no 
//    FROM User_Modules_Assignment 
//    WHERE user_name = ? AND createdby = ? AND rfp_no = 'RFP123'`,
//       [userDetails[0].user_name, userDetails[0].createdby]
//     );
//     //console.log("User Modules Assignment:", result);

//     //console.log(result)
//     const { module_name } = result[0];
//     const { rfp_no } = result[0];
//     //console.log(rfp_no)
//     //console.log(module_name)
//     const result1 = result[0].module_name;
//     // //console.log(l2Codes);
//     // const l1fetch = l2Codes.map(l2 => l2.code.slice(0,2));
//     // //console.log(l1fetch);
//     // Fetch L1_Code based on checkedItems
//     // const [result1] = await db.query(
//     //     `SELECT L1_Code, L1_Module_Description FROM rfp_l1_modules WHERE L1_Module_Description IN (?)`,
//     //     [l1fetch]
//     // );
//     // //console.log(result1);
//     // Extract L1_Code values into an array
//     // const l1Codes = result.map(row => row.L1_Code);
//     //////console.log("L1 Code : " + l1Codes);

//     // Initialize an object to hold the nested structure
//     const data = { l1: [] };

//     // Fetch L2 based on the extracted L1_Code values
//     // const placeholders = l1Codes.map(() => `L2_Code LIKE CONCAT(?, '%')`).join(" OR ");
//     // const queryString = `SELECT L2_Description AS name, L2_Code FROM RFP_L2_Modules WHERE ${placeholders}`;
//     // const [l2Result] = await db.query(queryString, l1Codes);

//     // Populate the l1 array in the data object
//     for (const l1 of result1) {
//       // const l2Codes = l2Result
//       //     .filter(row => row.L2_Code.startsWith(l1.L1_Code)) // Filter L2 results that correspond to the current L1_Code
//       //     .map(row => ({ name: row.name, code: row.L2_Code, l3: [] })); // Create an object for L2 with a nested l3 array
//       const l2Codes = l1.l2module
//       // L1_Code= l1.l2module.code.slice(0,2)
//       //console.log(l2Codes);
//       //console.log("l1.l2module");
//       // Fetch L3 based on the extracted L2_Code values
//       if (l2Codes.length > 0) {
//         const l2CodesArray = l2Codes.map(l2 => l2.code);
//         //console.log(l2CodesArray);
//         //////console.log("l2CodesArray");
//         const placeholders1 = l2CodesArray.map(() => `L3_Code LIKE CONCAT(?, '%')`).join(" OR ");
//         const queryString1 = `SELECT L3_Description AS name, L3_Code FROM RFP_L3_Modules WHERE ${placeholders1}`;
//         //console.log(queryString1);
//         const [l3Result] = await db.query(queryString1, l2CodesArray);
//         const l3CodesArray = l3Result.map(l3 => l3.L3_Code);
//         //console.log(l3Result);
//         //////console.log("l3CodesArray");
//         // Populate the l3 array in each L2 object
//         for (const l2 of l2Codes) {
//           l2.l3 = l3Result
//             .filter(row => row.L3_Code.startsWith(l2.code)) // Filter L3 results that correspond to the current L2_Code
//             .map(row => ({ name: row.name, code: row.L3_Code })); // Create an object for L3
//         }
//         const matchingL3Codes = l3CodesArray.filter(l3Code =>
//           l2CodesArray.some(l2Code => l3Code.startsWith(l2Code))
//         );
//         //console.log(matchingL3Codes);
//         // Filter l2CodesArray to find L2_Codes that do not match any L3_Code prefix
//         const unmatchedL2Codes = (l2CodesArray.filter(l2Code =>
//           !l3CodesArray.some(l3Code => l3Code.startsWith(l2Code))).map(item => item + "00")
//         );
//         //console.log(unmatchedL2Codes);
//         //////console.log(matchingL3Codes);  // Output: ['501010', '501011', '501012', '501013', '501014', '501310', '501311', '501312', '501313']
//         //////console.log(unmatchedL2Codes.concat(matchingL3Codes));
//         let combinedArray = unmatchedL2Codes.concat(matchingL3Codes)
//         //////console.log(combinedArray);
//         //////console.log("combinedArray"); 
//         // const placeholders2 = l2CodesArray.map(() => `Module_Code LIKE CONCAT(?, '%')`).join(" OR ");
//         let newl26d;

//         newl26d = l2CodesArray.map(value => value + '00');
//         // //////console.log(newl26d);
//         // // const queryString2 = `SELECT Description AS name FROM RFP_FunctionalItems WHERE ${placeholders1}`
//         // //  [l2CodesArray];
//         const queryString2 = `SELECT Description AS name,Module_Code,F1_Code,F2_Code FROM RFP_FunctionalItems WHERE Module_Code IN 
//                 (${combinedArray.map(() => '?').join(', ')})`
//         // //  [newl26d];
//         const [f1Result] = await db.query(queryString2, combinedArray);
//         // //console.log(f1Result);
//         // fItems = f1Result;
//         const updatedF1Result = f1Result.map(item => ({
//           ...item,
//           MorO: true,  // Set the desired value for newKey1
//           deleted: false   // Set the desired value for newKey2
//         }));

//         fItems.push(...updatedF1Result);
//       }

//       // RFP_FunctionalItems
//       // Push the L2 objects to the current L1 object
//       data.l1.push({ name: l1.moduleName, code: l1.code, l2: l2Codes });
//     }
//     data.rfp_no =rfp_no;
//     //console.log(data);
//     // Check if any sub-items were returned
//     if (result1.length > 0) {
//       res.json({ success: true, itemDetails: data, functionalItemDetails: fItems });
//     } else {
//       res.status(404).json({ error: "No sub-items found for this module" });
//     }

//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     res.status(500).send('Internal Server Error'); // Handle errors
//   }
// });



router.get('/loadContents-initial', async (req, res) => {
  try {
    console.log("loadContents-initial")
    const { userName, userPower } = req.query;// Destructure checkedItems from request body
    var fItems = [];
    //console.log(l1);
    // //console.log(userName);
    // //console.log(userPower);
    // Test the first query
    let userDetails;
    let result;
    if (userPower == "User") {
      [userDetails] = await db.query(
        `SELECT user_name, entity_Name, createdby FROM Users_table WHERE email = ?`,
        [userName]
      );

      // Ensure userDetails is not undefined
      if (!userDetails) {
        throw new Error("User not found.");
      }

      // Test the second query
      [result] = await db.query(
        `SELECT user_name, is_active, date_from, date_to, is_maker, is_authorizer, is_reviewer,
   module_name, rfp_no 
   FROM User_Modules_Assignment 
   WHERE user_name = ? AND createdby = ?`,
        [userDetails[0].user_name, userDetails[0].createdby]
      );
      //console.log("User Modules Assignment:", result);

    } else if (userPower == "Vendor User") {
      [userDetails] = await db.query(
        `SELECT user_name, entity_Name, createdby FROM Vendor_Users_table WHERE email = ?`,
        [userName]
      );

      // Ensure userDetails is not undefined
      if (!userDetails) {
        throw new Error("User not found.");
      }

      // Test the second query
      [result] = await db.query(
        `SELECT user_name, is_active, date_from, date_to, is_maker, is_authorizer, is_reviewer,
   module_name, rfp_no 
   FROM VendorUser_Modules_Assignment 
   WHERE user_name = ? AND createdby = ? `,
        [userDetails[0].user_name, userDetails[0].createdby]
      );
      //console.log("Vendor User Modules Assignment:", result);

    }

    // //console.log("User Details:", userDetails);


    console.log(result)
    console.log("result")
    // const { module_name } = result[0];
    const { rfp_no } = result[0];
    // //console.log(rfp_no)
    //console.log(module_name)
    //console.log(l1)
    //console.log("result1:  "+result1);

    // Initialize an object to hold the nested structure
    const data = { l1: [], rfp_no,Name: userDetails[0].user_name };
    let combined=[];
    for (const res of result) { // Iterate through all entries in `result`
      // const { rfp_no } = res;
      for (const l1 of res.module_name) { // Process each `l1` (module_name)
        const l2Codes = l1.l2module || [];

        if (l2Codes.length > 0) {
          const l2CodesArray = l2Codes.map(l2 => l2.code);
          const placeholders1 = l2CodesArray.map(() => `L3_Code LIKE CONCAT(?, '%')`).join(" OR ");
          const queryString1 = `SELECT L3_Description AS name, L3_Code FROM RFP_L3_Modules WHERE ${placeholders1}`;

          const [l3Result] = await db.query(queryString1, l2CodesArray);
          const l3CodesArray = l3Result.map(l3 => l3.L3_Code);

          // Populate `l3` for each `l2`
          for (const l2 of l2Codes) {
            l2.l3 = l3Result
              .filter(row => row.L3_Code.startsWith(l2.code))
              .map(row => ({ name: row.name, code: row.L3_Code }));
          }

          const unmatchedL2Codes = l2CodesArray
            .filter(l2Code => !l3CodesArray.some(l3Code => l3Code.startsWith(l2Code)))
            .map(code => code + "00");

          const combinedArray = unmatchedL2Codes.concat(l3CodesArray);

          let queryString2;
          if (userPower === "User") {
            queryString2 = `
          SELECT Description AS name, Module_Code, F1_Code, F2_Code 
          FROM RFP_FunctionalItems 
          WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')})
        `;
          } else if (userPower === "Vendor User") {
            queryString2 = `
          SELECT Requirement AS name, Module_Code, F1_Code, F2_Code, New_Code, Mandatory AS MorO, Comments, deleted 
          FROM rfp_functionalitem_draft 
          WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')})
        `;
          }

          const [f1Result] = await db.query(queryString2, combinedArray);

          const updatedF1Result = f1Result.map(item => ({
            ...item,
            MorO: item.MorO ?? true, // Set default if `Mandatory` is null
            deleted: item.deleted ?? false, // Set default if `deleted` is null
          }));

          fItems.push(...updatedF1Result);
        }

        // Push the processed `l2` with `l3` to `l1`
        data.l1.push({ name: l1.moduleName, code: l1.code, l2: l2Codes });
      }
      // combined.push({data,rfp_no})
    }
    // console.log(combined)
    // Finalize response
    if (data.l1.length > 0) {
      res.json({ success: true, itemDetails: data, functionalItemDetails: fItems });
    } else {
      res.status(404).json({ error: "No sub-items found for these modules" });
    }

  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send('Internal Server Error'); // Handle errors
  }
});
//vendorQuery Saving
router.post('/vendorQuery-save-draft', async (req, res) => {
  console.log("vendorQuery-save-draft");
    const { rfpNo, rfpTitle, vendorName, bankName, createdBy, stage, rows } = req.body;

    try {
        const query = `
            INSERT INTO VendorQuery (rfp_no, rfp_title, vendor_name, bank_name, created_by, stage, rows_data)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                rfp_title = VALUES(rfp_title),
                stage = VALUES(stage),
                rows_data = VALUES(rows_data),
                updated_at = CURRENT_TIMESTAMP;
        `;
        await db.execute(query, [
            rfpNo,
            rfpTitle,
            vendorName,
            bankName,
            createdBy,
            stage,
            JSON.stringify(rows),
        ]);

        res.status(200).send({ message: 'Draft saved or updated successfully!' });
    } catch (error) {
        console.error('Error saving draft:', error);
        res.status(500).send({ message: 'Failed to save or update draft' });
    }
});

module.exports = router;
