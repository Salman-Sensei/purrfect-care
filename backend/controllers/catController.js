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

module.exports = { getCats, getCat, createCat, updateCat, deleteCat };
