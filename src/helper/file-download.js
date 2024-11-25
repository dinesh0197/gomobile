const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { error, success } = require('./api-response');

exports.downloadSampleFile = async () => {
    const fileName = "sampleAgreement.pdf";
    const filePath = path.join(__dirname, '../upload/sample');
    let obj = {
        "filePath" : filePath,
        "fileName" : fileName
    }
    return obj;
};
exports.downloadFile = async (fileName) => {
    const filePath = path.join(__dirname, '../upload/',fileName);
    return filePath;
};
exports.convertBase64 = async (filepath) => {
    const file = fs.readFileSync(filepath)
    const base64String = Buffer.from(file).toString('base64')
    return base64String;
};

