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

router.get('/fetchVendor', async (req, res) => {
    const { userName } = req.query;
    if (!userName ) {
        return res.status(400).send("userName is required");
    }
    try {        
        const [rows] = await db.query(`select entity_name,email,admin_name,id from vendor_admin_users where createdby= ?`, [userName]);  
        console.log(rows)
        res.json(rows);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data from database.");
    }
});
// Fetching data from 6 tables using RFP_No and Bank_Name
router.post('/fetchScores', async (req, res) => {
    const { selectedVendor,userName } = req.body; // Accessing JSON data directly
    const { entity_name, email, admin_name, id } = selectedVendor; // Accessing JSON data directly
    console.log(entity_name, email, admin_name, id,userName);
    // const { rfpNo, bankName } = req.query;
    // if (!rfpNo || !bankName) {
    //     return res.status(400).send("RFP_No and Bank_Name are required");
    // }

    const tables = [
        "Implementation_Score",
        "No_of_Sites_Score",
        "Site_Reference",
        "Scoring_Items1",
        "Scoring_Items2",
        "Scoring_Items3"
    ];

    let scores = {};
    try {
        const [rfpNo] = await db.query(`select rfp_reference_no from vendor_admin_users where id= ?`, [id]);  
        const [bankName] = await db.query(`select entity_name from superadmin_users where super_user_email= ?`, [userName]);  
        console.log(rfpNo)
        console.log(bankName)
        for (const table of tables) {
            // const query = `SELECT Implementation_Model,Score  FROM ${table} WHERE RFP_No = ? AND Bank_Name = ?`;
            // const [rows] = await db.query(query, [rfpNo[0].rfp_reference_no, bankName[0].entity_name]);
            const query = `SELECT Implementation_Model,Score  FROM ${table} WHERE RFP_No = ? `;
            const [rows] = await db.query(query, rfpNo[0].rfp_reference_no);
            
            if(rows.length>0){
                scores[table] = rows.map(row => [row.Implementation_Model,row.Score]);
            }
           
        }
        const query = `
        select id,CommercialPattern, InternalPercent, From1, To1, Score1, From2, To2, Score2, From3, To3, Score3
        from  CommercialScores 
        `;
        const [commercial]= await db.query(query)
        // const query = `
        // select CommercialPattern, InternalPercent, From1, To1, Score1, From2, To2, Score2, From3, To3, Score3
        // from  CommercialScores where RFP_No =?
        // `;
        // const [commercial]= await db.query(query, rfpNo[0].rfp_reference_no)
        console.log(commercial)
        console.log(scores)
        const response = [commercial,scores]
        console.log(response)
        res.json(response);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data from database.");
    }
});

router.post('/updateBankAmount', async (req, res) => {
    const { rfpNo, selectedVendor, commercialValue } = req.body;
    try {
        for (const item of commercialValue) {
            const { CommercialPattern, Bank_Amount, id } = item;
            await db.query("SET SQL_SAFE_UPDATES = 0");
            const [result] = await db.query(
                `UPDATE CommercialScores 
                 SET Bank_Amount = ? 
                 WHERE ID = ? AND CommercialPattern = ?`,
                [Bank_Amount, id, CommercialPattern]
            );

            if (result.affectedRows === 0) {
                console.warn(`No record found for RFP: ${rfpNo}`);
            }
        }
        res.status(200).json({ message: "Bank Amount successfully updated" });  // Send JSON response
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).json({ error: "Error updating data" });  // Send JSON error response
    }
});

