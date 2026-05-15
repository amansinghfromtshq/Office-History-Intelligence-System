const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');

/**
 * Extract text content from uploaded files
 * Supports: PDF, DOCX, XLSX, TXT
 */
async function extractText(filePath, mimeType) {
    try {
        if (mimeType === 'application/pdf') {
            return await extractFromPDF(filePath);
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return await extractFromDOCX(filePath);
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   mimeType === 'application/vnd.ms-excel') {
            return await extractFromXLSX(filePath);
        } else if (mimeType === 'text/plain') {
            return await extractFromTXT(filePath);
        } else {
            throw new Error(`Unsupported file type: ${mimeType}`);
        }
    } catch (err) {
        console.error('Text extraction error:', err.message);
        throw err;
    }
}

async function extractFromPDF(filePath) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
}

async function extractFromDOCX(filePath) {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
}

async function extractFromXLSX(filePath) {
    const workbook = XLSX.readFile(filePath);
    let text = '';
    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        text += `Sheet: ${sheetName}\n${csv}\n\n`;
    });
    return text;
}

async function extractFromTXT(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

module.exports = { extractText };
