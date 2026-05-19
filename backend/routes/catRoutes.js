const express = require('express');
const router = express.Router();
const { getCats, getCat, createCat, updateCat, deleteCat, toggleShare, getSharedCat } = require('../controllers/catController');
const { protect } = require('../middleware/authMiddleware');

// ── Public route (no auth) ───────────────────────────────────────────────────
router.get('/shared/:token', getSharedCat);

// ── Protected routes ─────────────────────────────────────────────────────────
router.use(protect);

router.route('/').get(getCats).post(createCat);
router.route('/:id').get(getCat).put(updateCat).delete(deleteCat);
router.post('/:id/share', toggleShare);

module.exports = router;
