// src/utils/fileUploadHelper.js
export const handleFileUpload = (event, setFile, setFileURL) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileURL(URL.createObjectURL(uploadedFile));
    }
  };
  
  export const handleFileDownload = (file, fileURL) => {
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  