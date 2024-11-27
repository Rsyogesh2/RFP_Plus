
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs')

router.post('/addSuperUser', async (req, res) => {

    const {newUser,assignModule} = req.body;
    console.log(assignModule)
  try {
    const query = `
      INSERT INTO SuperAdmin_Users (
        entity_name, entity_sub_name, entity_landline, entity_address, entity_city, 
        entity_pin_code, entity_country, super_user_name, designation, 
        super_user_email, super_user_mobile, valid_from, valid_to, active_flag
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      newUser.entityName,
      newUser.entitySubName,
      newUser.entityLandline,
      newUser.entityAddress,
      newUser.entityCity,
      newUser.entityPinCode,
      newUser.entityCountry,
      newUser.superUserName,
      newUser.designation,
      newUser.superUserEmail,
      newUser.superUserMobile,
      newUser.validFrom,
      newUser.validTo,
      newUser.activeFlag,
    ]
    console.log('User adding');
    await db.query(query, values);
    console.log('User added successfully');
    const assignedQuery = `INSERT INTO Assingned_Rfp_SuperUser (entity_Name, email, modules) VALUES (?, ?, ?)`;

    assignModule.forEach((module) => {
      db.query(
        assignedQuery,
        [newUser.entityName, newUser.superUserEmail, module],
        (err, result) => {
          if (err) {
            console.error("Error inserting data:", err.message);
          } else {
            console.log(`Module ${module} inserted successfully`);
          }
        }
      );
    });

    
    const password = "system@123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
      
    const query1 = "INSERT INTO Users_Login (Username, Password,Role,Entity_Name) VALUES (?, ?,?, ?)";
    db.query(query1, [newUser.superUserEmail, hashedPassword,"Super Admin",newUser.entityName], (err, results) => {
        if (err) throw err;
        console.log("User created!");
    })    
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.error('Duplicate entry detected:', err.message);
    } else {
      console.error('Error adding user:', err.message);
    }
  } finally {
  }
});
router.put('/updateSuperUser/:id', async (req, res) => {
  const userId = req.params.id;
  const { updatedUser, assignModule } = req.body; // Ensure these are properly structured
  console.log(req.body);

  try {
    const formattedValidFrom = new Date(updatedUser.validFrom).toISOString().slice(0, 10);
    const formattedValidTo = new Date(updatedUser.validTo).toISOString().slice(0, 10);
    

    const query = `
      UPDATE SuperAdmin_Users
      SET 
        entity_name = ?, entity_sub_name = ?, entity_landline = ?, entity_address = ?, 
        entity_city = ?, entity_pin_code = ?, entity_country = ?, super_user_name = ?, 
        designation = ?, super_user_email = ?, super_user_mobile = ?, valid_from = ?, 
        valid_to = ?, active_flag = ?
      WHERE user_id = ?
    `;

    const values = [
      updatedUser.entityName,
      updatedUser.entitySubName,
      updatedUser.entityLandline,
      updatedUser.entityAddress,
      updatedUser.entityCity,
      updatedUser.entityPinCode,
      updatedUser.entityCountry,
      updatedUser.superUserName,
      updatedUser.designation,
      updatedUser.superUserEmail,
      updatedUser.superUserMobile,
      formattedValidFrom,  // Correctly formatted date
      formattedValidTo,    // Correctly formatted date
      updatedUser.activeFlag,
      userId,
  ];
  

    await db.query(query, values);
    console.log('User updated successfully');

    // Clear existing module assignments for this user
    // await db.query(
    //   `DELETE FROM Assingned_Rfp_SuperUser WHERE email = ?`,
    //   [updatedUser.superUserEmail]
    // );

    // // Reassign updated modules
    // const assignedQuery = `INSERT INTO Assingned_Rfp_SuperUser (entity_Name, email, modules) VALUES (?, ?, ?)`;
    // assignModule.forEach((module) => {
    //   db.query(
    //     assignedQuery,
    //     [updatedUser.entityName, updatedUser.superUserEmail, module],
    //     (err) => {
    //       if (err) {
    //         console.error("Error updating modules:", err.message);
    //       } else {
    //         console.log(`Module ${module} updated successfully`);
    //       }
    //     }
    //   );
    // });

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});


router.delete('/deleteSuperUser/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Retrieve email before deletion for removing assignments
    const [result] = await db.query(
      `SELECT super_user_email FROM SuperAdmin_Users WHERE user_id = ?`, // Use the correct column name
      [userId]
    );
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userEmail = result[0].super_user_email;

    // Delete user from SuperAdmin_Users table
    await db.query(`DELETE FROM SuperAdmin_Users WHERE user_id = ?`, [userId]);

    // Delete assignments from Assingned_Rfp_SuperUser
    await db.query(
      `DELETE FROM Assingned_Rfp_SuperUser WHERE email = ?`,
      [userEmail]
    );

    // Delete login details from Users_Login
    await db.query(`DELETE FROM Users_Login WHERE Username = ?`, [userEmail]);

    console.log('User and related data deleted successfully');
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});



router.get('/getSuperUsers', async (req, res) => {
    try {
      const query = `SELECT 
        user_id AS id,
        entity_name AS entityName, 
        entity_sub_name AS entitySubName, 
        entity_landline AS entityLandline, 
        entity_address AS entityAddress, 
        entity_city AS entityCity, 
        entity_pin_code AS entityPinCode, 
        entity_country AS entityCountry, 
        super_user_name AS superUserName, 
        designation, 
        super_user_email AS superUserEmail, 
        super_user_mobile AS superUserMobile, 
        valid_from AS validFrom, 
        valid_to AS validTo, 
        active_flag AS activeFlag 
        FROM SuperAdmin_Users`;
  
      const [rows] = await db.query(query); // Assuming you're using a promise-based MySQL client like `mysql2`
      console.log(rows)
      res.status(200).json(rows);
    } catch (err) {
      console.error('Error fetching users:', err.message);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  
  router.post('/addUser', async (req, res) => {
    const { id, userName, designation, email, mobile, activeFlag } = req.body;
    const creatorName = req.body.emailId; // Extract separate userName field
    console.log("id "+ id);
    console.log(id, userName, designation, email, mobile, activeFlag );
    console.log(creatorName);
    
    try {
      // Query to get entity and super user details based on creatorName
      const entity = `SELECT entity_name, super_user_name FROM SuperAdmin_Users WHERE super_user_email = ?`;
      const [suDetails] = await db.query(entity, [creatorName]);
      console.log(suDetails[0].entity_name);
  
      // Get count of users created by creatorName and add 1 to it
      const count = `SELECT COUNT(email) + 1 AS no FROM Users_Table WHERE createdby = ?`;
      const [no] = await db.query(count, [creatorName]);
      console.log(no[0].no);
      
      // Insert user details into Users_Table
      const query = `
        INSERT INTO Users_Table (user_no, user_name, designation, email, mobile, active_flag, entity_Name, createdby) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
        no[0].no,           // User number
        userName,           // User name
        designation,        // Designation
        email,              // Email
        mobile,             // Mobile number
        activeFlag,         // Active flag
        suDetails[0].entity_name,                 // Entity name (empty string)
        creatorName         // Created by (creator's email)
      ];
      
      // Execute the insert query
      const [result] = await db.query(query, values);
      res.status(200).json({ success: true, userId: result.insertId });
  
      // Insert login details into Users_Login table
      const password = "system@123";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const query1 = "INSERT INTO Users_Login (Username, Password, Role, Entity_Name) VALUES (?, ?, ?, ?)";
      db.query(query1, [email, hashedPassword, "User", ""], (err, results) => {
          if (err) throw err;
          console.log("User created!");
      });
    } catch (err) {
      console.error('Error adding user:', err.message);
      res.status(500).json({ success: false, error: 'Failed to add user' });
    }
  });
  
  
  router.get('/getusers', async (req, res) => {
    try {
      const { createdBy } = req.query;  // Get the 'createdBy' parameter from query string
      if (!createdBy) {
        return res.status(400).json({ error: 'createdBy parameter is required' });
      }
  
      // Use parameterized query to fetch users created by the specified 'createdBy' user
      const query = `SELECT user_no, user_name, designation, email, mobile, active_flag FROM Users_Table WHERE createdby = ?`;
      const [results] = await db.query(query, [createdBy]);
      console.log(results)
      res.json(results);
    } catch (err) {
      console.error('Error fetching users:', err.message);
      res.status(500).send('Error fetching users');
    }
  });
  

