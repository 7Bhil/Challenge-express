const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

// Routes protégées (nécessitent authentification)
router.post('/', protect, submissionController.createSubmission);
router.get('/my-submissions', protect, submissionController.getUserSubmissions);
router.get('/', protect, submissionController.getAllSubmissions);
router.get('/:id', protect, submissionController.getSubmissionById);

// Routes pour le jury
router.post('/:submissionId/score', protect, submissionController.scoreSubmission);
router.patch('/:id/approve', protect, submissionController.approveSubmission);
router.patch('/:id/reject', protect, submissionController.rejectSubmission);

module.exports = router;
