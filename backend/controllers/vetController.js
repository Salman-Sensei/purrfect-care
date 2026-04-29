const VetRecord = require('../models/VetRecord');

// @desc    Get all vet records for user
// @route   GET /api/vet
// @access  Private
const getVetRecords = async (req, res) => {
  try {
    const { catId } = req.query;
    const query = { userId: req.user._id };
    if (catId) query.catId = catId;

    const records = await VetRecord.find(query)
      .populate('catId', 'name')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch vet records' });
  }
};

// @desc    Create vet record
// @route   POST /api/vet
// @access  Private
const createVetRecord = async (req, res) => {
  try {
    const { catId, date, type, vetName, clinic, notes, nextVisitDate } = req.body;

    if (!catId || !date || !type) {
      return res.status(400).json({ message: 'Cat, date, and type are required' });
    }

    const record = await VetRecord.create({
      userId: req.user._id,
      catId, date, type, vetName, clinic, notes, nextVisitDate,
    });

    const populated = await record.populate('catId', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create vet record' });
  }
};

// @desc    Update vet record
// @route   PUT /api/vet/:id
// @access  Private
const updateVetRecord = async (req, res) => {
  try {
    const record = await VetRecord.findOne({ _id: req.params.id, userId: req.user._id });
    if (!record) return res.status(404).json({ message: 'Vet record not found' });

    const fields = ['date', 'type', 'vetName', 'clinic', 'notes', 'nextVisitDate'];
    fields.forEach(f => { if (req.body[f] !== undefined) record[f] = req.body[f]; });

    const updated = await record.save();
    await updated.populate('catId', 'name');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update vet record' });
  }
};

// @desc    Delete vet record
// @route   DELETE /api/vet/:id
// @access  Private
const deleteVetRecord = async (req, res) => {
  try {
    const record = await VetRecord.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!record) return res.status(404).json({ message: 'Vet record not found' });
    res.json({ message: 'Vet record deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete vet record' });
  }
};

module.exports = { getVetRecords, createVetRecord, updateVetRecord, deleteVetRecord };