router.put('/users/:id', async (req, res) => {
  try {
    console.log("update user")
    const { id } = req.params;
    
    const { user_name, designation, email, mobile, active_flag ,createdBy} = req.body;
    console.log(id,user_name)
    const query = `
      UPDATE Users_Table
      SET user_name = ?, designation = ?, email = ?, mobile = ?, active_flag = ?
      WHERE user_no = ? and createdBy = ?
    `;
    await db.query(query, [user_name, designation, email, mobile, active_flag, id,createdBy]);
    res.send("User updated successfully");
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).send("Error updating user");
  }
});


router.get('/getModule', async (req, res) => {
  try {
    const query = `SELECT user_no, user_name, designation, email, mobile, active_flag FROM Users_Table`;
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Error fetching users');
  }
});

// Assign user tab Submit button
router.post("/assignUserModules", async (req, res) => {
  const { assignedUsers, rfpNo, selectedModules,userName } = req.body;
  console.log(assignedUsers);
  console.log(userName);

  if (!assignedUsers || assignedUsers.length === 0 || !rfpNo) {
    return res.status(400).json({ message: "Invalid data provided" });
  }

  try {
    // Loop through assigned users and insert into the database
    const query = ` INSERT INTO User_Modules_Assignment 
    (user_name,createdby, is_active, date_from, date_to, is_maker, is_authorizer, is_reviewer, module_name, rfp_no)
  VALUES 
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    is_active = VALUES(is_active),
    date_from = VALUES(date_from),
    date_to = VALUES(date_to),
    is_maker = VALUES(is_maker),
    is_authorizer = VALUES(is_authorizer),
    is_reviewer = VALUES(is_reviewer),
    module_name = VALUES(module_name)
`;
    for (const user of assignedUsers) {
      const values = [
        user.user_name,
        userName,
        user.active,
        user.fromDate || null,
        user.toDate || null,
        user.maker,
        user.authorizer,
        user.reviewer,
        JSON.stringify(user.selectedModules),
        rfpNo,
      ];

      await db.query(query, values); // Assuming you're using a database query function
    }

    res.status(200).json({ success: true, message: "Users assigned successfully" });
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({ success: false, message: "Failed to assign users" });
  }
});

router.get("/getAssignedUsers", async (req, res) => {
  const { rfpNo } = req.query;

  if (!rfpNo) {
    return res.status(400).json({ message: "RFP Number is required" });
  }

  try {
    const query = `
      SELECT 
        user_name AS userName, 
        is_active AS active, 
        date_from AS fromDate, 
        date_to AS toDate, 
        is_maker AS maker, 
        is_authorizer AS authorizer, 
        is_reviewer AS reviewer, 
        module_name AS module 
      FROM User_Modules_Assignment
      WHERE rfp_no = ?`;
    const [results] = await db.query(query, [rfpNo]); // Use your DB query method
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ success: false, message: "Failed to fetch data" });
  }
});


module.exports = router;