const express = require('express');
const router = express.Router();
const db = require('../config/db');

//not used
router.post('/scores', async (req, res) => {
    const { sections, rfpNo, userName } = req.body;
      const [created_by] = await db.query(`SELECT Created_by FROM Users_Table WHERE email = ?`, [userName]);
     const [bankNameResult] = await db.query(`SELECT entity_name,id FROM superadmin_users WHERE 
        super_user_email = ?`, created_by[0].Created_by);

    console.log(bankNameResult[0].id)
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
                rfpNo,
                bankNameResult[0].id,
                bankNameResult[0].entity_name,
                userName
            ]);
            console.log("values")
            console.log(values)
            if (values.length > 0) {
                // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert behavior
                const query = `
                    INSERT INTO ${table} 
                    (Implementation_Model, Score, RFP_No,Bank_Id, Bank_Name, Created_By) 
                    VALUES ? 
                    ON DUPLICATE KEY UPDATE 
                    Implementation_Model = VALUES(Implementation_Model),
                    Score = VALUES(Score),
                    Created_By = VALUES(Created_By)`;
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

// Save data endpoint
router.post('/functional-score', async (req, res) => {
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
   const {rfp_no,userName } = req.body;
   const [created_by] = await db.query(`SELECT Created_by FROM Users_Table WHERE email = ?`, [userName]);
   const [bankNameResult] = await db.query(`SELECT entity_name,id FROM superadmin_users WHERE 
      super_user_email = ?`, created_by[0].Created_by);

  console.log(bankNameResult[0].id)

    const query = `INSERT INTO functional_scores (
    isAvailableChecked, isPartlyAvailableChecked, isCustomizableChecked,
    availableScore, partlyAvailableScore, customizableScore,
    mandatoryScore, optionalScore, RFP_No, Bank_Id
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        isAvailableChecked = VALUES(isAvailableChecked),
        isPartlyAvailableChecked = VALUES(isPartlyAvailableChecked),
        isCustomizableChecked = VALUES(isCustomizableChecked),
        availableScore = VALUES(availableScore),
        partlyAvailableScore = VALUES(partlyAvailableScore),
        customizableScore = VALUES(customizableScore),
        mandatoryScore = VALUES(mandatoryScore),
        optionalScore = VALUES(optionalScore);
`;

    db.query(query, [
        isAvailableChecked,
        isPartlyAvailableChecked,
        isCustomizableChecked,
         availableScore,
        partlyAvailableScore,
        customizableScore,
        mandatoryScore,
        optionalScore,
        rfp_no,bankNameResult[0].id
    ], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error saving data.' });
        }
        res.status(201).json({ message: 'Data saved successfully!', data: result });
    });
});

router.post('/commercial-scores', async(req, res) => {
    // const rows = req.body;
    const {rows,rfpNo,userName } = req.body;
   const [created_by] = await db.query(`SELECT Created_by FROM Users_Table WHERE email = ?`, [userName]);
   const [bankNameResult] = await db.query(`SELECT entity_name,id FROM superadmin_users WHERE 
      super_user_email = ?`, created_by[0].Created_by);

  console.log(bankNameResult[0].id)

    try{
        const query = `
        INSERT INTO CommercialScores (
          CommercialPattern, InternalPercent, From1, To1, Score1,
          From2, To2, Score2, From3, To3, Score3, RFP_No, Bank_Id
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          InternalPercent = VALUES(InternalPercent),
          From1 = VALUES(From1),
          To1 = VALUES(To1),
          Score1 = VALUES(Score1),
          From2 = VALUES(From2),
          To2 = VALUES(To2),
          Score2 = VALUES(Score2),
          From3 = VALUES(From3),
          To3 = VALUES(To3),
          Score3 = VALUES(Score3);
      `;      

    const values = rows.map(row => [
        row.CommercialPattern,
        row.InternalPercent,
        row.From1, row.To1, row.Score1,
        row.From2, row.To2, row.Score2,
        row.From3, row.To3, row.Score3,
        rfpNo,bankNameResult[0].id
    ]);

    db.query(query, [values])
    res.status(200).send('Data saved successfully!');
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send("Error saving data to database");
    }
});

