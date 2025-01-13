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

router.post('/commercial-scores', (req, res) => {
    const rows = req.body;
    try{
    const query = `
        INSERT INTO CommercialScores 
        (CommercialPattern, InternalPercent, From1, To1, Score1, From2, To2, Score2, From3, To3, Score3,RFP_No)
        VALUES ?
    `;

    const values = rows.map(row => [
        row.CommercialPattern,
        row.InternalPercent,
        row.From1, row.To1, row.Score1,
        row.From2, row.To2, row.Score2,
        row.From3, row.To3, row.Score3,
        row.rfp_no
    ]);

    db.query(query, [values])
    res.status(200).send('Data saved successfully!');
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send("Error saving data to database");
    }
});

router.get('/fetchCommercial-scores', (req, res) => {
    const rows = req.body;
    try{
    const query = `
        select CommercialPattern, InternalPercent, From1, To1, Score1, From2, To2, Score2, From3, To3, Score3
        from  CommercialScores where RFP_No =?
    `;
    const values = rows.map(row => [
          row.rfp_no
    ]);

    const [result]=db.query(query, [values])
    res.status(200).send(result);
    } catch (error) {
        console.error('Error Fetching data:', error);
        res.status(500).send("Error Fetching data from database");
    }
});
// Save data endpoint
router.post('/functional-score', (req, res) => {
    const {
        isAvailableChecked,
        isPartlyAvailableChecked,
        isCustomizableChecked,
        availableScore,
        partlyAvailableScore,
        customizableScore,
        mandatoryScore,
        optionalScore,
    } = req.body.scores;
   const {rfp_no } = req.body;

    const query = `INSERT INTO functional_scores (isAvailableChecked, isPartlyAvailableChecked,
     isCustomizableChecked, availableScore, partlyAvailableScore, customizableScore, mandatoryScore, 
     optionalScore, RFP_No, Bank_Id ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

    db.query(query, [
        isAvailableChecked,
        isPartlyAvailableChecked,
        isCustomizableChecked,
         availableScore,
        partlyAvailableScore,
        customizableScore,
        mandatoryScore,
        optionalScore,
        rfp_no,"Bank"
    ], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error saving data.' });
        }
        res.status(201).json({ message: 'Data saved successfully!', data: result });
    });
});

// Fetch data endpoint
router.get('/fetchFunctional-score', (req, res) => {
    const query = 'SELECT * FROM functional_scores';

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error fetching data.' });
        }
        res.status(200).json({ data: results });
    });
});
// Save data
router.post("/save-Overall-scoring", (req, res) => {
    const {
        functionalItems,
        commercials,
        implementationModel,
        installations,
        siteVisit,
        others1,
        others2,
        others3,
        others1Title,
        others2Title,
        others3Title,
        total,
        rfpNo,
        bankId
    } = req.body;

    const sql = `
        INSERT INTO overall_scoring (
            functional_items, commercials, implementation_model, no_of_installations,
            site_visit_reference, others1_title, others1_value,
            others2_title, others2_value, others3_title, others3_value, rfp_no, bank_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [
        functionalItems, commercials, implementationModel, installations, siteVisit,
        others1Title, others1, others2Title, others2, others3Title, others3, rfpNo, bankId
    ], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Data saved successfully!", id: result.insertId });
    });
});

// Fetch data
router.get("/fetch-scoring", (req, res) => {
    const sql = "SELECT * FROM overall_scoring";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
    });
});

module.exports = router;
