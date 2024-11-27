// src/routes/index.js
const express = require('express');
const router = express.Router();

router.get('/api', (req, res) => {
    res.json({ message: 'Hello from the API!' });

       // Log the final nested structure
        // console.log(JSON.stringify(data, null, 2)); // Pretty print the data object


        // console.log("checkedItems: "+checkedItems)
        // // Logic to process checkedItems and fetch item details
        // // Example: const itemDetails = await fetchDetails(checkedItems);
        // const [result] = await db.query(
        //                 `SELECT L1_Code FROM rfp_l1_modules WHERE L1_Module_Description IN (?)`,
        //                 [checkedItems]
        //             );
        //             // Extract L1_Code values into an array
        //             const l1Codes = result.map(row => row.L1_Code);
        //             console.log("L1 Code : "+l1Codes);
        //             // Run the second query using the extracted L1_Code values in the IN clause
        //             //02/11/2024
        //             // const [rows] = await db.query(
        //             //     `SELECT Description as name FROM RFPItemDetails WHERE ML1 IN (?) and ML2!=""`,
        //             //     [l1Codes]
        //             // );
        //             // Assuming l1Codes is an array of prefix strings
        //             // Assuming l1Codes is an array of prefix strings
        //             const placeholders = l1Codes.map(() => `L2_Code LIKE CONCAT(?, '%')`).join(" OR ");
        //             const queryString = `SELECT L2_Description AS name, L2_Code FROM RFP_L2_Modules WHERE ${placeholders}`;

        //             // Execute the query with all l1Codes as parameters
        //             const [l2Result] = await db.query(queryString, l1Codes);


        //             // const [l2Result] = await db.query(
        //             //     `SELECT L2_Description AS name,L2_Code FROM RFP_L2_Modules WHERE L2_Code LIKE CONCAT(?, '%')`,
        //             //     [l1Codes]
        //             // );                    
        //             console.log(l2Result)
        //             const l2Codes = l2Result.map(row => row.L2_Code);
        //             // console.log("L2 Code : "+l2Codes);
        //             const placeholders1 = l2Codes.map(() => `L3_Code LIKE CONCAT(?, '%')`).join(" OR ");
        //             const queryString1 = `SELECT L3_Description AS name, L3_Code FROM RFP_L3_Modules WHERE ${placeholders1}`;

        //             // Execute the query with all l1Codes as parameters
        //             const [l3Result] = await db.query(queryString1, l2Codes);
        //             // const [l3Result] = await db.query(
        //             //     `SELECT L3_Description AS name,L3_Code FROM RFP_L3_Modules WHERE L3_Code LIKE CONCAT(?, '%')`,
        //             //     [l2Codes]
        //             // );  
        //             console.log(l3Result);


        // console.log(rowsL3)
        // const { ML1, ML2 } = result[0]; // Assuming result contains at least one row


        // const [rows] = await db.query(
        //     `SELECT Description as name FROM RFPItemDetails WHERE ML1 = ? AND ML2 = ?`, 
        //     [ML1, moduleName2]
        // );

});


http://localhost:3000/api/products/itemDetails
// router.get('/products/:checkedItems/itemDetails', async(req, res) => {
//     // const checkedItems = req.params.checkedItems;
//     // console.log(checkedItems);
//     console.log("Inside ItemDetails");


//     try {
//         console.log("Inside ItemDetails");
//         // Use parameterized query to prevent SQL injection
//         const [result] = await db.query(
//             `SELECT L1_Code FROM rfp_l1_modules WHERE L1_Module_Description IN (?, ?)`,
//             [description1, description2]
//         );
//         // Extract L1_Code values into an array
//         const l1Codes = result.map(row => row.L1_Code);

//         // Run the second query using the extracted L1_Code values in the IN clause
//         const [rows] = await db.query(
//             `SELECT Description as name FROM RFPItemDetails WHERE ML1 IN (?)`,
//             [l1Codes]
//         );

//         // const { ML1, ML2 } = result[0]; // Assuming result contains at least one row


//         // const [rows] = await db.query(
//         //     `SELECT Description as name FROM RFPItemDetails WHERE ML1 = ? AND ML2 = ?`, 
//         //     [ML1, moduleName2]
//         // );

//         // Check if any sub-items were returned
//         if (rows.length > 0) {
//             res.json(rows);
//         } else {
//             res.status(404).json({ error: "No sub-items found for this module" });
//         }
//     } catch (error) {
//         console.error("Error fetching sub-items:", error);
//         res.status(500).json({ error: "An error occurred while fetching sub-items" });
//     }
// });


module.exports = router;
