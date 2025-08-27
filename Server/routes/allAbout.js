const express = require('express');
const router = express.Router();
const AllAboutData = require('../models/AllAboutData');
const { validateId } = require('../middleware/validation');
const { updateLimiter } = require('../middleware/rateLimiter');

// Get all "All About" data
router.get('/', async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const allAboutData = await AllAboutData.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await AllAboutData.countDocuments(query);
    
    res.json({
      success: true,
      data: allAboutData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching All About data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching All About data'
    });
  }
});

// Get specific "All About" data by ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const allAboutData = await AllAboutData.findById(id);
    
    if (!allAboutData) {
      return res.status(404).json({
        success: false,
        message: 'All About data not found'
      });
    }
    
    res.json({
      success: true,
      data: allAboutData
    });
  } catch (error) {
    console.error('Error fetching All About data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching All About data'
    });
  }
});

// Update "All About" data
router.put('/:id', updateLimiter, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allAboutData = await AllAboutData.findById(id);
    if (!allAboutData) {
      return res.status(404).json({
        success: false,
        message: 'All About data not found'
      });
    }
    
    // Update fields
    Object.keys(updates).forEach(field => {
      if (allAboutData[field]) {
        allAboutData[field] = {
          ...allAboutData[field],
          ...updates[field]
        };
      }
    });
    
    allAboutData.updatedAt = new Date();
    await allAboutData.save();
    
    res.json({
      success: true,
      data: allAboutData,
      message: 'All About data updated successfully'
    });
  } catch (error) {
    console.error('Error updating All About data:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating All About data'
    });
  }
});

// Delete "All About" data
router.delete('/:id', validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const allAboutData = await AllAboutData.findByIdAndDelete(id);
    
    if (!allAboutData) {
      return res.status(404).json({
        success: false,
        message: 'All About data not found'
      });
    }
    
    res.json({
      success: true,
      message: 'All About data deleted successfully',
      data: { deletedId: id, deletedName: allAboutData.name.value }
    });
  } catch (error) {
    console.error('Error deleting All About data:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting All About data'
    });
  }
});

module.exports = router;