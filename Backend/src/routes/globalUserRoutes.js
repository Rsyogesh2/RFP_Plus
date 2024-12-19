const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/upload', async (req, res) => {
    const { data } = req.body;
    console.log(data);
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
  
    try {
      
      for (const row of data) {
        const { L1_Code, L1_Description } = row;
  
        if (!L1_Code || !L1_Description) continue; // Skip rows without valid data
  
        // Check if L1_Code exists in the table
        const [existing] = await db.query(
          'SELECT * FROM rfp_l1_modules WHERE L1_Code = ?',
          [L1_Code]
        );
        console.log('existing :', existing);
        if (existing.length > 0) {
          // Update existing row
          await db.query(
            'UPDATE rfp_l1_modules SET Module_Group = ?, L1_Description = ? WHERE L1_Code = ?',
            ['Loan Services', L1_Description, L1_Code]
          );
        } else {
          // Insert new row
          await db.query(
            'INSERT INTO rfp_l1_modules (Module_ID, Module_Group, L1_Code, L1_Description) VALUES (?, ?, ?, ?)',
            ["1", 'Loan Services', L1_Code, L1_Description]
          );
        }
      }
      res.json({ message: 'Data processed successfully' });
    } catch (error) {
      console.error('Error processing data:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  module.exports = router;