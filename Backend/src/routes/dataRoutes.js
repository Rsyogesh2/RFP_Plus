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
    const [rows] = await db.query('SELECT distinct Module_Group as name, Module_ID as Code FROM RFP_L1_modules');
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

//when RFP No selected in Assigned Users
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
    if (userPower[0].Role == "Super Admin") {
      [assignedUsers] = await db.query(
        `SELECT user_name, is_active as active, date_from as fromDate, date_to as toDate, is_maker as maker,
         is_authorizer as authorizer, is_reviewer as reviewer, module_name 
         FROM User_Modules_Assignment 
         WHERE rfp_no = ? `,
        [rfpNo]
      );
      console.log(rfpNo);
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
        const { module_name, ...rest } = user; // Destructure to extract module_name
        return {
            ...rest,
            selectedModules: module_name, // Rename module_name to selectedModules
        };
      });
    }
    console.log("parsedUsers");
    console.log(data);
    console.log(parsedUsers);
    // parsedUsers.module_name to parsedUsers.selectedModules
    data.l1.push({ name: "Others", code: 99, l2: [{ name: "Scoring Criteria", code: 9999 }] });
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
      `SELECT L1_Module_Description as name,L1_Code as Code FROM RFP_L1_modules WHERE Module_Group = ?`,
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
    const [rows] = await db.query('SELECT distinct Product_Group as name , Group_ID as Code FROM RFP_Products');
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
      `SELECT Financial_Products as name, Code FROM RFP_Products WHERE Product_Group = ?`,
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
          Mandatory: true,  // Set the desired value for newKey1
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
  console.log("🚀 insertFItem API called");

  const { payload } = req.body;
  const {
    module,
    items,
    rfp_no,
    rfp_title,
    stage,
    bank_name,
    created_by,
    assigned_to,
    Status,
    Priority,
    Handled_by,
    Action_log,
    level,  
    userPower
  } = payload;

  console.log(`🔹 User Power: ${userPower}, Level: ${level}, Status: ${Status}`);

  const connection = await db.getConnection();

  try {
    console.log("✅ Starting transaction...");
    await connection.beginTransaction();
    const [userDetails] = await db.query(
      `SELECT user_name, entity_Name, createdby FROM Users_table WHERE email = ?`,
      [created_by]
    );
    const [bankNameResult] = await db.query(
            `SELECT entity_name,user_id as id FROM superadmin_users WHERE super_user_email = ?`, 
            [userPower=="Super Admin"?created_by:userDetails[0].createdby]
        );
    if (userPower === "User" || userPower === "Super Admin") {
      for (const l1Item of module) {
        const { name, code, l2 } = l1Item;
        console.log(`🔍 Processing L1: Code=${code}, Name=${name}`);

        // First, attempt an UPDATE
        const updateL1 = await connection.query(
          `UPDATE RFP_Saved_L1_Modules 
           SET L1_Module_Description = ?, stage = ?, bank_name = ?, created_by = ?, assigned_to = ?, Status = ?, Priority = ?, Handled_By = ?, Action_Log = ?, Level = ?
           WHERE L1_Code = ? AND RFP_No = ?`,
          [name, stage, bank_name, created_by, assigned_to, Status, Priority, JSON.stringify(Handled_by), Action_log, level, code, rfp_no]
        );

        console.log(`🔄 L1 Update Affected Rows: ${updateL1[0].affectedRows}`);

        if (updateL1[0].affectedRows === 0) {
          console.log(`⚠️ No existing L1 record found, inserting new row for Code=${code}`);
          await connection.query(
            `INSERT INTO RFP_Saved_L1_Modules 
              (L1_Code, L1_Module_Description, RFP_No, stage, bank_name, created_by, assigned_to, 
              Status, Priority, Handled_By, Action_Log, Level,Bank_Id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [code, name, rfp_no, stage, bank_name, created_by, assigned_to, Status, Priority, 
              JSON.stringify(Handled_by), Action_log, level,bankNameResult[0].id]
          );
        }

        if (l2 && l2.length > 0) {
          for (const l2Item of l2) {
            console.log(`🔍 Processing L2: Code=${l2Item.code}, Name=${l2Item.name}`);

            await connection.query(
              `INSERT INTO RFP_Saved_L2_Modules (L2_Code, L2_Module_Description, RFP_No, stage)
               VALUES (?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE L2_Module_Description = VALUES(L2_Module_Description), stage = VALUES(stage)`,
              [l2Item.code, l2Item.name, rfp_no, stage]
            );

            if (l2Item.l3 && l2Item.l3.length > 0) {
              for (const l3Item of l2Item.l3) {
                console.log(`🔍 Processing L3: Code=${l3Item.code}, Name=${l3Item.name}`);

                await connection.query(
                  `INSERT INTO RFP_Saved_L3_Modules (L3_Code, L3_Module_Description, RFP_No, stage)
                   VALUES (?, ?, ?, ?)
                   ON DUPLICATE KEY UPDATE L3_Module_Description = VALUES(L3_Module_Description), stage = VALUES(stage)`,
                  [l3Item.code, l3Item.name, rfp_no, stage]
                );
              }
            }
          }
        }
      }

      for (const item of items) {
        // console.log(`🔍 Processing Item: Name=${item.name}, Module_Code=${item.Module_Code}`);

        let Modified_Time = null;
        if (item.Modified_Time && !isNaN(new Date(item.Modified_Time))) {
          const date = new Date(item.Modified_Time);
          Modified_Time = new Date(date - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19).replace('T', ' ');
        }

        if(userPower==="User"){
          const values = [
            rfp_title, rfp_no, item.name, item.Module_Code, item.F1_Code, item.F2_Code, item.New_Code || "00",
            item.Mandatory, item.Comments, item.deleted, Modified_Time, item.Edited_By, stage, bank_name, 
            created_by, assigned_to, Status, Priority, JSON.stringify(Handled_by), Action_log, level,bankNameResult[0].id
          ];
  
          const insertQuery = ` 
            INSERT INTO RFP_FunctionalItem_Draft 
              (RFP_Title, RFP_No, Requirement, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, 
              deleted, Modified_Time, Edited_By, stage, bank_name, created_by, assigned_to, Status, Priority, 
              Handled_By, Action_Log, Level,Bank_Id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              Requirement = VALUES(Requirement),
              Mandatory = VALUES(Mandatory),
              Comments = VALUES(Comments),
              deleted = VALUES(deleted),
              Modified_Time = VALUES(Modified_Time),
              Edited_By = VALUES(Edited_By),
              stage = VALUES(stage),
              created_by = VALUES(created_by),
              assigned_to = VALUES(assigned_to),
              Status = VALUES(Status),
              Priority = VALUES(Priority),
              Handled_By = VALUES(Handled_By),
              Action_Log = VALUES(Action_Log),
              Level = VALUES(Level);
          `;
  
          const updateResult = await connection.query(insertQuery, values);
          // console.log(`🔄 Item Insert/Update Affected Rows: ${updateResult[0].affectedRows}`);
        
        } else if(userPower==="Super Admin"){
          console.log("inside super Admin")
          const [rows] = await connection.query(
            `SELECT Level FROM RFP_FunctionalItem_Draft WHERE RFP_No = ? AND Module_Code = ?`, 
            [rfp_no, item.Module_Code]
          );
          // console.log(`Before Update - Level in DB: ${rows.length ? rows[0].Level : 'Not Found'}`);
          
          const updateQuery = `
                UPDATE RFP_FunctionalItem_Draft
                SET 
                  assigned_to = ?, 
                  Status = ?, 
                  Handled_By = ?, 
                  Action_Log = ?, 
                  Level = ?
                WHERE 
                  RFP_No = ? AND 
                  Module_Code = ? AND 
                  F1_Code = ? AND 
                  F2_Code = ? AND 
                  New_Code = ?;
              `;

              const updateValues = [
                assigned_to, 
                "Bank_Pending_Admin", 
                JSON.stringify(Handled_by), 
                Action_log, 
                4, // Updating Level to 4
                rfp_no, 
                item.Module_Code, 
                item.F1_Code, 
                item.F2_Code, 
                item.New_Code || "00"
              ];

              console.log(updateValues)
          const updateResult = await connection.query(updateQuery, updateValues);
          // console.log(`🔄 Item Insert/Update Affected Rows: ${updateResult[0].affectedRows}`);
        
        }
        }
    } else if (userPower === "Vendor User") {
      console.log("⚠️ Vendor User access - No operations performed.");
    }

    console.log("✅ Committing transaction...");
    await connection.commit();
    res.status(200).json({ message: 'Data inserted/updated successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error inserting data:', error);
    res.status(500).json({ error: 'Error inserting data', details: error.message });
  } finally {
    connection.release();
  }
});


// router.post('/insertFItem', async (req, res) => {
//   console.log("insertFItem");
//   const { module, items, rfp_no, rfp_title, stage, entity_Name, userName } = req.body;
//   console.log(rfp_no, rfp_title, stage, entity_Name, userName);
//   //console.log(module);
//   //console.log(items);
//   //console.log(rfp_title,rfp_no);
//   // const entity_name = "Coastal"
//   // Start a transaction
//   const connection = await db.getConnection();
//   await connection.beginTransaction();

//   try {
//     //Insert into L1, L2, and L3 tables
//     for (const l1Item of module) {
//       const { name, code, l2 } = l1Item;

//       // Insert or Update into L1 table
//       await connection.query(
//         `INSERT INTO RFP_Saved_L1_Modules (L1_Code, L1_Module_Description, RFP_No,stage, entity_Name, userName)
//          VALUES (?, ?, ?, ?, ?, ?)
//          ON DUPLICATE KEY UPDATE
//          L1_Code = VALUES(L1_Code),
//          L1_Module_Description = VALUES(L1_Module_Description), RFP_No = VALUES(RFP_No),stage = VALUES(stage)`,
//         [code, name, rfp_no, stage, entity_Name, userName]
//       );
//       console.log("after l1");
//       if (l2 && l2.length > 0) {
//         const l2Values = [];
//         const l3Values = [];

//         for (const l2Item of l2) {
//           l2Values.push([l2Item.code, l2Item.name, rfp_no, stage]);

//           if (l2Item.l3 && Array.isArray(l2Item.l3)) {
//             for (const l3Item of l2Item.l3) {
//               l3Values.push([l3Item.code, l3Item.name, rfp_no, stage]);
//             }
//           }
//         }

//         // Batch Insert or Update into L2 table
//         if (l2Values.length > 0) {
//           const l2Placeholders = l2Values.map(() => "(?, ?, ?, ?)").join(", ");
//           await connection.query(
//             `INSERT INTO RFP_Saved_L2_Modules (L2_Code, L2_Module_Description, RFP_No,stage)
//              VALUES ${l2Placeholders}
//              ON DUPLICATE KEY UPDATE 
//              L2_Code = VALUES(L2_Code),
//              L2_Module_Description = VALUES(L2_Module_Description), RFP_No = VALUES(RFP_No),stage = VALUES(stage)`,
//             l2Values.flat()
//           );
//         }
//         console.log("afterl2");
//         // Batch Insert or Update into L3 table
//         if (l3Values.length > 0) {
//           const l3Placeholders = l3Values.map(() => "(?, ?, ?, ?)").join(", ");
//           await connection.query(
//             `INSERT INTO RFP_Saved_L3_Modules (L3_Code, L3_Module_Description, RFP_No, stage)
//              VALUES ${l3Placeholders}
//              ON DUPLICATE KEY UPDATE
//              L3_Code = VALUES(L3_Code),
//              L3_Module_Description = VALUES(L3_Module_Description), RFP_No = VALUES(RFP_No),stage = VALUES(stage)`,
//             l3Values.flat()
//           );
//         }
//       }
//     }


//     console.log("after l3")
//     const insertQuery = `
//     INSERT INTO RFP_FunctionalItem_Draft (RFP_Title, RFP_No, Requirement, Module_Code, F1_Code,
//     F2_Code, New_Code, Mandatory, Comments, deleted,stage,entity_Name,userName,Level)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     ON DUPLICATE KEY UPDATE 
//       RFP_Title = VALUES(RFP_Title),
//       Requirement = VALUES(Requirement),
//       New_Code = VALUES(New_Code),
//       Mandatory = VALUES(Mandatory),
//       Comments = VALUES(Comments),
//       deleted = VALUES(deleted),
//       stage = VALUES(stage),
//       entity_Name = VALUES(entity_Name),
//       userName =  VALUES(userName) ,
//       Level =  "Bank"
//   `;

//     for (const item of items) {
//       const values = [
//         rfp_title,
//         rfp_no,
//         item.name,
//         item.Module_Code,
//         item.F1_Code,
//         item.F2_Code,
//         item.New_Code,
//         item.Mandatory,
//         item.Comments,
//         item.deleted,
//         stage,
//         entity_Name,
//         userName,
//         "Bank"
//       ];

//       await connection.query(insertQuery, values);
//       console.log("Fitems")
//     }

//     // Commit the transaction
//     await connection.commit();
//     res.status(200).json({ message: 'Data inserted successfully' });
//   } catch (error) {
//     // Rollback the transaction in case of error
//     await connection.rollback();
//     console.error('Error inserting data:', error);
//     res.status(500).json({ error: 'Error inserting data' });
//   } finally {
//     connection.release();
//   }
// });

// router.post('/insertFItem', async (req, res) => {
//   console.log("insertFItem");

//   const {payload} = req.body;
//   // console.log("Payload:", payload);

//   const {
//     module,
//     items,
//     rfp_no,
//     rfp_title,
//     stage,
//     bank_name,
//     created_by,
//     assigned_to,
//     Status,
//     Priority,
//     Handled_by,
//     Action_log,
//     level,  
//     userPower
//   } = payload;
//   console.log(level,Status,userPower);

//   const connection = await db.getConnection();

//   try {
//     // Start a transaction
//     await connection.beginTransaction();

//     // Handle `Handled_by` field
//     // if (Array.isArray(Handled_by) && Handled_by.length > 0) {
//     //   for (const handler of Handled_by) {
//     //     const { name, role } = handler;

//     //     await connection.query(
//     //       `INSERT INTO RFP_Handled_By 
//     //         (RFP_No, Handler_Name, Handler_Role)
//     //        VALUES (?, ?, ?)
//     //        ON DUPLICATE KEY UPDATE
//     //          Handler_Role = VALUES(Handler_Role)`,
//     //       [rfp_no, name, role]
//     //     );
//     //   }
//     // }

//     if(userPower=="User" ||userPower=="Super Admin"){
//       console.log(userPower);
//     // Insert or Update into L1, L2, and L3 tables
//     for (const l1Item of module) {
//       const { name, code, l2 } = l1Item;

//       await connection.query(
//         `INSERT INTO RFP_Saved_L1_Modules 
//           (L1_Code, L1_Module_Description, RFP_No, stage, bank_name, created_by, assigned_to, Status, Priority, Handled_By, Action_Log, Level)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//          ON DUPLICATE KEY UPDATE
//            L1_Module_Description = VALUES(L1_Module_Description),
//            RFP_No = VALUES(RFP_No),
//            stage = VALUES(stage),
//            bank_name = VALUES(bank_name),
//            created_by = VALUES(created_by),
//            assigned_to = VALUES(assigned_to),
//            Status = VALUES(Status),
//            Priority = VALUES(Priority),
//            Handled_By = VALUES(Handled_By),
//            Action_Log = VALUES(Action_Log),
//            Level = VALUES(Level)`,
//         [code, name, rfp_no, stage, bank_name, created_by, assigned_to, Status, Priority, JSON.stringify(Handled_by), Action_log, level]
//       );

//       if (l2 && l2.length > 0) {
//         const l2Values = [];
//         const l3Values = [];

//         for (const l2Item of l2) {
//           l2Values.push([l2Item.code, l2Item.name, rfp_no, stage]);

//           if (l2Item.l3 && Array.isArray(l2Item.l3)) {
//             for (const l3Item of l2Item.l3) {
//               l3Values.push([l3Item.code, l3Item.name, rfp_no, stage]);
//             }
//           }
//         }

//         // Batch Insert or Update into L2 table
//         if (l2Values.length > 0) {
//           const l2Placeholders = l2Values.map(() => "(?, ?, ?, ?)").join(", ");
//           await connection.query(
//             `INSERT INTO RFP_Saved_L2_Modules 
//               (L2_Code, L2_Module_Description, RFP_No, stage)
//              VALUES ${l2Placeholders}
//              ON DUPLICATE KEY UPDATE 
//                L2_Module_Description = VALUES(L2_Module_Description),
//                RFP_No = VALUES(RFP_No),
//                stage = VALUES(stage)`,
//             l2Values.flat()
//           );
//         }

//         // Batch Insert or Update into L3 table
//         if (l3Values.length > 0) {
//           const l3Placeholders = l3Values.map(() => "(?, ?, ?, ?)").join(", ");
//           await connection.query(
//             `INSERT INTO RFP_Saved_L3_Modules 
//               (L3_Code, L3_Module_Description, RFP_No, stage)
//              VALUES ${l3Placeholders}
//              ON DUPLICATE KEY UPDATE
//                L3_Module_Description = VALUES(L3_Module_Description),
//                RFP_No = VALUES(RFP_No),
//                stage = VALUES(stage)`,
//             l3Values.flat()
//           );
//         }
//       }
//     }

//     // Insert or Update items into the draft table
//     for (const item of items) {

//       let Modified_Time;
//       if (item.Modified_Time && !isNaN(new Date(item.Modified_Time))) {
//           const date = new Date(item.Modified_Time);
          
//           // Adjusting for local time zone offset
//           const offset = date.getTimezoneOffset() * 60000; 
//           const localISOTime = new Date(date - offset).toISOString().slice(0, 19).replace('T', ' ');
          
//           Modified_Time = localISOTime;
//           // console.log(item.Modified_Time, item.name, Modified_Time);
//       } else {
//           Modified_Time = null;  // or provide a default value like new Date()
//       }
      
//       const values = [
//         rfp_title,
//         rfp_no,
//         item.name,
//         item.Module_Code,
//         item.F1_Code,
//         item.F2_Code,
//         item.New_Code || "00",
//         item.Mandatory,
//         item.Comments,
//         item.deleted,
//         Modified_Time,
//         item.Edited_By,
//         stage,
//         bank_name,
//         created_by,
//         assigned_to,
//         Status,
//         Priority,
//         JSON.stringify(Handled_by),
//         Action_log,
//         level,
//       ];

//       const insertQuery = `
//     INSERT INTO RFP_FunctionalItem_Draft 
//       (RFP_Title, RFP_No, Requirement, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, deleted,Modified_Time,Edited_By, stage, bank_name, created_by, assigned_to, Status, Priority, Handled_By, Action_Log, Level)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     ON DUPLICATE KEY UPDATE 
//       Requirement = VALUES(Requirement),
//       Mandatory = VALUES(Mandatory),
//       Comments = VALUES(Comments),
//       deleted = VALUES(deleted),
//       Modified_Time = VALUES(Modified_Time),
//       Edited_By = VALUES(Edited_By),
//       stage = VALUES(stage),
//       created_by = VALUES(created_by),
//       assigned_to = VALUES(assigned_to),
//       Status = VALUES(Status),
//       Priority = VALUES(Priority),
//       Handled_By = VALUES(Handled_By),
//       Action_Log = VALUES(Action_Log),
//       Level = VALUES(Level)
// `;


//       await connection.query(insertQuery, values);

//     //   if(Number(level)==5){
//     //   const insertQueryVendor = `
//     // INSERT INTO RFP_FunctionalItem_Draft 
//     //   (RFP_Title, RFP_No, Requirement, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, deleted,
//     //   Modified_Time,Edited_By, stage, bank_name, created_by, assigned_to, Status, Priority, Handled_By,
//     //    Action_Log, Level, Vendor_Id, Bank_Id)
//     // VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     // ON DUPLICATE KEY UPDATE 
//     //   Requirement = VALUES(Requirement),
//     //   Mandatory = VALUES(Mandatory),
//     //   Comments = VALUES(Comments),
//     //   deleted = VALUES(deleted),
//     //   Modified_Time = VALUES(Modified_Time),
//     //   Edited_By = VALUES(Edited_By),
//     //   stage = VALUES(stage),
//     //   created_by = VALUES(created_by),
//     //   assigned_to = VALUES(assigned_to),
//     //   Status = VALUES(Status),
//     //   Priority = VALUES(Priority),
//     //   Handled_By = VALUES(Handled_By),
//     //   Action_Log = VALUES(Action_Log),
//     //   Level = VALUES(Level)
//     //   `;  
//     //   const values1 = [
//     //     rfp_title,
//     //     rfp_no,
//     //     item.name,
//     //     item.Module_Code,
//     //     item.F1_Code,
//     //     item.F2_Code,
//     //     item.New_Code || "00",
//     //     item.Mandatory,
//     //     item.Comments,
//     //     item.deleted,
//     //     Modified_Time,
//     //     item.Edited_By,
//     //     stage,
//     //     bank_name,
//     //     created_by,
//     //     assigned_to,
//     //     Status,
//     //     Priority,
//     //     JSON.stringify(Handled_by),
//     //     Action_log,
//     //     level,
//     //     Vendor_Id,
//     //     Bank_Id
        
//     //   ];
//     //   await connection.query(insertQueryVendor, values1);
//     // }
//     }
//     } else if(userPower=="Vendor User"){
      
//     }

//     // Commit the transaction
//     await connection.commit();
//     res.status(200).json({ message: 'Data inserted successfully' });
//   } catch (error) {
//     // Rollback the transaction in case of error
//     await connection.rollback();
//     console.error('Error inserting data:', error);
//     res.status(500).json({ error: 'Error inserting data' });
//   } finally {
//     connection.release();
//   }
// });

// Define the route to insert data
router.post('/insert-rfp-functionalitem-vendor', async (req, res) => {
  try {
    const payload = req.body;
    console.log("Payload:", payload);

    const {
      rfp_no,
      items,
      stage,
      created_by,
      level,
      Assigned_To,
      Status,
      Priority,
      Handled_by,
      Action_log,
    } = payload;
    console.log(payload);
    // Fetch created_by from vendor_users_table
    const [createdby] = await db.query(`
      SELECT createdby FROM vendor_users_table WHERE email = ?`, [created_by]);
    // console.log(createdby[0].createdby);

    // Fetch vendor_Id based on rfp_no and createdby
    const [vendor_Id] = await db.query(`
      SELECT id FROM vendor_admin_users WHERE rfp_reference_no = ? AND email = ?`, 
      [rfp_no, createdby[0].createdby]);
    console.log(vendor_Id[0].id);

    let a = false, p = false, c = false, n = false;  // Default values

    for (const item of items) {
      // console.log(item.SelectedOption);
      a = item.SelectedOption === "A" || item.A ;
      p = item.SelectedOption === "P" || item.P ;
      c = item.SelectedOption === "C" || item.C ;
      n = item.SelectedOption === "N" || item.N ;

      // Prepare the SQL insert query with ON DUPLICATE KEY UPDATE
      const query = `
        INSERT INTO RFP_FunctionalItem_Vendor (
          rfp_functionalitem_draft_id, Vendor_Id, rfp_reference_no, A, P, C, N, 
          Remarks, Attach, stage, created_by, Level, Assigned_To, Status, 
          Priority, Handled_By, Action_Log
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          A = VALUES(A),
          P = VALUES(P),
          C = VALUES(C),
          N = VALUES(N),
          Remarks = VALUES(Remarks),
          Attach = VALUES(Attach),
          stage = VALUES(stage),
          created_by = VALUES(created_by),
          Level = VALUES(Level),
          Assigned_To = VALUES(Assigned_To),
          Status = VALUES(Status),
          Priority = VALUES(Priority),
          Handled_By = VALUES(Handled_By),
          Action_Log = VALUES(Action_Log)
      `;

      // Values array
      const values = [
        item.RFP_functionalitem_DraftId, 
        vendor_Id[0].id, 
        rfp_no, 
        a, 
        p, 
        c, 
        n,
        item.Remarks || null, 
        item.Attach || null,  
        stage, 
        created_by, 
        level, 
        Assigned_To, 
        Status, 
        Priority, 
        Handled_by, 
        Action_log
      ];

      // Execute the query
      await db.query(query, values);
    }

    res.status(200).json({ message: "Data inserted or updated successfully" });
  } catch (error) {
    console.error("Insertion Failed: " + error);
    res.status(500).json({ error: "Insertion failed", message: error.message });
  }
});

// Completed the RFP by Vendor
router.post('/completed-rfp-functionalitem-vendor', async (req, res) => {
  try {
    const payload = req.body;
    console.log("Payload:", payload);

    const {
      rfp_no,
      items,
      stage,
      created_by,
      level,
      Status,
      Handled_by,
      Action_log,
    } = payload;

    // Fetch vendor_Id based on rfp_no and created_by
    const [vendor_Id] = await db.query(
      `SELECT id FROM vendor_admin_users WHERE rfp_reference_no = ? AND email = ?`, 
      [rfp_no, created_by]
    );

    if (!vendor_Id.length) {
      return res.status(404).json({ error: "Vendor ID not found" });
    }

    for (const item of items) {
      const query = `
        UPDATE RFP_FunctionalItem_Vendor 
        SET 
          stage = ?, 
          Level = ?, 
          Status = ?, 
          Handled_By = ?, 
          Action_Log = ? 
        WHERE 
          rfp_functionalitem_draft_id = ? 
          AND Vendor_Id = ? 
          AND rfp_reference_no = ?
      `;

      const values = [
        stage, 
        level, 
        Status, 
        Handled_by, 
        Action_log, 
        item.RFP_functionalitem_DraftId, 
        vendor_Id[0].id, 
        rfp_no
      ];

      await db.query(query, values);
    }

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Update Failed: " + error);
    res.status(500).json({ error: "Update failed", message: error.message });
  }
});




//Saved RFP Details with Items and modules
router.post('/getSavedModule', async (req, res) => {
  const {rfpNo } = req.body;
  console.log(rfpNo);
  // const rfpNo ="RFP123";
  if (!rfpNo) {
    return res.status(400).json({ error: 'RFP_No is required' });
  }

  try {
    const [l1Rows] = await db.query('SELECT * FROM RFP_Saved_L1_Modules WHERE RFP_No = ?', [rfpNo]);
    
    // Step 3: Iterate over each L1 record and build the nested structure for L2 and L3
    const modules = await Promise.all(l1Rows.map(async (l1Item) => {
      const { L1_Code, L1_Module_Description } = l1Item;

      // Fetch related L2 modules for the current L1 module and specified RFP_No
      const [l2Rows] = await db.query('SELECT * FROM RFP_Saved_L2_Modules WHERE RFP_No = ? AND L2_Code LIKE ?', [rfpNo, `${L1_Code}%`]);

      // For each L2, fetch related L3 modules and build L2-L3 structure
      const l2Modules = await Promise.all(l2Rows.map(async (l2Item) => {
        const { L2_Code, L2_Module_Description } = l2Item;

        // Fetch related L3 modules for the current L2 module and specified RFP_No
        const [l3Rows] = await db.query('SELECT * FROM RFP_Saved_L3_Modules WHERE RFP_No = ? and L3_Code LIKE ?', [rfpNo,`${L2_Code}%`]);

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
router.get('/getSavedData', async (req, res) => {
  let { userPower, userName,rfpNo,actionName,selectedVendor } = req.query;
  // console.log("rfpNo" +rfpNo);
  console.log("getSavedData");
  console.log(userPower, userName,rfpNo,actionName,selectedVendor);
  // const rfpNo ="RFP123";
  if (!rfpNo && userPower=="Super Admin") {
    return res.status(400).json({ error: 'RFP_No is required' });
  }

  try {
    const [rfp] = await db.query('select rfp_no, rfp_title from rfp_creation WHERE email = ?', [userName]);
    // console.log(rfp)
    let queryString2;
     let fetchedArray=[] 
    // Step 1: Fetch all L1 modules with the specified RFP_No
    // const [res] = await db.query('SELECT module_name,rfp_no FROM user_modules_assignment WHERE user_name = ? and createdby=?'  , [rfpNo]);
    // const [l1Rows] = await db.query('SELECT * FROM RFP_L1_Modules WHERE RFP_No = ?', [rfpNo]);

    // Step 2: Fetch related FItem data
    // const dropQuery = `
    //         SELECT RFP_Title, RFP_No, Requirement AS name, Module_Code, F1_Code, F2_Code,
    //          New_Code, Mandatory, Comments, deleted,stage
    //         FROM RFP_FunctionalItem_Draft 
    //         WHERE RFP_No =?`;
    // const [fetchedArray] = await db.query(dropQuery, [rfpNo]);
    if(userPower=="Super Admin"){
      if(actionName==="View RFP"){
        queryString2 = `
        SELECT requirement AS name, RFP_Title, RFP_No, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, 
              deleted, Modified_Time, Edited_By, stage, bank_name, created_by, assigned_to, Status, Priority, Handled_By, 
              Action_Log, Level
        FROM RFP_FunctionalItem_draft
        WHERE RFP_No = ? 
        `;
      } else if(actionName==="Final RFP"){
        queryString2 = `
        SELECT requirement AS name, RFP_Title, RFP_No, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, 
              deleted, Modified_Time, Edited_By, stage, bank_name, created_by, assigned_to, Status, Priority, Handled_By, 
              Action_Log, Level
        FROM RFP_FunctionalItem_draft
        WHERE RFP_No = ? AND Level >= 4
        ORDER BY Level ASC
        `;
        // LIMIT 1`;
      } else if(actionName==="Submitted RFP"){
        queryString2 = `
        SELECT 
          d.id AS RFP_functionalitem_DraftId,
          d.requirement AS name, 
          d.RFP_Title, 
          d.RFP_No, 
          d.Module_Code, 
          d.F1_Code, 
          d.F2_Code, 
          d.New_Code, 
          d.Mandatory, 
          d.Comments, 
          d.deleted, 
          d.Modified_Time, 
          d.Edited_By, 
          d.stage, 
          d.bank_name, 
          d.created_by, 
          d.assigned_to, 
          d.Status, 
          d.Priority, 
          d.Handled_By, 
          d.Action_Log, 
          d.Level,
          v.Vendor_Id,
          v.A,
          v.P,
          v.C,
          v.N,
          v.Remarks,
          v.Attach,
          v.stage AS vendor_stage,
          v.created_by AS vendor_created_by,
          v.Level AS vendor_level,
          v.Assigned_To AS vendor_assigned_to,
          v.Status AS vendor_status,
          v.Priority AS vendor_priority,
          v.Handled_By AS vendor_handled_by,
          v.Action_Log AS vendor_action_log
      FROM RFP_FunctionalItem_draft d
      LEFT JOIN RFP_FunctionalItem_Vendor v
          ON d.id = v.rfp_functionalitem_draft_id 
          AND v.Status IS NOT NULL  
      WHERE d.RFP_No = ?
      AND  v.Status = "Completed"
      AND v.Vendor_Id = ?`;
      }
      
       [fetchedArray] = await db.query(queryString2, [rfpNo,selectedVendor]);
      console.log(selectedVendor);
      console.log(fetchedArray);
      // and Status ="Bank_Pending_Reviewer"
    } else if (userPower == "Vendor Admin") {
      const [vendorData] = await db.query(
          `SELECT id,rfp_reference_no FROM vendor_admin_users WHERE email = ?`, 
          [userName]
      );
  
      // Check if vendorData exists and extract the ID safely
      if (!vendorData || vendorData.length === 0) {
          throw new Error("Vendor ID not found");
      }
  
      const vendorId = vendorData[0].id; // Extract the actual ID
      rfpNo =vendorData[0].rfp_reference_no;
      // console.log(vendorId, rfpNo);
  
      if(actionName==="Submit RFP"){
      queryString2 = `
      SELECT 
          d.id AS RFP_functionalitem_DraftId,
          d.requirement AS name, 
          d.RFP_Title, 
          d.RFP_No, 
          d.Module_Code, 
          d.F1_Code, 
          d.F2_Code, 
          d.New_Code, 
          d.Mandatory, 
          d.Comments, 
          d.deleted, 
          d.Modified_Time, 
          d.Edited_By, 
          d.stage, 
          d.bank_name, 
          d.created_by, 
          d.assigned_to, 
          d.Status, 
          d.Priority, 
          d.Handled_By, 
          d.Action_Log, 
          d.Level,
          v.Vendor_Id,
          v.A,
          v.P,
          v.C,
          v.N,
          v.Remarks,
          v.Attach,
          v.stage AS vendor_stage,
          v.created_by AS vendor_created_by,
          v.Level AS vendor_level,
          v.Assigned_To AS vendor_assigned_to,
          v.Status AS vendor_status,
          v.Priority AS vendor_priority,
          v.Handled_By AS vendor_handled_by,
          v.Action_Log AS vendor_action_log
      FROM RFP_FunctionalItem_draft d
      LEFT JOIN RFP_FunctionalItem_Vendor v
          ON d.id = v.rfp_functionalitem_draft_id 
          AND v.Status IS NOT NULL  
      WHERE d.RFP_No = ?
      AND (v.Status = "Vendor_Pending_Reviewer" OR v.Status = "Completed" OR v.Status = "Vendor_Pending_Admin")
      AND v.Vendor_Id = ?`;
      } else if(actionName==="View RFP"){
        console.log("View RFP is")
        queryString2 = `
      SELECT 
          d.id AS RFP_functionalitem_DraftId,
          d.requirement AS name, 
          d.RFP_Title, 
          d.RFP_No, 
          d.Module_Code, 
          d.F1_Code, 
          d.F2_Code, 
          d.New_Code, 
          d.Mandatory, 
          d.Comments, 
          d.deleted, 
          d.Modified_Time, 
          d.Edited_By, 
          d.stage, 
          d.bank_name, 
          d.created_by, 
          d.assigned_to, 
          d.Status, 
          d.Priority, 
          d.Handled_By, 
          d.Action_Log, 
          d.Level,
          v.Vendor_Id,
          v.A,
          v.P,
          v.C,
          v.N,
          v.Remarks,
          v.Attach,
          v.stage AS vendor_stage,
          v.created_by AS vendor_created_by,
          v.Level AS vendor_level,
          v.Assigned_To AS vendor_assigned_to,
          v.Status AS vendor_status,
          v.Priority AS vendor_priority,
          v.Handled_By AS vendor_handled_by,
          v.Action_Log AS vendor_action_log
      FROM RFP_FunctionalItem_draft d
      LEFT JOIN RFP_FunctionalItem_Vendor v
          ON d.id = v.rfp_functionalitem_draft_id 
          AND v.Status IS NOT NULL  
      WHERE d.RFP_No = ?
      AND (v.Status = "Vendor_Pending_Reviewer" OR v.Status = "Completed" OR 
      v.Status = "Vendor_Pending_Authorization" OR v.Status = "Vendor_Pending_Maker")
      AND v.Vendor_Id = ?`;
      } 
      // Execute the query with the correct parameter
       [fetchedArray] = await db.query(queryString2, [rfpNo, vendorId]);
      // console.log(fetchedArray);
      console.log("fetchedArray");
  }
  const [l1Rows] = await db.query('SELECT * FROM RFP_Saved_L1_Modules WHERE RFP_No = ?', [rfpNo]);
   
   
    // if(userPower=="Super Admin"){
    //   [fetchedArray]  = await db.query(queryString2, [rfpNo]);
    // } else if(userPower=="Vendor Admin"){
    // [fetchedArray]  = await db.query(queryString2, [rfpNo,vendor_Id[0].id]);
    // console.log(fetchedArray)
    // }
    
    // Step 3: Iterate over each L1 record and build the nested structure for L2 and L3
    const modules = await Promise.all(l1Rows.map(async (l1Item) => {
      const { L1_Code, L1_Module_Description } = l1Item;

      // Fetch related L2 modules for the current L1 module and specified RFP_No
      const [l2Rows] = await db.query('SELECT * FROM RFP_Saved_L2_Modules WHERE RFP_No = ? AND L2_Code LIKE ?', [rfpNo, `${L1_Code}%`]);

      // For each L2, fetch related L3 modules and build L2-L3 structure
      const l2Modules = await Promise.all(l2Rows.map(async (l2Item) => {
        const { L2_Code, L2_Module_Description } = l2Item;

        // Fetch related L3 modules for the current L2 module and specified RFP_No
        const [l3Rows] = await db.query('SELECT * FROM RFP_Saved_L3_Modules WHERE RFP_No = ? and L3_Code LIKE ?', [rfpNo,`${L2_Code}%`]);

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
    const data = { l1: [], rfp_no, Name: userDetails[0].user_name };
    let combined = [];
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
          SELECT Requirement AS name, Module_Code, F1_Code, F2_Code, New_Code, Mandatory AS Mandatory, Comments, deleted 
          FROM rfp_functionalitem_draft 
          WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')})
        `;
          }

          const [f1Result] = await db.query(queryString2, combinedArray);

          const updatedF1Result = f1Result.map(item => ({
            ...item,
            Mandatory: item.Mandatory ?? true, // Set default if `Mandatory` is null
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
      `SELECT Requirement AS name, Module_Code, F1_Code, F2_Code, New_Code, Mandatory AS Mandatory, Comments, deleted 
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
//           Mandatory: true,  // Set the desired value for newKey1
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
    console.log("loadContents-initial");
    const { userName, userPower, userRole } = req.query;// Destructure checkedItems from request body
    var fItems = [];
    let qustring;
    if (userRole == "Maker") {
      qustring = "is_maker=1"
    } else if (userRole == "Authorizer") {
      qustring = "is_authorizer=1"
    } else if (userRole == "Reviewer") {
      qustring = "is_reviewer=1"
    }
    console.log(qustring)
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
          WHERE user_name = ? AND createdby = ? and is_active='1' and ${qustring}`,
        [userDetails[0].user_name, userDetails[0].createdby]
      );
      //console.log("User Modules Assignment:", result);
      // console.log(result)
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
          WHERE user_name = ? AND createdby = ? and is_active='1' and ${qustring}`,
        [userDetails[0].user_name, userDetails[0].createdby]
      );
      console.log("Vendor User Modules Assignment:", result);

    } else if (userPower == "Super Admin") {
     
    }

    // //console.log("User Details:", userDetails);


    console.log(result.length)
    console.log("result")
    // const { module_name } = result[0];
    const { rfp_no } = result[0];
    // //console.log(rfp_no)
    //console.log(module_name)
    //console.log(l1)
    //console.log("result1:  "+result1);

    // Initialize an object to hold the nested structure
    const data = { l1: [], rfp_no, Name: userDetails[0].user_name };
    let combinedModule = [];
    let combinedArray=[];
    let combinedData = [];
    let updatedF1Result=[];
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

             combinedArray = unmatchedL2Codes.concat(l3CodesArray);

            let queryString2;
            let values2 = [...combinedArray, res.rfp_no]; // Include rfp_no for binding
            let results2 = [];
            let unmatchedModuleCodes = [];
            let finalResults = [];
            // Query 1: Fetch data for "User"
            if (userPower === "User" ) {

              if(userRole=="Maker"){

                // Product Filter Code
                let prod = `select products from RFP_Creation where RFP_No=?`
                let [products] = await db.query(prod,res.rfp_no);
                let prodCode = products[0].products.map(item => item.subItemCode);
                console.log("prodCode");
                // prodCode.push(null)
                console.log(prodCode);
                
                queryString2 = `
                    SELECT requirement AS name, RFP_Title, RFP_No, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, 
                           deleted, Modified_Time, Edited_By, stage, bank_name, created_by, assigned_to, Status, Priority, Handled_By, 
                           Action_Log, Level
                    FROM RFP_FunctionalItem_draft
                    WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')}) 
                    AND RFP_No = ? 
                `;
                // console.log(queryString2);
                // console.log(z);
                // z++
                // Execute first query
                [results2] = await db.query(queryString2, values2);
                // console.log(results2)
                // console.log(values2)
                // console.log(results2.length)
                // Extract matched Module_Codes
                const matchedModuleCodes = results2.map(row => row.Module_Code);
            
                // Identify unmatched codes by filtering combinedArray
                unmatchedModuleCodes = combinedArray.filter(code => !matchedModuleCodes.includes(code));
            
            // Query 2: Fetch unmatched values only if necessary
            if (unmatchedModuleCodes.length > 0 || results2.length==0) {
                const queryString3 = `
                    SELECT Description AS name, Module_Code, F1_Code, F2_Code 
                    FROM RFP_FunctionalItems 
                    WHERE Module_Code IN (${unmatchedModuleCodes.map(() => '?').join(', ')}) AND F1_Code!="00"
                    
                `;
                // And (Product IN (${prodCode.join(', ')}) OR Product IS NULL)
                console.log(queryString3)
                // Execute second query
                const [results3] = await db.query(queryString3, unmatchedModuleCodes);
                console.log("Unmatched Results from RFP_FunctionalItems:", results3);
                const results4 = results3.map(item => ({
                  ...item,
                  Mandatory: item.Mandatory ?? true, // Set default if `Mandatory` is null
                  deleted: item.deleted ?? false, // Set default if `deleted` is null
                }));
                // Combine the second result set with the first
                  finalResults = [...results2, ...results4];
                  
            } else {
                console.log("All Module_Codes were matched in the first query.");
                finalResults = [...results2];
            }
            combinedData = [...combinedData,...finalResults]
              } else if(userRole=="Authorizer"){
                queryString2 = `
                SELECT requirement AS name, RFP_Title, RFP_No, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, 
                       deleted, Modified_Time, Edited_By, stage, bank_name, created_by, assigned_to, Status, Priority, Handled_By, 
                       Action_Log, Level
                FROM RFP_FunctionalItem_draft
                WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')}) 
                AND RFP_No = ? and (Status ="Bank_Pending_Authorization" OR Level >=2)
                
            `;
            //and Status ="Bank_Pending_Authorization" and level='2'
             // Execute first query
            [results2] = await db.query(queryString2, values2);
            // console.log(results2)
        
            combinedData = [...combinedData,...results2]
            } else if(userRole=="Reviewer"){
              queryString2 = `
              SELECT requirement AS name, RFP_Title, RFP_No, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, 
                     deleted, Modified_Time, Edited_By, stage, bank_name, created_by, assigned_to, Status, Priority, Handled_By, 
                     Action_Log, Level
              FROM RFP_FunctionalItem_draft
              WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')}) 
              AND RFP_No = ? and (Status ="Bank_Pending_Reviewer" OR Level >=3)
          `;
           // Execute first query
          [results2] = await db.query(queryString2, values2);
          // console.log(results2)
      
          combinedData = [...combinedData,...results2]
          } 
                
          }else if (userPower === "Vendor User" || userPower === "Vendor Admin") {
             // Fetch created_by from vendor_users_table
             let createdby =[];
             let vendor_Id =[];
             if(userPower === "Vendor User"){
               [createdby] = await db.query(`
                SELECT createdby FROM vendor_users_table WHERE email = ?`, [userName]);
              console.log(createdby[0].createdby);
    
              // Fetch vendor_Id based on rfp_no and createdby
               [vendor_Id] = await db.query(`
                SELECT id FROM vendor_admin_users WHERE rfp_reference_no = ? AND email = ?`, 
                [rfp_no, createdby[0].createdby]);
                console.log(vendor_Id[0].id);
    
             } else if(userPower === "Vendor Admin"){
              [vendor_Id] = await db.query(`
                SELECT id FROM vendor_admin_users WHERE rfp_reference_no = ? AND email = ?`, 
                [rfp_no, userName]);
                console.log(vendor_Id[0].id);
             }
         
          //   queryString2 = `
          // SELECT Requirement AS name, Module_Code, F1_Code, F2_Code, New_Code, Mandatory AS Mandatory, Comments, deleted 
          // FROM rfp_functionalitem_draft 
          // WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')})
        // `;
        if(userRole=="Maker"){
      //     queryString2 = `
      //     SELECT requirement AS name, RFP_Title, RFP_No, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, 
      //            deleted, Modified_Time, Edited_By, stage, bank_name, created_by, assigned_to, Status, Priority, Handled_By, 
      //            Action_Log, Level
      //     FROM RFP_FunctionalItem_Vendor
      //     WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')}) 
      //     AND RFP_No = ? and Status ="Vendor_Pending_Maker" and Vendor_Id= ? and Bank_Id=?
      // `;
  //     const queryString3 = `
  //     SELECT requirement AS name, RFP_Title, RFP_No, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, 
  //            deleted, Modified_Time, Edited_By, stage, bank_name, created_by, assigned_to, Status, Priority, Handled_By, 
  //            Action_Log, Level
  //     FROM RFP_FunctionalItem_draft
  //     WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')}) 
  //     AND RFP_No = ? and Status ="Vendor_Pending_Maker"
  // `;
  const queryString2 = `
  SELECT 
    d.id AS RFP_functionalitem_DraftId,
    d.requirement AS name, 
    d.RFP_Title, 
    d.RFP_No, 
    d.Module_Code, 
    d.F1_Code, 
    d.F2_Code, 
    d.New_Code, 
    d.Mandatory, 
    d.Comments, 
    d.deleted, 
    d.Modified_Time, 
    d.Edited_By, 
    d.stage, 
    d.bank_name, 
    d.created_by, 
    d.assigned_to, 
    d.Status, 
    d.Priority, 
    d.Handled_By, 
    d.Action_Log, 
    d.Level,
    v.Vendor_Id,
    v.A,
    v.P,
    v.C,
    v.N,
    v.Remarks,
    v.Attach,
    v.stage AS vendor_stage,
    v.created_by AS vendor_created_by,
    v.Level AS vendor_level,
    v.Assigned_To AS vendor_assigned_to,
    v.Status AS vendor_status,
    v.Priority AS vendor_priority,
    v.Handled_By AS vendor_handled_by,
    v.Action_Log AS vendor_action_log
  FROM RFP_FunctionalItem_draft d
  LEFT JOIN RFP_FunctionalItem_Vendor v
    ON d.id = v.rfp_functionalitem_draft_id 
       AND v.Status IS NOT NULL  -- Place right table conditions here
  WHERE d.Module_Code IN (${combinedArray.map(() => '?').join(', ')})
    AND d.RFP_No = ?   
  `;
// And v.Vendor_Id= ? And  v.Status ="Vendor_Pending_Maker"
    const [results2] = await db.query(queryString2, [...values2,vendor_Id[0].id]);
    // const [results3] = await db.query(queryString3, values2);
    
      console.log(values2)
      console.log(results2)
      console.log("results2")
      // console.log(results3)
  
      combinedData = [...combinedData,...results2]
      } else if(userRole=="Authorizer"){
        // queryString2 = `
        // SELECT requirement AS name, RFP_Title, RFP_No, Module_Code, F1_Code, F2_Code, New_Code, Mandatory, Comments, 
        //        deleted, Modified_Time, Edited_By, stage, bank_name, created_by, assigned_to, Status, Priority, Handled_By, 
        //        Action_Log, Level
        // FROM RFP_FunctionalItem_Vendor
        // WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')}) 
        // AND RFP_No = ? and Status ="Vendor_Pending_Authorization" and Vendor_Id= ? and Bank_Id=?
        // `;
        const queryString2 = `
        SELECT 
          d.id AS RFP_functionalitem_DraftId,
          d.requirement AS name, 
          d.RFP_Title, 
          d.RFP_No, 
          d.Module_Code, 
          d.F1_Code, 
          d.F2_Code, 
          d.New_Code, 
          d.Mandatory, 
          d.Comments, 
          d.deleted, 
          d.Modified_Time, 
          d.Edited_By, 
          d.stage, 
          d.bank_name, 
          d.created_by, 
          d.assigned_to, 
          d.Status, 
          d.Priority, 
          d.Handled_By, 
          d.Action_Log, 
          d.Level,
          v.Vendor_Id,
          v.A,
          v.P,
          v.C,
          v.N,
          v.Remarks,
          v.Attach,
          v.stage AS vendor_stage,
          v.created_by AS vendor_created_by,
          v.Level AS vendor_level,
          v.Assigned_To AS vendor_assigned_to,
          v.Status AS vendor_status,
          v.Priority AS vendor_priority,
          v.Handled_By AS vendor_handled_by,
          v.Action_Log AS vendor_action_log
        FROM RFP_FunctionalItem_draft d
        LEFT JOIN RFP_FunctionalItem_Vendor v
          ON d.id = v.rfp_functionalitem_draft_id 
             AND v.Status IS NOT NULL  -- Place right table conditions here
        WHERE d.Module_Code IN (${combinedArray.map(() => '?').join(', ')})
          AND d.RFP_No = ? And v.Vendor_Id= ?
        and (v.Status ="Vendor_Pending_Authorization" OR v.Level >=6 OR  v.Level=4)
      `;
       // Execute first query
      [results2] = await db.query(queryString2, [...values2,vendor_Id[0].id]);
      // console.log(results2)
  
      combinedData = [...combinedData,...results2]
      } else if(userRole=="Reviewer" || userPower === "Vendor Admin"){   
        const queryString2 = `
        SELECT 
          d.id AS RFP_functionalitem_DraftId,
          d.requirement AS name, 
          d.RFP_Title, 
          d.RFP_No, 
          d.Module_Code, 
          d.F1_Code, 
          d.F2_Code, 
          d.New_Code, 
          d.Mandatory, 
          d.Comments, 
          d.deleted, 
          d.Modified_Time, 
          d.Edited_By, 
          d.stage, 
          d.bank_name, 
          d.created_by, 
          d.assigned_to, 
          d.Status, 
          d.Priority, 
          d.Handled_By, 
          d.Action_Log, 
          d.Level,
          v.Vendor_Id,
          v.A,
          v.P,
          v.C,
          v.N,
          v.Remarks,
          v.Attach,
          v.stage AS vendor_stage,
          v.created_by AS vendor_created_by,
          v.Level AS vendor_level,
          v.Assigned_To AS vendor_assigned_to,
          v.Status AS vendor_status,
          v.Priority AS vendor_priority,
          v.Handled_By AS vendor_handled_by,
          v.Action_Log AS vendor_action_log
        FROM RFP_FunctionalItem_draft d
        LEFT JOIN RFP_FunctionalItem_Vendor v
          ON d.id = v.rfp_functionalitem_draft_id 
            AND v.Status IS NOT NULL  -- Place right table conditions here
        WHERE d.Module_Code IN (${combinedArray.map(() => '?').join(', ')})
          AND d.RFP_No = ?
        and v.vendor_Id=? and
         (v.Status ="Vendor_Pending_Reviewer"  OR v.Level >=7 OR  v.Level=4)
        `;
     // Execute first query
    [results2] = await db.query(queryString2, [...values2,vendor_Id[0].id]);
    // console.log(results2)

    combinedData = [...combinedData,...results2]
    }  }
          console.log("combinedData");
          console.log(combinedData.length);
          console.log("combinedData");
          // const [f1Result] = await db.query(queryString2, combinedArray);
          
        }
       
        // Push the processed `l2` with `l3` to `l1`
        // data.l1.push({ name: l1.moduleName, code: l1.code, l2: l2Codes });
        combinedModule.push({ name: l1.moduleName, code: l1.code, l2: l2Codes });
      }
      data.l1.push(combinedModule);
      combinedModule=[];
      updatedF1Result = combinedData.map(item => ({
        ...item,
        Mandatory: item.Mandatory ?? true, // Set default if `Mandatory` is null
        deleted: item.deleted ?? false, // Set default if `deleted` is null
      }));
      // fItems.push(...updatedF1Result);
      fItems.push(updatedF1Result);
      combinedData=[];
      // combined.push({data,rfp_no})
    }
    // console.log(combined)
    // Finalize response
    if (data.l1.length > 0) {
      res.json({ success: true, itemDetails: data, functionalItemDetails: fItems,
        entityName:userDetails[0].entity_Name });
    } else {
      res.status(404).json({ error: "No sub-items found for these modules" });
    }

  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send('Internal Server Error'); // Handle errors
  }
});
router.get('/loadContents-saved', async (req, res) => {
  try {
    console.log("loadContents-saved")
    const { userName, userPower, userRole } = req.query;// Destructure checkedItems from request body
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
      // console.log("User Modules Assignment:", result);

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


    // console.log(result)
    console.log("result")
    // const { module_name } = result[0];
    const { rfp_no } = result[0];
    // //console.log(rfp_no)
    //console.log(module_name)
    //console.log(l1)
    //console.log("result1:  "+result1);

    // Initialize an object to hold the nested structure
    const data = { l1: [], rfp_no, Name: userDetails[0].user_name };
    let combined = [];
    for (const res of result) { // Iterate through all entries in `result`
      // const { rfp_no } = res;
      for (const l1 of res.module_name) { // Process each `l1` (module_name)
        const l2Codes = l1.l2module || [];

        if (l2Codes.length > 0) {
          const l2CodesArray = l2Codes.map(l2 => l2.code);
          const placeholders1 = l2CodesArray.map(() => `L3_Code LIKE CONCAT(?, '%')`).join(" OR ");
          const queryString1 = `SELECT L3_Module_Description AS name, L3_Code, Stage, Level FROM RFP_Saved_L3_Modules WHERE ${placeholders1}`;

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
          SELECT Requirement AS name, Module_Code, F1_Code, F2_Code, New_Code, Mandatory AS Mandatory, 
         Comments, deleted, Stage, Level
          FROM rfp_functionalitem_draft 
          WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')}) 
                AND Stage = ? 
                AND Level = "Bank"
        `;
          } else if (userPower === "Vendor User") {
            queryString2 = `
         SELECT Requirement AS name, Module_Code, F1_Code, F2_Code, New_Code, Mandatory AS Mandatory, 
         Comments, deleted, Stage, Level
          FROM rfp_functionalitem_draft 
          WHERE Module_Code IN (${combinedArray.map(() => '?').join(', ')}) 
                AND Stage = ? 
                AND Level ="Vendor"
        `;
          }

          const parameters = [...combinedArray, userRole]; // Include combinedArray and userRole as parameters

          const [f1Result] = await db.query(queryString2, parameters);
          const updatedF1Result = f1Result.map(item => ({
            ...item,
            // Mandatory: item.Mandatory ?? true, // Set default if `Mandatory` is null
            // deleted: item.deleted ?? false, // Set default if `deleted` is null
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
      res.json({ success: true, itemDetails: data, functionalItemDetails: fItems, entityName:userDetails[0].entity_Name });
    } else {
      res.status(404).json({ error: "No sub-items found for these modules" });
    }

  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send('Internal Server Error'); // Handle errors
  }
});
// router.get('/loadContents-superAdmin', async (req, res) => {
//   try {
//       const { userPower, userName } = req.query;
//       let userDetails, result, result1, fetchedArray = [];

//       const rfpNo = "RFP123"; // Assuming static RFP number, modify if needed

//       if (userPower === "Super Admin") {
//           [userDetails] = await db.query(
//               `SELECT super_user_name, entity_Name FROM superadmin_users WHERE super_user_email = ?`,
//               [userName]
//           );
//           if (!userDetails) throw new Error("User not found.");

//           [result] = await db.query(
//               `SELECT * FROM User_Modules_Assignment WHERE createdby = ?`,
//               [userName]
//           );

//           [result1] = await db.query(
//               `SELECT * FROM rfp_creation WHERE email=?`, [userName]
//           );

//           fetchedArray = await db.query(
//               `SELECT * FROM RFP_FunctionalItem_draft WHERE RFP_No = ?`,
//               [rfpNo]
//           );

//       } else if (userPower === "Vendor Admin") {
//           [userDetails] = await db.query(
//               `SELECT rfp_reference_no, entity_Name, admin_name, createdby FROM vendor_admin_users WHERE email = ?`,
//               [userName]
//           );
//           if (!userDetails) throw new Error("User not found.");

//           [result] = await db.query(
//               `SELECT * FROM VendorUser_Modules_Assignment WHERE createdby = ?`,
//               [userName]
//           );

//           const [vendorData] = await db.query(
//               `SELECT id FROM vendor_admin_users WHERE rfp_reference_no = ? AND email = ?`,
//               [rfpNo, userName]
//           );

//           if (!vendorData || vendorData.length === 0) throw new Error("Vendor ID not found");

//           fetchedArray = await db.query(
//               `SELECT * FROM RFP_FunctionalItem_Vendor WHERE RFP_No = ? AND Vendor_Id = ?`,
//               [rfpNo, vendorData[0].id]
//           );
//       }

//       // Combine data for both user types
//       const combinedData = {
//           userDetails,
//           modules: result,
//           rfps: result1,
//           functionalItems: fetchedArray
//       };

//       res.json({ success: true, data: combinedData });

//   } catch (error) {
//       console.error('Error fetching combined data:', error);
//       res.status(500).send('Internal Server Error');
//   }
// });

router.get('/loadContents-superAdmin', async (req, res) => {
  try {
    console.log("loadContents-superAdmin")
    const { userName, userPower, userRole } = req.query;// Destructure checkedItems from request body

    // //console.log(userName);
    // //console.log(userPower);
    // Test the first query
    let userDetails;
    let result;
    let result1;
    if (userPower == "Super Admin") {
      [userDetails] = await db.query(
        `SELECT super_user_name, entity_Name FROM superadmin_users WHERE super_user_email = ?`,
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
   WHERE createdby = ?`,
        [userName]
      );
      [result1] = await db.query(`select * from rfp_creation where email=?`, [userName]);
      // console.log("User Modules Assignment:", result);

    } else if (userPower == "Vendor Admin") {
      [userDetails] = await db.query(
        `SELECT rfp_reference_no, entity_Name, admin_name, createdby FROM vendor_admin_users WHERE email = ?`,
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
   WHERE createdby = ? `,
        [userName]
      );
      //console.log("Vendor User Modules Assignment:", result);
      [result1] = await db.query(`select * from rfp_creation where email=?`, [userDetails[0].createdby]);
    }
    const data = { l1: [], Name: userDetails[0].admin_name };
    let combined = [];
    for (const res of result) { // Iterate through all entries in `result`
      // const { rfp_no } = res;
      for (const l1 of res.module_name) { // Process each `l1` (module_name)
        const l2Codes = l1.l2module || [];

        if (l2Codes.length > 0) {
          const l2CodesArray = l2Codes.map(l2 => l2.code);
          const placeholders1 = l2CodesArray.map(() => `L3_Code LIKE CONCAT(?, '%')`).join(" OR ");
          const queryString1 = `SELECT L3_Module_Description AS name, L3_Code, Stage, Level FROM RFP_Saved_L3_Modules WHERE ${placeholders1}`;

          const [l3Result] = await db.query(queryString1, l2CodesArray);
          const l3CodesArray = l3Result.map(l3 => l3.L3_Code);

          // Populate `l3` for each `l2`
          for (const l2 of l2Codes) {
            l2.l3 = l3Result
              .filter(row => row.L3_Code.startsWith(l2.code))
              .map(row => ({ name: row.name, code: row.L3_Code }));
          }
        }

        // Push the processed `l2` with `l3` to `l1`
        data.l1.push({ name: l1.moduleName, code: l1.code, l2: l2Codes });
      }
      // combined.push({data,rfp_no})
    }
    console.log("result")
    console.log(result1)
    // Finalize response
    if (result1.length > 0) {
      // res.json({ success: true, rfps: result1, itemDetails: data , entityName:userDetails[0].entity_Name});
      res.json({ success: true, rfps: result1, entityName:userDetails[0].entity_Name});
    } else {
      res.status(404).json({ error: "No sub-items found for these modules" });
    }

  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send('Internal Server Error'); // Handle errors
  }
});

// sidebar Loads when Login
router.get('/userItemsinSidebar', async (req, res) => {
  console.log("userItemsinSidebar");
  try {
    //console.log("in sidebar")
    const userName = req.query.userName;// Destructure checkedItems from request body
    const userPower = req.query.userPower;// Destructure checkedItems from request body
    const userRole = req.query.userRole;// Destructure checkedItems from request body
    // console.log("userRole :"+userRole);
    let qustring;
    if (userRole == "Maker") {
      qustring = "is_maker=1"
    } else if (userRole == "Authorizer") {
      qustring = "is_authorizer=1"
    } else if (userRole == "Reviewer") {
      qustring = "is_reviewer=1"
    }
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
     WHERE user_name = ? AND createdby = ? and is_active='1' and ${qustring} `,
        [userDetails[0].user_name, userDetails[0].createdby]
      );
      //console.log("User Modules Assignment:", result);
      for (i = 0; i < result.length; i++) {
        const { module_name } = result[i];
        const { rfp_no } = result[i];
        const [rfp_title] = await db.query(
          `select rfp_title from RFP_Creation where rfp_no=?`, [rfp_no]);
        //console.log(rfp_title)                  

        data.push({ module_name, rfp_no, rfp_title: rfp_title[0].rfp_title, entity_name: userDetails[0].entity_Name })
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
     WHERE user_name = ? AND createdby = ? and is_active='1' `,
        [userDetails[0].user_name, userDetails[0].createdby]
      );
      //console.log("User Modules Assignment:", result);
      for (i = 0; i < result.length; i++) {
        const { module_name } = result[i];
        const { rfp_no } = result[i];
        const [rfp_title] = await db.query(
          `select rfp_title from RFP_Creation where rfp_no=?`, [rfp_no]);
        //console.log(rfp_title)                  

        data.push({ module_name, rfp_no, rfp_title: rfp_title[0].rfp_title, entity_name: userDetails[0].entity_Name })
        //console.log(data)
      }

    } else if (userPower == "Super Admin") {

    } else if (userPower == "Vendor Admin"){

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

//vendorQuery Saving
router.post('/vendorQuery-save-draft', async (req, res) => {
  console.log("vendorQuery-save-draft initiated.");
  const { 
      rfp_no, 
      rfp_title, 
      bank_name, 
      vendor_name, 
      created_by, 
      level, 
      Comments, 
      Priority, 
      Handled_by, 
      Action_log, 
      rows, 
      Status, 
      Stage 
  } = req.body;

  // Basic validation for critical fields
  if (!rfp_no || !rfp_title || !created_by) {
      return res.status(400).send({ message: 'Missing required fields: rfp_no, rfp_title, created_by' });
  }

  try {
      const query = `
      INSERT INTO VendorQuery 
      (rfp_no, rfp_title, bank_name, vendor_name, created_by, level, Comments, Priority, 
       Handled_by, Action_log, rows_data, Status, Stage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
          rfp_title = VALUES(rfp_title),
          bank_name = VALUES(bank_name),
          vendor_name = VALUES(vendor_name),
          level = VALUES(level),
          Comments = VALUES(Comments),
          Priority = VALUES(Priority),
          Handled_by = VALUES(Handled_by),
          Action_log = VALUES(Action_log),
          rows_data = VALUES(rows_data),
          Status = VALUES(Status),
          Stage = VALUES(Stage),
          updated_at = CURRENT_TIMESTAMP;
      `;

      await db.execute(query, [
          rfp_no,
          rfp_title,
          bank_name || null,
          vendor_name || null,
          created_by,
          level || 1,
          Comments || "",
          Priority || "Medium",
          JSON.stringify(Handled_by || []),
          Action_log || "",
          JSON.stringify(rows || []),
          Status || "Draft",
          Stage || "Initiated"
      ]);

      res.status(200).send({ message: 'Draft saved or updated successfully!' });
  } catch (error) {
      console.error('Error saving draft:', error);
      res.status(500).send({ message: 'Error saving draft. Please try again later.' });
  }
});

// router.post('/vendorQuery-action', async (req, res) => {
//   console.log("vendorQuery-action");

//   const {
//     rfpNo,
//     rfpTitle,
//     vendorName,
//     bankName,
//     createdBy,
//     stage,
//     rows,
//     level,
//     stageNumber,
//     action,
//     comments,
//     priority,
//     attachments,
//     handledBy,
//     assignedTo,
//     actionLog,
//   } = req.body;

//   try {
//     // Determine SQL based on action
//     let query;
//     let values;

//     if (action === "Save as Draft") {
//       query = `
//         INSERT INTO VendorQuery (rfp_no, rfp_title, vendor_name, bank_name, created_by, stage, rows_data, level, StageNumber, comments, priority, attachments, handled_by, action_log)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         ON DUPLICATE KEY UPDATE
//           rfp_title = VALUES(rfp_title),
//           stage = VALUES(stage),
//           rows_data = VALUES(rows_data),
//           level = VALUES(level),
//           StageNumber = VALUES(StageNumber),
//           comments = VALUES(comments),
//           priority = VALUES(priority),
//           attachments = VALUES(attachments),
//           handled_by = VALUES(handled_by),
//           action_log = VALUES(action_log),
//           updated_at = CURRENT_TIMESTAMP;
//       `;
//       values = [
//         rfpNo,
//         rfpTitle,
//         vendorName,
//         bankName,
//         createdBy,
//         "Draft",
//         JSON.stringify(rows),
//         level,
//         stageNumber,
//         comments || "",
//         priority || "Medium",
//         attachments || null,
//         JSON.stringify(handledBy || []),
//         actionLog || "",
//       ];
//     } else if (action === "Submit") {
//       query = `
//         UPDATE VendorQuery
//         SET
//           stage = ?,
//           rows_data = ?,
//           level = ?,
//           StageNumber = ?,
//           comments = ?,
//           priority = ?,
//           attachments = ?,
//           handled_by = ?,
//           action_log = ?,
//           status = 'Pending_Authorization',
//           assigned_to = ?
//         WHERE rfp_no = ?;
//       `;
//       values = [
//         stage || "Vendor",
//         JSON.stringify(rows),
//         level,
//         stageNumber,
//         comments || "",
//         priority || "Medium",
//         attachments || null,
//         JSON.stringify(handledBy || []),
//         actionLog || "",
//         assignedTo || null,
//         rfpNo,
//       ];
//     } else if (action === "Approve") {
//       query = `
//         UPDATE VendorQuery
//         SET
//           stage = ?,
//           comments = ?,
//           priority = ?,
//           handled_by = ?,
//           action_log = ?,
//           status = 'Approved',
//           updated_at = CURRENT_TIMESTAMP
//         WHERE rfp_no = ?;
//       `;
//       values = [
//         stage || "Approved",
//         comments || "",
//         priority || "Medium",
//         JSON.stringify(handledBy || []),
//         actionLog || "",
//         rfpNo,
//       ];
//     } else if (action === "Reject") {
//       query = `
//         UPDATE VendorQuery
//         SET
//           stage = 'Rejected',
//           comments = ?,
//           action_log = ?,
//           status = 'Rejected',
//           updated_at = CURRENT_TIMESTAMP
//         WHERE rfp_no = ?;
//       `;
//       values = [
//         comments || "Rejected by user",
//         actionLog || "",
//         rfpNo,
//       ];
//     } else {
//       return res.status(400).send({ message: "Invalid action type" });
//     }

//     // Execute SQL query
//     await db.execute(query, values);
//     res.status(200).send({ message: `${action} action processed successfully!` });
//   } catch (error) {
//     console.error(`Error processing ${action} action:`, error);
//     res.status(500).send({ message: `Failed to process ${action} action` });
//   }
// });
router.post('/vendorQuery-save', async (req, res) => {
  console.log("vendorQuery-save")
  const {
    rfpNo,
    rfpTitle,
    vendorName,
    bankName,
    createdBy,
    stage,
    rows,
    level,
    stageNumber,
    comments,
    priority,
    attachments,
    handledBy,
    actionLog,
  } = req.body;

  try {
    const query = `
      INSERT INTO VendorQuery (rfp_no, rfp_title, vendor_name, bank_name, created_by, stage, rows_data, level, StageNumber, comments, priority, attachments, handled_by, action_log, visibility_scope)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rfp_title = VALUES(rfp_title),
        stage = VALUES(stage),
        rows_data = VALUES(rows_data),
        level = VALUES(level),
        StageNumber = VALUES(StageNumber),
        comments = VALUES(comments),
        priority = VALUES(priority),
        attachments = VALUES(attachments),
        handled_by = VALUES(handled_by),
        action_log = VALUES(action_log),
        visibility_scope = VALUES(visibility_scope),
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
      level,
      stageNumber,
      comments || "",
      priority || "Medium",
      attachments || null,
      JSON.stringify(handledBy || []),
      actionLog || "",
      "PRIVATE", // Default visibility for individual users
    ]);

    res.status(200).send({ message: 'Query saved successfully!' });
  } catch (error) {
    console.error('Error saving query:', error);
    res.status(500).send({ message: 'Failed to save query' });
  }
});
router.get('/vendorQuery-get', async (req, res) => {
  const { userRole, userName,rfpNo, level } = req.query;

  try {
    let query;
    let values;

    if (userRole !== "Maker") {
      // Authorizers see all PUBLIC queries
      query = `
        SELECT * FROM VendorQuery
        WHERE visibility_scope = 'PUBLIC' and rfp_no=? and level=? 
        ORDER BY updated_at DESC;
      `;
      values = [rfpNo,level];
    } else {
      // Other users see only their own PRIVATE queries
      query = `
        SELECT * FROM VendorQuery
        WHERE created_by = ? AND visibility_scope = 'PRIVATE' and rfp_no=? and level=? 
        ORDER BY updated_at DESC;
      `;
      values = [userName,rfpNo,level];
    }

    const [results] = await db.execute(query, values);
    res.status(200).send(results);
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).send({ message: 'Failed to fetch queries' });
  }
});

router.post('/vendorQuery-submit', async (req, res) => {
  const { rfpNo, userRole, actionLog } = req.body;

  if (userRole !== "Maker" ) {
    return res.status(403).send({ message: 'Only Makers can submit queries' });
  }

  try {
    const query = `
      UPDATE VendorQuery
      SET visibility_scope = 'PUBLIC', action_log = CONCAT(action_log, "\n", ?), status = 'Pending_Authorization'
      WHERE rfp_no = ?;
    `;

    await db.execute(query, [`Submitted for authorization on ${new Date().toISOString()}`, rfpNo]);
    res.status(200).send({ message: 'Query submitted successfully!' });
  } catch (error) {
    console.error('Error submitting query:', error);
    res.status(500).send({ message: 'Failed to submit query' });
  }
});


router.post('/vendorQuery-fetch', async (req, res) => {
  console.log("vendorQuery-fetch");
  const { rfpNo, vendorName, userName, userRole,  } = req.body;
  console.log(rfpNo, vendorName, userName ,userRole);

  if (!rfpNo || !vendorName || !userName) {
      return res.status(400).send({ message: "Missing required query parameters." });
  }

  try {
    let query ;
    let rows;
    if(userRole=="Maker"){
       query = `
      SELECT * FROM VendorQuery
      WHERE rfp_no = ? AND vendor_name = ? AND created_by = ?;
      `;
       [rows] = await db.execute(query, [rfpNo, vendorName, userName]);
      
    } else if(userRole=="Authorizer"){
       query = `
      SELECT * FROM VendorQuery
      WHERE rfp_no = ? AND vendor_name = ? AND level = 6 and Status="Vendor_Pending_Authorization";
      `;
       [rows] = await db.execute(query, [rfpNo, vendorName]);
      
    }
       console.log(rows)
    if (rows.length > 0) {
      const result = rows[0];

      // Safely parse rows_data if it is a valid JSON string
      let rowsData;
      try {
        rowsData = typeof result.rows_data === "string"
          ? JSON.parse(result.rows_data)
          : result.rows_data; // Already an object
      } catch (error) {
        console.error("Error parsing rows_data:", error);
        return res.status(500).send({ message: "Error parsing rows_data" });
      }

      res.status(200).send({
        message: "Data fetched successfully!",
        data: {
          rfpTitle: result.rfp_title,
          stage: result.stage,
          createdBy: result.created_by,
          updatedAt: result.updated_at,
          rowsData, // Parsed JSON
        },
      });
    } else {
      res.status(404).send({ message: "No data found for the specified query." });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send({ message: 'Failed to fetch data' });
  }
});
router.post('/vendorQuery-fetch-admin', async (req, res) => {
  console.log("vendorQuery-fetch-admin");
  const { rfpNo, vendorName, bankName, level, userName, userPower, stage } = req.body;
  console.log(rfpNo, userName, level,vendorName,bankName)
  // if (!rfpNo || !vendorName && !bankName) {
  //   return res.status(400).send({ message: "All fields (rfpNo, vendorName, bankName) are required" });
  // }

  try {

    let query1;
    var val;
    if (userPower == "Vendor Admin") {
      query1 = `
      SELECT rows_data, rfp_title, stage, created_by, updated_at 
      FROM VendorQuery
      WHERE rfp_no = ? ;
    `;
      val = [rfpNo]
    } else if (userPower == "Super Admin") {
      query1 = `
      SELECT rows_data, rfp_title, stage, created_by, updated_at 
      FROM VendorQuery
      WHERE rfp_no = ?;
    `;
      val = [rfpNo]
    }

    const [rows1] = await db.execute(query1, val);
    console.log(rows1)
    if (rows1.length > 0) {
      // Combine data from all rows
      const combinedData = rows1.map((result) => {
        let rowsData;
        try {
          rowsData = typeof result.rows_data === "string"
            ? JSON.parse(result.rows_data)
            : result.rows_data; // Parse if JSON string
        } catch (error) {
          console.error("Error parsing rows_data:", error);
          throw new Error("Error parsing rows_data"); // Break loop for JSON error
        }

        return {
          rfpTitle: result.rfp_title,
          stage: result.stage,
          createdBy: result.created_by,
          updatedAt: result.updated_at,
          rowsData, // Parsed JSON
        };
      });

      res.status(200).send({
        message: "Data fetched successfully!",
        data: combinedData, // Array of processed rows
      });
    } else {
      const query = `
      SELECT rows_data, rfp_title, stage, created_by, updated_at 
      FROM VendorQuery
      WHERE rfp_no = ? and stage!="Reviewer" and level ='Vendor';
    `;
      // WHERE rfp_no = ? AND vendor_name = ? AND bank_name = ?;
      const [rows] = await db.execute(query, [rfpNo]);
      console.log(rows);

      if (rows.length > 0) {
        // Combine data from all rows
        const combinedData = rows.map((result) => {
          let rowsData;
          try {
            rowsData = typeof result.rows_data === "string"
              ? JSON.parse(result.rows_data)
              : result.rows_data; // Parse if JSON string
          } catch (error) {
            console.error("Error parsing rows_data:", error);
            throw new Error("Error parsing rows_data"); // Break loop for JSON error
          }

          return {
            rfpTitle: result.rfp_title,
            stage: result.stage,
            createdBy: result.created_by,
            updatedAt: result.updated_at,
            rowsData, // Parsed JSON
          };
        });

        res.status(200).send({
          message: "Data fetched successfully!",
          data: combinedData, // Array of processed rows
        });
      } else {
        res.status(404).send({ message: "No data found for the specified RFP." });
      }
    }


  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send({ message: 'Failed to fetch data' });
  }
});

// Fetch all vendor queries for admin, optionally filtered by rfp_no
router.post('/vendorQuery-fetch-all-rows', async (req, res) => {
  console.log("vendorQuery-fetch-all-rows");

  try {
    const query = `
      SELECT rows_data
      FROM VendorQuery;
    `;

    const [rows] = await db.execute(query);

    // Combine all rows_data
    let combinedRowsData = [];
    rows.forEach(row => {
      if (row.rows_data) {
        try {
          const parsedRows = JSON.parse(row.rows_data); // Parse JSON data
          if (Array.isArray(parsedRows)) {
            combinedRowsData = combinedRowsData.concat(parsedRows); // Combine arrays
          }
        } catch (error) {
          console.error("Error parsing rows_data:", error);
        }
      }
    });

    res.status(200).send({
      message: "Combined data fetched successfully!",
      data: combinedRowsData,
    });
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).send({ message: 'Failed to fetch combined data' });
  }
});






module.exports = router;