router.post('/saveOrUpdateScores', async (req, res) => {
    const { rfpNo, selectedValues,userName } = req.body;

    try {
        const [bankName] = await db.query(`select entity_name,user_id from superadmin_users where super_user_email= ?`, [userName]);  
        
        const query = `
            INSERT INTO EvaluationScores 
            (Implementation_Name, Implementation_Score,
             No_of_Sites_Name, No_of_Sites_Score, 
             Site_Reference_Name, Site_Reference_Score,
             Scoring_Items1_Name, Scoring_Items1_Score, 
             Scoring_Items2_Name, Scoring_Items2_Score, 
             Scoring_Items3_Name, Scoring_Items3_Score, 
             RFP_No, Bank_Id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
             Implementation_Name = VALUES(Implementation_Name),
             Implementation_Score = VALUES(Implementation_Score),
             No_of_Sites_Name = VALUES(No_of_Sites_Name),
             No_of_Sites_Score = VALUES(No_of_Sites_Score),
             Site_Reference_Name = VALUES(Site_Reference_Name),
             Site_Reference_Score = VALUES(Site_Reference_Score),
             Scoring_Items1_Name = VALUES(Scoring_Items1_Name),
             Scoring_Items1_Score = VALUES(Scoring_Items1_Score),
             Scoring_Items2_Name = VALUES(Scoring_Items2_Name),
             Scoring_Items2_Score = VALUES(Scoring_Items2_Score),
             Scoring_Items3_Name = VALUES(Scoring_Items3_Name),
             Scoring_Items3_Score = VALUES(Scoring_Items3_Score)
        `;

        const values = [
            selectedValues.Implementation_Score?.value || '',
            selectedValues.Implementation_Score?.score || 0,
            selectedValues.No_of_Sites_Score?.value || '',
            selectedValues.No_of_Sites_Score?.score || 0,
            selectedValues.Site_Reference_Score?.value || '',
            selectedValues.Site_Reference_Score?.score || 0,
            selectedValues.Scoring_Items1?.value || '',
            selectedValues.Scoring_Items1?.score || 0,
            selectedValues.Scoring_Items2?.value || '',
            selectedValues.Scoring_Items2?.score || 0,
            selectedValues.Scoring_Items3?.value || '',
            selectedValues.Scoring_Items3?.score || 0,
            rfpNo,
            bankName[0].user_id
        ];

        await db.query(query, values);
        res.status(200).send("Data successfully inserted/updated");
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).send("Error saving data");
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


router.post('/save-scores', async (req, res) => {
    const { commercialScores, functionalScores, overallScoring, rfp_no } = req.body;
    console.log(commercialScores)
    console.log(functionalScores)
    console.log(overallScoring)
    // const connection = db; // Assuming `db` is your database connection
    // const query = util.promisify(connection.query).bind(connection); // Promisify `query`

    try {
        // Handle Commercial Scores
        if (commercialScores && commercialScores.length > 0) {
            const commercialQuery = `
                INSERT INTO CommercialScores 
                (CommercialPattern, InternalPercent, From1, To1, Score1, From2, To2, Score2, From3, To3, Score3, RFP_No)
                VALUES ?
            `;

            const commercialValues = commercialScores.map(row => [
                row.CommercialPattern,
                row.InternalPercent,
                row.From1, row.To1, row.Score1,
                row.From2, row.To2, row.Score2,
                row.From3, row.To3, row.Score3,
                rfp_no
            ]);

            await db.query(commercialQuery, [commercialValues]);
        }

        // Handle Functional Scores
        if (functionalScores) {
            const {
                isAvailableChecked,
                isPartlyAvailableChecked,
                isCustomizableChecked,
                availableScore,
                partlyAvailableScore,
                customizableScore,
                mandatoryScore,
                optionalScore,
                
            } = functionalScores;

            const functionalQuery = `
                INSERT INTO functional_scores 
                (isAvailableChecked, isPartlyAvailableChecked, isCustomizableChecked, availableScore, 
                partlyAvailableScore, customizableScore, mandatoryScore, optionalScore, RFP_No, Bank_Id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await db.query(functionalQuery, [
                isAvailableChecked, isPartlyAvailableChecked, isCustomizableChecked,
                availableScore, partlyAvailableScore, customizableScore,
                mandatoryScore, optionalScore, rfp_no, "Bank"
            ]);
        }

        // Handle Overall Scoring
        if (overallScoring) {
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
                bankId
            } = overallScoring;

            const overallQuery = `
                INSERT INTO overall_scoring (
                    functional_items, commercials, implementation_model, no_of_installations,
                    site_visit_reference, others1_title, others1_value,
                    others2_title, others2_value, others3_title, others3_value, rfp_no, bank_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await db.query(overallQuery, [
                functionalItems, commercials, implementationModel, installations, siteVisit,
                others1Title, others1, others2Title, others2, others3Title, others3, rfp_no, bankId
            ]);
        }

        // If all inserts are successful
        res.status(200).json({ message: 'All data saved successfully!' });

    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Error saving data to database.', error });
    }
});



module.exports = router;
