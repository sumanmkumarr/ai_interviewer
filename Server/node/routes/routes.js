const express = require('express');
const authController = require('../controllers/authcontroller');

const router = express.Router();

router.post('/store_candidate', authController.storeCandidate);
router.post('/update_interview_data', authController.updateInterviewData);
router.post('/saveinterviewdata', authController.saveInterviewData);

module.exports = router;