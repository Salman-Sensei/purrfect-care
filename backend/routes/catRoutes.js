const express = require('express');
const router = express.Router();
const { getCats, getCat, createCat, updateCat, deleteCat } = require('../controllers/catController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getCats).post(createCat);
router.route('/:id').get(getCat).put(updateCat).delete(deleteCat);

module.exports = router;
