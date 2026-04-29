const express = require('express');
const router = express.Router();
const { getVetRecords, createVetRecord, updateVetRecord, deleteVetRecord } = require('../controllers/vetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getVetRecords).post(createVetRecord);
router.route('/:id').put(updateVetRecord).delete(deleteVetRecord);

module.exports = router;
