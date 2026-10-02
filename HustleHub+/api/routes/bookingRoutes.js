const express = require('express');
const { createBooking, getMyBookings, updateBookingStatus } = require('../controllers/bookingController');
const verifyToken = require('../middleware/verifyToken');
const { bookingLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/', verifyToken, bookingLimiter, createBooking);
router.get('/', verifyToken, getMyBookings);
router.put('/:id/status', verifyToken, updateBookingStatus);

module.exports = router;
