const express = require('express');
const {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig
} = require('../controllers/gigController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validateGigCreate, validateGigUpdate, validateGigId } = require('../middleware/validation');

const router = express.Router();

// Browsing stays public so clients (and visitors) can find gigs before they log in.
router.get('/', getGigs);
router.get('/:id', validateGigId, getGigById);

// Only freelancers create gigs. Editing and deleting is also open to admins for moderation;
// the controller's ownership check still limits a freelancer to their own gigs.
router.post('/', verifyToken, authorizeRoles('freelancer'), validateGigCreate, createGig);
router.put('/:id', verifyToken, authorizeRoles('freelancer', 'admin'), validateGigId, validateGigUpdate, updateGig);
router.delete('/:id', verifyToken, authorizeRoles('freelancer', 'admin'), validateGigId, deleteGig);

module.exports = router;