router.post("/save-Overall-scoring", async(req, res) => {
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
        userName
    } = req.body;
    const [created_by] = await db.query(`SELECT Created_by FROM Users_Table WHERE email = ?`, [userName]);
    const [bankNameResult] = await db.query(`SELECT entity_name,id FROM superadmin_users WHERE 
       super_user_email = ?`, created_by[0].Created_by);
 
   console.log(bankNameResult[0].id)

    const sql = `
    INSERT INTO overall_scoring (
        functional_items, commercials, implementation_model, no_of_installations,
        site_visit_reference, others1_title, others1_value,
        others2_title, others2_value, others3_title, others3_value, rfp_no, bank_id
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        functional_items = VALUES(functional_items),
        commercials = VALUES(commercials),
        implementation_model = VALUES(implementation_model),
        no_of_installations = VALUES(no_of_installations),
        site_visit_reference = VALUES(site_visit_reference),
        others1_title = VALUES(others1_title),
        others1_value = VALUES(others1_value),
        others2_title = VALUES(others2_title),
        others2_value = VALUES(others2_value),
        others3_title = VALUES(others3_title),
        others3_value = VALUES(others3_value);
`;

    db.query(sql, [
        functionalItems, commercials, implementationModel, installations, siteVisit,
        others1Title, others1, others2Title, others2, others3Title, others3, rfpNo, bankNameResult[0].id
    ], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Data saved successfully!", id: result.insertId });
    });
});
// not used

