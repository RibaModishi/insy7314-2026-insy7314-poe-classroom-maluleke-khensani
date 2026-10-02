const express = require('express');
const {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig
} = require('../controllers/gigController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/', verifyToken, createGig);
router.get('/', getGigs);
router.get('/:id', getGigById);
router.put('/:id', verifyToken, updateGig);
router.delete('/:id', verifyToken, deleteGig);

module.exports = router;
