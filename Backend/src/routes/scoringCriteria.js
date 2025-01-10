const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/scores', async (req, res) => {
    const { sections, rfp_no = 'RFP123', bank_name = 'Sample Bank', created_by = 'Admin' } = req.body;
    console.log(sections)
    if (!sections || sections.length === 0) {
        return res.status(400).send("No data received");
    }

    const tables = [
        "Implementation_Score",
        "No_of_Sites_Score",
        "Site_Reference_Score",
        "Scoring_Items1",
        "Scoring_Items2",
        "Scoring_Items3"
    ];

    try {
        for (let index = 0; index < tables.length; index++) {
            const table = tables[index];

            if (!sections[index] || !sections[index].data) {
                console.warn(`No data for table: ${table}`);
                continue; // Skip if there's no corresponding section data
            }

            const values = sections[index].data.map(item => [
                item.text, 
                item.score, 
                rfp_no,
                bank_name,
                created_by
            ]);
            console.log("values")
            console.log(values)
            if(values.length>0 ){
                const query = `
                INSERT INTO ${table} 
                (Implementation_Model, Score, RFP_No, Bank_Name, Created_By) 
                VALUES ?`;

            await db.query(query, [values]); 
            }
            // Properly passing values as an array of arrays
        }

        res.status(200).send('Data saved successfully for all tables');
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).send("Error saving data to database");
    }
});

// Fetching data from 6 tables using RFP_No and Bank_Name
router.get('/fetchScores', async (req, res) => {
    const { rfpNo, bankName } = req.query;
    if (!rfpNo || !bankName) {
        return res.status(400).send("RFP_No and Bank_Name are required");
    }

    const tables = [
        "Implementation_Score",
        "No_of_Sites_Score",
        "Site_Reference",
        "Scoring_Items1",
        "Scoring_Items2",
        "Scoring_Items3"
    ];

    let results = {};
    try {
        for (const table of tables) {
            const query = `SELECT Implementation_Model,Score  FROM ${table} WHERE RFP_No = ? AND Bank_Name = ?`;
            const [rows] = await db.query(query, [rfpNo, bankName]);
            if(rows.length>0){
                results[table] = rows.map(row => [row.Implementation_Model,row.Score]);
            }
           
        }
        console.log(results)
        res.json(results);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data from database.");
    }
});

module.exports = router;
