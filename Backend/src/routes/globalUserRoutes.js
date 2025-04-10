const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Function to generate a unique Module_ID
const generateModuleID = () => {
  return Math.random().toString(36).substr(2, 9); // Customize as needed
};

router.post('/upload', async (req, res) => {
  const { data } = req.body;

  console.log('Received data:', data);
  console.log('title:', data.title[0].title);

  // Validate data format
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid data format. Expected an object with L1, L2, and L3 keys.' });
  }

  try {
    // Handle L1 data
    if (data.L1) {
      for (const row of data.L1) {
        const { L1_Code, L1_Description } = row;

        if (!L1_Code || !L1_Description) {
          console.warn(`Skipping L1 row with missing data: ${JSON.stringify(row)}`);
          continue;
        }

        const [existing] = await db.query(
          'SELECT * FROM rfp_l1_modules WHERE L1_Code = ?',
          [L1_Code]
        );

        if (existing.length > 0) {
          console.log(`Updating existing L1_Code: ${L1_Code}`);
          await db.query(
            'UPDATE rfp_l1_modules SET L1_Module_Description = ?, Module_Group = ? WHERE L1_Code = ?',
            [L1_Description, data.title[0].title, L1_Code]
          );          
        } else {
          const Module_ID = generateModuleID();
          console.log(`Inserting new L1_Code: ${L1_Code}`);
          await db.query(
            'INSERT INTO rfp_l1_modules (Module_ID, Module_Group, L1_Code, L1_Module_Description) VALUES (?, ?, ?, ?)',
            [2, data.title[0].title, L1_Code, L1_Description]
          );
        }
      }
    }

    // Handle L2 data
    if (data.L2) {
      for (const row of data.L2) {
        const { L2_Code, L2_Description } = row;

        if (!L2_Code || !L2_Description) {
          console.warn(`Skipping L2 row with missing data: ${JSON.stringify(row)}`);
          continue;
        }

        const [existing] = await db.query(
          'SELECT * FROM rfp_l2_modules WHERE L2_Code = ?',
          [L2_Code]
        );

        if (existing.length > 0) {
          console.log(`Updating existing L2_Code: ${L2_Code}`);
          await db.query(
            'UPDATE rfp_l2_modules SET L2_Description = ? WHERE L2_Code = ?',
            [L2_Description, L2_Code]
          );
        } else {
          const Module_ID = generateModuleID();
          console.log(`Inserting new L2_Code: ${L2_Code}`);
          await db.query(
            'INSERT INTO rfp_l2_modules ( L2_Code, L2_Description) VALUES ( ?, ?)',
            [ L2_Code, L2_Description]
          );
        }
      }
    }

    // Handle L3 data
    if (data.L3) {
      for (const row of data.L3) {
        const { L3_Code, L3_Description } = row;

        if (!L3_Code || !L3_Description) {
          console.warn(`Skipping L3 row with missing data: ${JSON.stringify(row)}`);
          continue;
        }

        const [existing] = await db.query(
          'SELECT * FROM rfp_l3_modules WHERE L3_Code = ?',
          [L3_Code]
        );

        if (existing.length > 0) {
          console.log(`Updating existing L3_Code: ${L3_Code}`);
          await db.query(
            'UPDATE rfp_l3_modules SET L3_Description = ? WHERE L3_Code = ?',
            [L3_Description, L3_Code]
          );
        } else {
          const Module_ID = generateModuleID();
          console.log(`Inserting new L3_Code: ${L3_Code}`);
          await db.query(
            'INSERT INTO rfp_l3_modules ( L3_Code, L3_Description) VALUES ( ?, ?)',
            [ L3_Code, L3_Description]
          );
        }
      }
    }

    res.json({ message: 'Data processed successfully' });
  } catch (error) {
    console.error('Error processing data:', error.message);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

router.post('/upload-functional-items', async (req, res) => {
  const { data } = req.body;

  console.log('Received data:', data);

  // Validate data format
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  try {
    for (const row of data) {
      let { L1, L2, L3, F1, F2, Product, Description, Geo, Conditions } = row;

      // Ensure numeric columns default to "00" if empty
      L1 = L1 || "00";
      L2 = L2 || "00";
      L3 = L3 || "00";
      F1 = F1 || "00";
      F2 = F2 || "00";

      // Combine to form Module_Code
      const Module_Code = `${L1}${L2}${L3}`;
      const f2Code = `${F1}${F2}`;

      // Insert or update the row in the database
      const [existing] = await db.query(
        'SELECT * FROM rfp_functionalitems WHERE Module_Code = ? AND F1_Code = ? AND F2_Code = ?',
        [Module_Code, F1, f2Code]
      );

      if (existing.length > 0) {
        // Update existing row
        console.log(`Updating existing Module_Code: ${Module_Code}`);
        await db.query(
          `UPDATE rfp_functionalitems
           SET Product = ?, Description = ?, Geo = ?, Conditions = ?
           WHERE Module_Code = ? AND F1_Code = ? AND F2_Code = ?`,
          [Product, Description, Geo, Conditions, Module_Code, F1, f2Code]
        );
      } else {
        // Insert new row
        console.log(`Inserting new Module_Code: ${Module_Code}`);
        await db.query(
          `INSERT INTO rfp_functionalitems
           (Module_Code, F1_Code, F2_Code, Product, Description, Geo, Conditions)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [Module_Code, F1, f2Code, Product, Description, Geo, Conditions]
        );
      }
    }

    res.json({ message: 'Functional items processed successfully' });
  } catch (error) {
    console.error('Error processing functional items:', error.message);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

module.exports = router;
