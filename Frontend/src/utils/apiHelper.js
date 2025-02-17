// src/utils/apiHelper.js
export const fetchAPCNData = async (API_URL, userName, rfpNo, userPower) => {
    try {
      const response = await fetch(
        `${API_URL}/fetchAPCN?userName=${userName}&rfpNo=${rfpNo}&userPower=${userPower}`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching APCN data:", error);
      return null;
    }
  };
  