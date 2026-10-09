const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Gig = require('../models/Gig');
const Transaction = require('../models/Transaction');
const { assertOwnership, ownershipFilter } = require('../utils/ownership');

// Who may move a booking between which states. Anything not listed is rejected.
const ALLOWED_TRANSITIONS = {
  freelancer: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled']
  },
  client: {
    pending: ['cancelled'],
    confirmed: ['cancelled']
  }
};

const createBooking = async (req, res) => {
  const { gigId } = req.body || {};

  if (!gigId) {
    throw new Error('Gig id is required');
  }
  if (!mongoose.Types.ObjectId.isValid(gigId)) {
    throw new Error('Invalid gig id');
  }

  const gig = await Gig.findById(gigId);
  if (!gig) {
    throw new Error('Gig not found');
  }

  if (gig.freelancer.toString() === req.user.id) {
    throw new Error('You cannot book your own gig');
  }

  // Booking and its payment are written in one database transaction, so a failure
  // can never leave a booking without a payment record (or a payment without a booking).
  // Client comes from the token and amount/freelancer from the gig, never from the body.
  const result = await mongoose.connection.transaction(async (session) => {
    const [booking] = await Booking.create(
      [{ gig: gig._id, client: req.user.id, freelancer: gig.freelancer, amount: gig.price }],
      { session }
    );
    const [transaction] = await Transaction.create(
      [{ booking: booking._id, client: req.user.id, freelancer: gig.freelancer, amount: booking.amount }],
      { session }
    );
    return { booking, transaction };
  });

  res.status(201).json(result);
};

const getMyBookings = async (req, res) => {
  // Only bookings the caller is part of, so nobody can list other users' bookings.
  const bookings = await Booking.find(ownershipFilter(req.user.id, ['client', 'freelancer']))
    .populate('gig', 'title price category')
    // Only names are populated, so passwordHash and emails never leave the server here.
    .populate('client', 'name')
    .populate('freelancer', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(bookings);
};

const updateBookingStatus = async (req, res) => {
  const { status } = req.body || {};

  if (!status) {
    throw new Error('Status is required');
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new Error('Invalid booking id');
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    throw new Error('Booking not found');
  }

  // Side is decided by the booking itself, not the token's role, so a user can only act
  // as the party they actually are on this booking.
  const side = assertOwnership(booking, req.user, ['freelancer', 'client'], 'You are not part of this booking');

  const allowed = ALLOWED_TRANSITIONS[side][booking.status] || [];
  if (!allowed.includes(status)) {
    throw new Error(`Cannot change booking from ${booking.status} to ${status}`);
  }

  const result = await mongoose.connection.transaction(async (session) => {
    booking.status = status;
    await booking.save({ session });

    let refund = null;
    if (status === 'cancelled') {
      [refund] = await Transaction.create(
        [{ booking: booking._id, client: booking.client, freelancer: booking.freelancer, amount: booking.amount, type: 'refund' }],
        { session }
      );
    }
    return { booking, refund };
  });

  res.status(200).json(result);
};

module.exports = { createBooking, getMyBookings, updateBookingStatus };
