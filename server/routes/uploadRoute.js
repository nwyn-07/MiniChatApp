const express = require('express');
const router = express.Router();
const path = require('path');
const { uploadImage, uploadExcel } = require('../utils/upload');

router.post('/one_file', uploadImage.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'File cannot be empty' });
    }
    res.status(201).json({
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
    });
});

router.post('/multiple_file', uploadImage.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Files cannot be empty' });
    }
    res.status(201).json(
        req.files.map((f) => ({
            filename: f.filename,
            path: f.path,
            size: f.size,
        }))
    );
});

router.get('/:filename', (req, res) => {
    const pathFile = path.join(__dirname, '../uploads', req.params.filename);
    res.sendFile(pathFile);
});

router.post('/excel', uploadExcel.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Excel file cannot be empty' });
    }
    res.status(201).json({
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
    });
});

module.exports = router;