// Final Evaluation
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
        from  CommercialScores where RFP_No=?
        `;
        const [commercial]= await db.query(query,rfpNo[0].rfp_reference_no)
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
// saving the Commerical Pattern Final Amount
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

// saving the Others Final Score
router.post('/saveOrUpdateScores', async (req, res) => {
    const { rfpNo, selectedValues, userName, sections } = req.body;
    console.log(selectedValues);
    console.log(sections);
    
    const percentageResults = {};

// Iterate through each key in the sections object
Object.keys(sections).forEach(key => {
    // Extract scores and calculate the maximum score for the section
    const sectionScores = sections[key].map(item => item[1]); 
    const maxScore = Math.max(...sectionScores);

    // Get the selected score for the current key (since it's a single value now)
    const selectedScore = selectedValues[key]?.score || 0; 
    
    // Calculate the percentage (avoiding division by zero)
    const percentage = maxScore !== 0 ? ((selectedScore / maxScore) * 100).toFixed(2) + "%" : "0%";
    
    // Store the calculated percentage
    percentageResults[key] = percentage;
});

console.log("Percentage Results:", percentageResults);

try {
    const [bankName] = await db.query(
        `SELECT entity_name, user_id FROM superadmin_users WHERE super_user_email = ?`, 
        [userName]
    );  

    //  Modified query to include percentage columns
    const query = `
        INSERT INTO EvaluationScores 
        (Implementation_Name, Implementation_Score, Implementation_Percentage,
         No_of_Sites_Name, No_of_Sites_Score, No_of_Sites_Percentage, 
         Site_Reference_Name, Site_Reference_Score, Site_Reference_Percentage,
         Scoring_Items1_Name, Scoring_Items1_Score, Scoring_Items1_Percentage,
         Scoring_Items2_Name, Scoring_Items2_Score, Scoring_Items2_Percentage,
         Scoring_Items3_Name, Scoring_Items3_Score, Scoring_Items3_Percentage,
         RFP_No, Bank_Id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
         Implementation_Name = VALUES(Implementation_Name),
         Implementation_Score = VALUES(Implementation_Score),
         Implementation_Percentage = VALUES(Implementation_Percentage),
         No_of_Sites_Name = VALUES(No_of_Sites_Name),
         No_of_Sites_Score = VALUES(No_of_Sites_Score),
         No_of_Sites_Percentage = VALUES(No_of_Sites_Percentage),
         Site_Reference_Name = VALUES(Site_Reference_Name),
         Site_Reference_Score = VALUES(Site_Reference_Score),
         Site_Reference_Percentage = VALUES(Site_Reference_Percentage),
         Scoring_Items1_Name = VALUES(Scoring_Items1_Name),
         Scoring_Items1_Score = VALUES(Scoring_Items1_Score),
         Scoring_Items1_Percentage = VALUES(Scoring_Items1_Percentage),
         Scoring_Items2_Name = VALUES(Scoring_Items2_Name),
         Scoring_Items2_Score = VALUES(Scoring_Items2_Score),
         Scoring_Items2_Percentage = VALUES(Scoring_Items2_Percentage),
         Scoring_Items3_Name = VALUES(Scoring_Items3_Name),
         Scoring_Items3_Score = VALUES(Scoring_Items3_Score),
         Scoring_Items3_Percentage = VALUES(Scoring_Items3_Percentage)
    `;

    // ✅ Updated values array to include calculated percentages
    const values = [
        selectedValues.Implementation_Score?.value || '',
        selectedValues.Implementation_Score?.score || 0,
        percentageResults.Implementation_Score || "0%",
        
        selectedValues.No_of_Sites_Score?.value || '',
        selectedValues.No_of_Sites_Score?.score || 0,
        percentageResults.No_of_Sites_Score || "0%",
        
        selectedValues.Site_Reference_Score?.value || '',
        selectedValues.Site_Reference_Score?.score || 0,
        percentageResults.Site_Reference_Score || "0%",
        
        selectedValues.Scoring_Items1?.value || '',
        selectedValues.Scoring_Items1?.score || 0,
        percentageResults.Scoring_Items1 || "0%",
        
        selectedValues.Scoring_Items2?.value || '',
        selectedValues.Scoring_Items2?.score || 0,
        percentageResults.Scoring_Items2 || "0%",
        
        selectedValues.Scoring_Items3?.value || '',
        selectedValues.Scoring_Items3?.score || 0,
        percentageResults.Scoring_Items3 || "0%",
        
        rfpNo,
        bankName[0].user_id
    ];

    // ✅ Execute query with percentage included
    await db.query(query, values);
    res.status(200).send("Data successfully inserted/updated");
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).send("Error saving data");
    }
});
// Final Evaluation ends



// fetching Final Evaluation Scores for all the vendor Based on RFP_no and Bank_id
router.get('/fetchFinalEvaluationScores', async (req, res) => {
    //const { rfpNo, bankId } = req.query; // Expecting query parameters for flexibility
    const rfpNo="RFP123";
    const bankId="1";
    if (!rfpNo || !bankId) {
        return res.status(400).send("Missing RFP Number or Bank ID");
    }

    try {
        // Fetch data from EvaluationScores table using RFP_No and Bank_Id
        const query = `
            SELECT 
            Implementation_Percentage,
            No_of_Sites_Percentage,
            Site_Reference_Percentage,
            Scoring_Items1_Percentage,
            Scoring_Items2_Percentage,
            Scoring_Items3_Percentage
            FROM EvaluationScores
            WHERE RFP_No = ? AND Bank_Id = ?;
        `;

        const [results] = await db.query(query, [rfpNo, bankId]);

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).send("No records found for the provided criteria");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
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

// Fetch data endpoint
router.get('/fetchFunctional-score', (req, res) => {
    const query = 'SELECT * FROM functional_scores where RFP_No = ?  and Bank_Id=?';

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error fetching data.' });
        }
        res.status(200).json({ data: results });
    });
});
// Save data


// Fetch data
router.get("/fetch-scoring-Overall", async(req, res) => {
    // const {rfpNo, Bank_Id}= req.body
    const rfpNo = "HR payroll";
    const Bank_Id = "Bank";
    try{
        const sql = "SELECT * FROM overall_scoring  where RFP_No = ? ";
        // const sql = "SELECT * FROM overall_scoring  where RFP_No = ?  and Bank_Id=?";
        const [result] = await db.query(sql, rfpNo);
        console.log(result)
        res.send(result);
    }catch(error){
        console.error("Erro in Fetching data"+error);
        res.status(500).json({ error: 'Error Fetching data' });
    }
   
});

// Scoring Criteria - start
//saving Scoring Criteria
router.post('/save-all-scores', async (req, res) => {
    const { commercialScores, functionalScores, overallScoring, sections, rfpNo, userName } = req.body;

    try {
        // Fetch `created_by` and `bankNameResult` using `userName`
        const [created_by] = await db.query(
            `SELECT Createdby FROM Users_Table WHERE email = ?`,
            [userName]
        );
        const [bankNameResult] = await db.query(
            `SELECT entity_name, user_id as id FROM superadmin_users WHERE super_user_email = ?`,
            created_by[0].Createdby
        );

        const bankId = bankNameResult[0].id;
        const bankName = bankNameResult[0].entity_name;

        if (!rfpNo || !userName) {
            return res.status(400).send({ message: 'RFP number and username are required' });
        }

        // Handle Functional Scores
        if (functionalScores) {
            const query = `
                INSERT INTO functional_scores (
                    isAvailableChecked, isPartlyAvailableChecked, isCustomizableChecked,
                    availableScore, partlyAvailableScore, customizableScore,
                    mandatoryScore, optionalScore, RFP_No, Bank_Id
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    isAvailableChecked = VALUES(isAvailableChecked),
                    isPartlyAvailableChecked = VALUES(isPartlyAvailableChecked),
                    isCustomizableChecked = VALUES(isCustomizableChecked),
                    availableScore = VALUES(availableScore),
                    partlyAvailableScore = VALUES(partlyAvailableScore),
                    customizableScore = VALUES(customizableScore),
                    mandatoryScore = VALUES(mandatoryScore),
                    optionalScore = VALUES(optionalScore);
            `;
            const values = [
                functionalScores.isAvailableChecked,
                functionalScores.isPartlyAvailableChecked,
                functionalScores.isCustomizableChecked,
                functionalScores.availableScore,
                functionalScores.partlyAvailableScore,
                functionalScores.customizableScore,
                functionalScores.mandatoryScore,
                functionalScores.optionalScore,
                rfpNo,
                bankId
            ];
            await db.query(query, values);
        }

        // Handle Commercial Scores
        if (commercialScores && commercialScores.length > 0) {
            const query = `
                INSERT INTO CommercialScores (
                    CommercialPattern, InternalPercent, From1, To1, Score1,
                    From2, To2, Score2, From3, To3, Score3, RFP_No, Bank_Id
                ) 
                VALUES ?
                ON DUPLICATE KEY UPDATE
                    InternalPercent = VALUES(InternalPercent),
                    From1 = VALUES(From1),
                    To1 = VALUES(To1),
                    Score1 = VALUES(Score1),
                    From2 = VALUES(From2),
                    To2 = VALUES(To2),
                    Score2 = VALUES(Score2),
                    From3 = VALUES(From3),
                    To3 = VALUES(To3),
                    Score3 = VALUES(Score3);
            `;
            const values = commercialScores.map(row => [
                row.CommercialPattern,
                row.InternalPercent,
                row.From1, row.To1, row.Score1,
                row.From2, row.To2, row.Score2,
                row.From3, row.To3, row.Score3,
                rfpNo,
                bankId
            ]);
            await db.query(query, [values]);
        }

        // Handle Overall Scoring
        if (overallScoring) {
            const query = `
                INSERT INTO overall_scoring (
                    functional_items, commercials, implementation_model, no_of_installations,
                    site_visit_reference, others1_title, others1_value,
                    others2_title, others2_value, others3_title, others3_value, RFP_No, Bank_Id
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    functional_items = VALUES(functional_items),
                    commercials = VALUES(commercials),
                    implementation_model = VALUES(implementation_model),
                    no_of_installations = VALUES(no_of_installations),
                    site_visit_reference = VALUES(site_visit_reference),
                    others1_title = VALUES(others1_title),
                    others1_value = VALUES(others1_value),
                    others2_title = VALUES(others2_title),
                    others2_value = VALUES(others2_value),
                    others3_title = VALUES(others3_title),
                    others3_value = VALUES(others3_value);
            `;
            const values = [
                overallScoring.functionalItems,
                overallScoring.commercials,
                overallScoring.implementationModel,
                overallScoring.installations,
                overallScoring.siteVisit,
                overallScoring.others1Title,
                overallScoring.others1,
                overallScoring.others2Title,
                overallScoring.others2,
                overallScoring.others3Title,
                overallScoring.others3,
                rfpNo,
                bankId
            ];
            await db.query(query, values);
        }

        // Handle Sections
        if (sections && sections.length > 0) {
            const tables = [
                "Implementation_Score",
                "No_of_Sites_Score",
                "Site_Reference",
                "Scoring_Items1",
                "Scoring_Items2",
                "Scoring_Items3"
            ];

            for (let index = 0; index < tables.length; index++) {
                const table = tables[index];
                const sectionData = sections[index]?.data;

                if (!sectionData) continue;

                const query = `
                    INSERT INTO ${table} 
                    (Implementation_Model, Score, RFP_No, Bank_Id, Bank_Name, Created_By) 
                    VALUES ? 
                    ON DUPLICATE KEY UPDATE 
                    Score = VALUES(Score),
                    Created_By = VALUES(Created_By);
                `;
                const values = sectionData.map(item => [
                    item.text,
                    item.score,
                    rfpNo,
                    bankId,
                    bankName,
                    userName
                ]);
                await db.query(query, [values]);
            }
        }

        res.status(200).send({ message: 'All data saved successfully!' });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send({ message: 'Error saving data to database', error });
    }
});
// fetching Scoring Criteria
// GET route to fetch data for all scores based on rfpNo and userName
router.get('/get-all-scores', async (req, res) => {
    const { rfpNo, userName } = req.query;

    // Ensure rfpNo and userName are provided
    if (!rfpNo || !userName) {
        return res.status(400).send({ message: 'RFP number and username are required' });
    }

    try {
        // Fetch `created_by` and `bankNameResult` using `userName`
        const [created_by] = await db.query(
            `SELECT Createdby FROM Users_Table WHERE email = ?`,
            [userName]
        );
        const [bankNameResult] = await db.query(
            `SELECT entity_name, user_id as id FROM superadmin_users WHERE super_user_email = ?`,
            created_by[0].Createdby
        );

        const bankId = bankNameResult[0].id;
        const bankName = bankNameResult[0].entity_name;

        // Fetch Functional Scores
        const [functionalScores] = await db.query(
            `SELECT * FROM functional_scores WHERE RFP_No = ? AND Bank_Id = ?`,
            [rfpNo, bankId]
        );

        // Fetch Commercial Scores
        const [commercialScores] = await db.query(
            `SELECT * FROM CommercialScores WHERE RFP_No = ? AND Bank_Id = ?`,
            [rfpNo, bankId]
        );

        // Fetch Overall Scoring
        const [overallScoring] = await db.query(
            `SELECT functional_items as functionalItems,commercials as commercials,implementation_model as implementationModel
            ,no_of_installations as installations,site_visit_reference as siteVisit ,others1_title as others1Title,
            others2_title as others2Title, others3_title as others3Title, others1_value as others1,others2_value as others2,
            others3_value as others3 FROM overall_scoring WHERE RFP_No = ? AND Bank_Id = ?`,
            [rfpNo, bankId]
        );

        // Fetch Section Scores (if applicable)
        const sections = [];
        const tables = [
            "Implementation_Score",
            "No_of_Sites_Score",
            "Site_Reference",
            "Scoring_Items1",
            "Scoring_Items2",
            "Scoring_Items3"
        ];

        for (let table of tables) {
            const [sectionData] = await db.query(
                `SELECT Implementation_Model as text,Score as score FROM ${table} WHERE RFP_No = ? AND Bank_Id = ?`,
                [rfpNo, bankId]
            );
            sections.push({ table, data: sectionData });
        }

        // Send all the results back to the client
        res.status(200).send({
            functionalScores,
            commercialScores,
            overallScoring,
            sections
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send({ message: 'Error retrieving data from database', error });
    }
});
// Scoring Criteria - Ends


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

// Dashboard - Apis
// router.post('/fetchComScores-dashBoard', async (req, res) => {
//     const { rfpNo, userName } = req.body;

//     try {
//         // Fetch the bank name based on userName
//         const [bankNameResult] = await db.query(
//             `SELECT entity_name FROM superadmin_users WHERE super_user_email = ?`, 
//             [userName]
//         );
        
//         if (!bankNameResult || bankNameResult.length === 0) {
//             return res.status(404).send("Bank name not found.");
//         }

//         console.log("RFP No:", rfpNo);
//         console.log("Bank Name:", bankNameResult[0].entity_name);

//         // Fetch commercial scores data
//         const query = `
//             SELECT id, CommercialPattern, InternalPercent, From1, To1, Score1, 
//                    From2, To2, Score2, From3, To3, Score3, Bank_Amount
//             FROM CommercialScores 
//             WHERE RFP_No = ?;
//         `;
        
//         const [commercial] = await db.query(query, [rfpNo]);

//         if (!commercial || commercial.length === 0) {
//             return res.status(404).send("No commercial scores found for the provided RFP No.");
//         }

//         // console.log("Fetched Commercial Scores:", commercial);

//         let totalPercentageScore = 0;
//         let validEntriesCount = 0;

//         commercial.forEach(entry => {
//             const { Bank_Amount, From1, To1, Score1, From2, To2, Score2, 
//                     From3, To3, Score3, InternalPercent } = entry;

//             let calculatedScore = 0;
//             const maxScore = Math.max(Score1, Score2, Score3);

//             if (Bank_Amount >= From1 && Bank_Amount <= To1) {
//                 calculatedScore = Score1;
//             } else if (Bank_Amount >= From2 && Bank_Amount <= To2) {
//                 calculatedScore = Score2;
//             } else if (Bank_Amount >= From3 && Bank_Amount <= To3) {
//                 calculatedScore = Score3;
//             } else {
//                 console.log(`Bank Amount out of range for entry ID: ${entry.id}`);
//                 return;
//             }

//             const percentageScore = (calculatedScore / maxScore) * InternalPercent;
//             totalPercentageScore += percentageScore;
//             validEntriesCount++;
//         });

//         // Calculate average percentage score
//         // let averagePercentageScore = (validEntriesCount > 0) 
//         //     ? totalPercentageScore / validEntriesCount 
//         //     : 0;
//         let averagePercentageScore =totalPercentageScore;

//         console.log(`Average Percentage Score: ${averagePercentageScore}`);
        
//         // Send response with both the data and calculated score
//         res.json({ commercial, averagePercentageScore });

//     } catch (error) {
//         console.error("Error fetching data:", error);
//         res.status(500).send("An error occurred while fetching data.");
//     }
// });

// router.post('/fetchFunctionalScores-dashBoard', async (req, res) => {
//     const { rfpNo, userName } = req.body;

//     try {
//         // Fetch functional scores
//         const query = `
//             SELECT 
//                 isAvailableChecked, isPartlyAvailableChecked, isCustomizableChecked,
//                 availableScore, partlyAvailableScore, customizableScore, mandatoryScore, optionalScore 
//             FROM functional_scores 
//             WHERE RFP_No = ? AND Bank_Id = ?
//         `;
//         const [functionalScore] = await db.query(query, [rfpNo, "Bank"]);

//         if (!functionalScore.length) {
//             return res.status(404).send("No functional scores found.");
//         }

//         let {
//             isAvailableChecked,
//             isPartlyAvailableChecked,
//             isCustomizableChecked,
//             availableScore,
//             partlyAvailableScore,
//             customizableScore,
//             mandatoryScore,
//             optionalScore,
//         } = functionalScore[0];

//         // Adjust scores based on "checked" flags
//         availableScore = isAvailableChecked === 0 ? 0 : availableScore;
//         partlyAvailableScore = isPartlyAvailableChecked === 0 ? 0 : partlyAvailableScore;
//         customizableScore = isCustomizableChecked === 0 ? 0 : customizableScore;

//         // Fetch vendor information
//         const [vendors] = await db.query(`
//             SELECT entity_name, email, admin_name, id 
//             FROM vendor_admin_users 
//             WHERE createdby = ? AND rfp_reference_no = ?
//         `, [userName, rfpNo]);

//         if (!vendors.length) {
//             return res.status(404).send("No vendors found.");
//         }

//         const vendorScores = [];

//         for (const vendor of vendors) {
//             const vendorId = vendor.id;

//             // Fetch functional items for the vendor
//             const queryString2 = `
//                 SELECT 
//                     d.id, d.F1_Code, d.Mandatory, d.deleted, d.Level, 
//                     v.Vendor_Id, v.A, v.P, v.C, v.N, 
//                     v.stage AS vendor_stage, v.Level AS vendor_level, v.Status AS vendor_status 
//                 FROM RFP_FunctionalItem_draft d 
//                 LEFT JOIN RFP_FunctionalItem_Vendor v 
//                     ON d.id = v.rfp_functionalitem_draft_id AND v.Status IS NOT NULL  
//                 WHERE d.RFP_No = ? AND d.F1_Code != "00" AND v.Vendor_Id = ? and v.Status = "Completed"
//             `;

//             const [functionalItems] = await db.query(queryString2, [rfpNo, vendorId]);

//             // Calculate the total score for the vendor
//             let totalScore = 0;
//             let aScore = 0, pScore = 0, cScore = 0;

//             for (const item of functionalItems) {
//                 const isMandatory = item.Mandatory === "M"; // Mandatory flag
//                 const isOptional = item.Mandatory === "O"; // Optional flag

//                 if (item.A === 1 && isMandatory) {
//                     totalScore += availableScore * mandatoryScore;
//                     aScore++;
//                 } else if (item.P === 1 && isMandatory) {
//                     totalScore += partlyAvailableScore * mandatoryScore;
//                     pScore++;
//                 } else if (item.C === 1 && isMandatory) {
//                     totalScore += customizableScore * mandatoryScore;
//                     cScore++;
//                 } else if (item.A === 1 && isOptional) {
//                     totalScore += availableScore * optionalScore;
//                     aScore++;
//                 } else if (item.P === 1 && isOptional) {
//                     totalScore += partlyAvailableScore * optionalScore;
//                     pScore++;
//                 } else if (item.C === 1 && isOptional) {
//                     totalScore += customizableScore * optionalScore;
//                     cScore++;
//                 }
//             }
//             vendorScores.push({
//                 vendorId,
//                 totalScore
//             });
//         }
//         res.json(vendorScores);
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         res.status(500).send("An error occurred while fetching data.");
//     }
// });

router.post('/fetchScores-dashBoard', async (req, res) => {
    console.log("fetchScores-dashBoard")
    const { rfpNo, userName } = req.body;

    try {
        // Fetch bank name
        const [bankNameResult] = await db.query(
            `SELECT entity_name FROM superadmin_users WHERE super_user_email = ?`, 
            [userName]
        );
        const [rows] = await db.query(`select entity_name,email,admin_name,id from 
            vendor_admin_users where createdby= ?`, [userName]);  
        console.log(rows)
        

        if (!bankNameResult || bankNameResult.length === 0) {
             console.error("Bank name not found.");
            return res.status(404).send("Bank name not found.");
        }

        const bankName = bankNameResult[0].entity_name;

        console.log("RFP No:", rfpNo);
        console.log("Bank Name:", bankName);

        const [vendors] = await db.query(`
            SELECT entity_name, email, admin_name, id 
            FROM vendor_admin_users 
            WHERE createdby = ? AND rfp_reference_no = ?;
        `, [userName, rfpNo]);

        if (!vendors.length) {
           console.error("No vendors found.");
            return res.status(404).send("No vendors found.");
        }

        const vendorScores = [];

        for (const vendor of vendors) {
        // Fetch commercial scores
        const commercialQuery = `
            SELECT id, CommercialPattern, InternalPercent, From1, To1, Score1, 
                   From2, To2, Score2, From3, To3, Score3, Bank_Amount
            FROM CommercialScores 
            WHERE RFP_No = ?;
        `;
        const [commercialScores] = await db.query(commercialQuery, [rfpNo]);

        if (!commercialScores || commercialScores.length === 0) {
            console.error("No commercial scores found for the provided RFP No.");
            return res.status(404).send("No commercial scores found for the provided RFP No.");
        }

        let totalPercentageScore = 0;

        commercialScores.forEach(entry => {
            const { Bank_Amount, From1, To1, Score1, From2, To2, Score2, From3, To3, Score3, InternalPercent } = entry;
            const maxScore = Math.max(Score1, Score2, Score3);
            let calculatedScore = 0;

            if (Bank_Amount >= From1 && Bank_Amount <= To1) {
                calculatedScore = Score1;
            } else if (Bank_Amount >= From2 && Bank_Amount <= To2) {
                calculatedScore = Score2;
            } else if (Bank_Amount >= From3 && Bank_Amount <= To3) {
                calculatedScore = Score3;
            }

            if (calculatedScore > 0) {
                totalPercentageScore += (calculatedScore / maxScore) * InternalPercent;
            }
        });

        // Fetch functional scores
        const functionalQuery = `
            SELECT 
                isAvailableChecked, isPartlyAvailableChecked, isCustomizableChecked,
                availableScore, partlyAvailableScore, customizableScore, mandatoryScore, optionalScore 
            FROM functional_scores 
            WHERE RFP_No = ? AND Bank_Id = ?;
        `;
        const [functionalScores] = await db.query(functionalQuery, [rfpNo, bankNameResult.user_id]);

        if (!functionalScores.length) {
             console.error("No functional scores found.");
            return res.status(404).send("No functional scores found.");
        }

        let {
            isAvailableChecked,
            isPartlyAvailableChecked,
            isCustomizableChecked,
            availableScore,
            partlyAvailableScore,
            customizableScore,
            mandatoryScore,
            optionalScore,
        } = functionalScores[0];

        availableScore = isAvailableChecked === 0 ? 0 : availableScore;
        partlyAvailableScore = isPartlyAvailableChecked === 0 ? 0 : partlyAvailableScore;
        customizableScore = isCustomizableChecked === 0 ? 0 : customizableScore;

        
            const vendorId = vendor.id;

            const functionalItemQuery = `
                SELECT 
                    d.id, d.F1_Code, d.Mandatory, d.deleted, d.Level, 
                    v.Vendor_Id, v.A, v.P, v.C, v.N, 
                    v.stage AS vendor_stage, v.Level AS vendor_level, v.Status AS vendor_status 
                FROM RFP_FunctionalItem_draft d 
                LEFT JOIN RFP_FunctionalItem_Vendor v 
                    ON d.id = v.rfp_functionalitem_draft_id AND v.Status IS NOT NULL  
                WHERE d.RFP_No = ? AND d.F1_Code != "00" AND v.Vendor_Id = ? AND v.Status = "Completed";
            `;
            const [functionalItems] = await db.query(functionalItemQuery, [rfpNo, vendorId]);

            let totalScore = 0;

            functionalItems.forEach(item => {
                const isMandatory = item.Mandatory === "M";
                const isOptional = item.Mandatory === "O";

                if (item.A === 1 && isMandatory) {
                    totalScore += availableScore * mandatoryScore;
                } else if (item.P === 1 && isMandatory) {
                    totalScore += partlyAvailableScore * mandatoryScore;
                } else if (item.C === 1 && isMandatory) {
                    totalScore += customizableScore * mandatoryScore;
                } else if (item.A === 1 && isOptional) {
                    totalScore += availableScore * optionalScore;
                } else if (item.P === 1 && isOptional) {
                    totalScore += partlyAvailableScore * optionalScore;
                } else if (item.C === 1 && isOptional) {
                    totalScore += customizableScore * optionalScore;
                }
            });

            vendorScores.push({ vendorId, totalScore });
        }

        res.json({
            commercialScores,
            totalPercentageScore,
            functionalScores: vendorScores,
            rows
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("An error occurred while fetching data.");
    }
});


// Scoring Criteria Fetching Values 
router.post('/fetchAllScores', async (req, res) => {
    const { rfpNo, userName } = req.body; // Accessing JSON data directly
    const tables = [
        "Implementation_Score",
        "No_of_Sites_Score",
        "Site_Reference",
        "Scoring_Items1",
        "Scoring_Items2",
        "Scoring_Items3"
    ];

    try {
        // Fetch RFP number and Bank Name
        // const [rfpNoResult] = await db.query(`SELECT rfp_reference_no FROM vendor_admin_users WHERE id = ?`, [id]);
        const [bankNameResult] = await db.query(`SELECT entity_name FROM superadmin_users WHERE 
            super_user_email = ?`, [userName]);

        // const rfpNo = rfpNoResult[0]?.rfp_reference_no;
        const bankName = bankNameResult[0]?.entity_name;

        if (!rfpNo) {
            return res.status(400).json({ message: "RFP number not found" });
        }

        // Fetch Overall Scores
        const [overallScores] = await db.query(`SELECT * FROM overall_scoring WHERE RFP_No = ?
             AND Bank_Id = ?`, [rfpNo, bankName]);

        // Fetch Functional Scores
        const [functionalScores] = await db.query(`SELECT * FROM functional_scores WHERE RFP_No = ? 
            AND Bank_Id = ?`, [rfpNo, bankName]);

        // Fetch Commercial Scores
        const [commercialScores] = await db.query(`
            SELECT CommercialPattern, InternalPercent, From1, To1, Score1, From2, To2, Score2, From3, To3, Score3 
            FROM CommercialScores WHERE RFP_No = ? AND Bank_Id = ?`, [rfpNo, bankName]);
        // Fetch Scores from Multiple Tables
        let scores = {};
        for (const table of tables) {
            const [rows] = await db.query(`SELECT Implementation_Model, Score FROM ${table} WHERE RFP_No = ? AND Bank_Id = ?`, [rfpNo, bankName]);
            if (rows.length > 0) {
                scores[table] = rows.map(row => ({
                    Implementation_Model: row.Implementation_Model,
                    Score: row.Score
                }));
            }
        }

        // Combine Results
        const combinedResponse = {
            overallScores,
            functionalScores,
            commercialScores,
            scores
        };

        res.status(200).json(combinedResponse);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Error fetching data from database." });
    }
});


module.exports = router;
