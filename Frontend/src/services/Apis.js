
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const sendCheckedItems = async (checkedItems) => {
    try {
        const response = await fetch('/api/products/itemDetails', {
            method: 'POST', // Use POST method
            headers: {
                'Content-Type': 'application/json', // Specify the content type
            },
            body: JSON.stringify({ checkedItems }), // Convert checkedItems to JSON
        });

        // Check if the response is okay (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response
        console.log(data); // Handle the fetched data as needed
        return data;
    } catch (error) {
        console.error('Error sending checked items:', error); // Log any errors
    }
};

export default sendCheckedItems;

export const handleSave = async ({module,items,rfp_no,rfp_title,stage}) => {
    // console.log(module);
    // console.log(items);
    // setGlobalFItems(items);
    try {
        const response = await fetch(`${API_URL}/api/insertFItem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({module,items,rfp_no,rfp_title,stage})
        });
        const data = await response.json();
        console.log('Data saved successfully:', data);
    } catch (error) {
        console.error('Error saving data:', error);
    }
};
// export const handleFetch = async (rfpNo) => {
//     try {
//         const response = await fetch(`/api/fetchFItem?rfpNo=${encodeURIComponent(rfpNo)}`);
        
//          // Check if the response is okay
//          if (!response.ok) {
//             throw new Error('Failed to retrieve module data');
//         }const data = await response.json();
//         console.log('Data Fetched successfully:', data.data);
//         return data.data;
//     } catch (error) {
//         console.error('Error Fetching data:', error);
//     }
// };

// export const fetchModuleData = async (rfpNo) => {
//     try {
//         // Construct the URL with query parameters
//         const response = await fetch(`/api/getModuleData?rfpNo=${encodeURIComponent(rfpNo)}`);

//         // Check if the response is okay
//         if (!response.ok) {
//             throw new Error('Failed to retrieve module data');
//         }
//         const data = await response.json();
//         console.log('Data Fetched successfully:', data);
//         return data;
//     } catch (error) {
//         console.error('Error Fetching data:', error);
//     }
// };

export const fetchModuleandFitemData = async (rfpNo) => {
    try {
        // Construct the URL with query parameters
       
        const response = await fetch(`${API_URL}/api/getSavedData?rfpNo=${encodeURIComponent(rfpNo)}`);
        // Check if the response is okay
        if (!response.ok) {
            throw new Error('Failed to retrieve module data');
        }
        const data = await response.json();
        console.log('Data Fetched successfully:', data);
        return data;
    } catch (error) {
        console.error('Error Fetching data:', error);
    }
};
