const express = require('express');
const router = express.Router();


const urlController = require('../controllers/urlController')


router.post('/kuchbhi',urlController.createUrl)

module.exports = router;


