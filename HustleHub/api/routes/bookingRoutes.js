const express = require('express');
const { createBooking, getMyBookings, updateBookingStatus } = require('../controllers/bookingController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const { bookingLimiter } = require('../middleware/rateLimiters');
const { validateBooking, validateBookingStatus } = require('../middleware/validation');

const router = express.Router();

// Only clients book. The role check runs before bookingLimiter so a wrong-role request is
// refused without using up a booking slot; bookingLimiter must stay after verifyToken
// because it counts per req.user.id.
router.post('/', verifyToken, authorizeRoles('client'), bookingLimiter, validateBooking, createBooking);

// Freelancers need these too: they see bookings of their gigs and confirm/complete them.
// The controller decides which moves each side of a booking may make.
router.get('/', verifyToken, authorizeRoles('client', 'freelancer'), getMyBookings);
router.put('/:id/status', verifyToken, authorizeRoles('client', 'freelancer'), validateBookingStatus, updateBookingStatus);

module.exports = router;
