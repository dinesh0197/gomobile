const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { error, success } = require('./api-response');

exports.uploadMultipleFile = async (destination, files, maxCount) => {
    // Multer storage     
    if (!fs.existsSync(destination)) {
        try {
            fs.mkdirSync(destination, { recursive: true });
    
            // Set permissions for the directory
            fs.chmodSync(destination, 0o755); // Set permissions to rwxr-xr-x
        } catch (err) {
            return error(`Error creating directory: ${err.message}.`, 400);
            // Handle any errors that occur during directory creation
        }
    }

    // Check if no files were uploaded
    if (!files || files.length === 0) {
        return error("No files were uploaded.", 400);
    }

    // Check if the number of uploaded files exceeds the maximum count
    if (files.length > maxCount) {
        return error(`Exceeded maximum allowed files count of ${maxCount}.`, 400);
    }

    try {
        const uploadedFilePaths = []; // Array to store the paths of uploaded files
    
        // Map each file to a promise that writes it to the server
        const fileWritePromises = files.map(async file => {
            const fsize = file.size;
            const file1 = Math.round((fsize / 1024));
            // The size of the file.
            if (file1 > (1024 * 1024 * 1024)) {
                throw new Error("File too large, please select a file smaller than 1gb");
            }
            // Array of allowed files
            const array_of_allowed_files = ['png', 'jpeg', 'jpg', 'gif', 'pdf', 'doc', 'docx'];
    
            // Get the extension of the uploaded file
            const file_extension = file.originalname.slice(
                ((file.originalname.lastIndexOf('.') - 1) >>> 0) + 2
            );
    
            // Check if the uploaded file is allowed
            if (!array_of_allowed_files.includes(file_extension)) {
                throw new Error("Invalid file format");
            }
    
            const fileName = Date.now() + file.originalname;
            const filePath = path.join(destination, fileName);
    
            // Save the file to the server
            await fs.promises.writeFile(filePath, file.buffer);
    
            // Store the path of the uploaded file
            uploadedFilePaths.push(filePath);
        });
    
        // Await all the file write promises
        await Promise.all(fileWritePromises);
        
        // All files uploaded successfully, send the paths in the response
        return success("All files uploaded successfully.", uploadedFilePaths, 200);
    } catch (err) {
        return error(`Error saving file. ${err.message}.`, 400);
    }    
};

exports.uploadSingleFile = async (destination, file) => {
    // Multer storage     
    if (!fs.existsSync(destination)) {
        try {
            fs.mkdirSync(destination, { recursive: true });
    
            // Set permissions for the directory
            fs.chmodSync(destination, 0o755); // Set permissions to rwxr-xr-x
        } catch (err) {
            return error(`Error creating directory: ${err.message}.`, 400);
            // Handle any errors that occur during directory creation
        }
    }

    // Check if no files were uploaded
    if (!file || file.length === 0) {
        return error("No files were uploaded.", 400);
    } 

    try {
        const fsize = file.size;
        const file1 = Math.round((fsize / 1024));
        // The size of the file.
        if (file1 > (1024 * 1024 * 1024)) {
            throw new Error("File too large, please select a file smaller than 1gb");
        }
        // Array of allowed files
        const array_of_allowed_files = ['png', 'jpeg', 'jpg', 'gif', 'pdf', 'doc', 'docx'];

        // Get the extension of the uploaded file
        const file_extension = file.originalname.slice(
            ((file.originalname.lastIndexOf('.') - 1) >>> 0) + 2
        );

        // Check if the uploaded file is allowed
        if (!array_of_allowed_files.includes(file_extension)) {
            throw new Error("Invalid file format");
        }

        const fileName = Date.now() + file.originalname;
        const filePath = path.join(destination, fileName);

        // Save the file to the server
        await fs.promises.writeFile(filePath, file.buffer);
        // All files uploaded successfully, send the paths in the response
        return success("All files uploaded successfully.", filePath, 200);
    } catch (err) {
        return error(`Error saving file. ${err.message}.`, 400);
    }    
};

