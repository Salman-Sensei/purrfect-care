const Cat = require('../models/Cat');

// @desc    Get all cats for user
// @route   GET /api/cats
// @access  Private
const getCats = async (req, res) => {
  try {
    const cats = await Cat.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(cats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cats' });
  }
};

// @desc    Get single cat
// @route   GET /api/cats/:id
// @access  Private
const getCat = async (req, res) => {
  try {
    const cat = await Cat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cat) return res.status(404).json({ message: 'Cat not found' });
    res.json(cat);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cat' });
  }
};

// @desc    Create cat
// @route   POST /api/cats
// @access  Private
const createCat = async (req, res) => {
  try {
    const { name, age, breed, weight, healthConditions, allergies, notes, image, color } = req.body;

    if (!name || !age) {
      return res.status(400).json({ message: 'Name and age are required' });
    }
    if (name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
    }
    if (age.trim().length > 20) {
      return res.status(400).json({ message: 'Age description is too long' });
    }
    const numericAge = parseFloat(age);
    if (!isNaN(numericAge) && !/[a-zA-Z]/.test(age)) {
      if (numericAge < 0 || numericAge > 30) {
        return res.status(400).json({ message: 'Age must be between 0 and 30 years' });
      }
    }
    if (weight !== undefined && weight !== null && weight !== '') {
      const w = parseFloat(weight);
      if (isNaN(w) || w < 0 || w > 30) {
        return res.status(400).json({ message: 'Weight must be between 0 and 30 kg' });
      }
    }

    const cat = await Cat.create({
      userId: req.user._id,
      name, age, breed, weight, healthConditions, allergies, notes, image, color,
    });

    res.status(201).json(cat);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create cat' });
  }
};

// @desc    Update cat
// @route   PUT /api/cats/:id
// @access  Private
const updateCat = async (req, res) => {
  try {
    const cat = await Cat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cat) return res.status(404).json({ message: 'Cat not found' });

    const fields = ['name', 'age', 'breed', 'weight', 'healthConditions', 'allergies', 'notes', 'image', 'color'];
    fields.forEach(f => { if (req.body[f] !== undefined) cat[f] = req.body[f]; });

    const updated = await cat.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cat' });
  }
};

// @desc    Delete cat
// @route   DELETE /api/cats/:id
// @access  Private
const deleteCat = async (req, res) => {
  try {
    const cat = await Cat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!cat) return res.status(404).json({ message: 'Cat not found' });
    res.json({ message: 'Cat removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete cat' });
  }
};

// @desc    Toggle sharing — generates or revokes a share token
// @route   POST /api/cats/:id/share
// @access  Private
const toggleShare = async (req, res) => {
  try {
    const cat = await Cat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cat) return res.status(404).json({ message: 'Cat not found' });

    if (cat.isShared) {
      // Revoke sharing
      cat.isShared    = false;
      cat.shareToken  = null;
    } else {
      // Generate a random token
      const { randomBytes } = require('crypto');
      cat.shareToken  = randomBytes(20).toString('hex');
      cat.isShared    = true;
    }

    const updated = await cat.save();
    res.json({ isShared: updated.isShared, shareToken: updated.shareToken });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update sharing' });
  }
};

// @desc    Get public cat profile by share token (no auth)
// @route   GET /api/cats/shared/:token
// @access  Public
const getSharedCat = async (req, res) => {
  try {
    const cat = await Cat.findOne({ shareToken: req.params.token, isShared: true })
      .select('-userId');  // don't expose owner ID
    if (!cat) return res.status(404).json({ message: 'Profile not found or sharing has been disabled' });
    res.json(cat);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shared profile' });
  }
};

module.exports = { getCats, getCat, createCat, updateCat, deleteCat, toggleShare, getSharedCat };
