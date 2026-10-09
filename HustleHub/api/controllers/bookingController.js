const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Gig = require('../models/Gig');
const Transaction = require('../models/Transaction');
const { assertOwnership, ownershipFilter } = require('../utils/ownership');

const transactionsUnsupported = (err) =>
  /transaction numbers are only allowed on a replica set member or mongos|transactions are not supported/i.test(err.message || '');

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

  // Use a database transaction when available. On standalone local MongoDB, create
  // both records sequentially and remove the booking if its payment record fails.
  // Client comes from the token and amount/freelancer from the gig, never from the body.
  const createRecords = async (session) => {
    const options = session ? { session } : undefined;
    const [booking] = await Booking.create(
      [{ gig: gig._id, client: req.user.id, freelancer: gig.freelancer, amount: gig.price }],
      options
    );
    try {
      const [transaction] = await Transaction.create(
        [{ booking: booking._id, client: req.user.id, freelancer: gig.freelancer, amount: booking.amount }],
        options
      );
      return { booking, transaction };
    } catch (err) {
      if (!session) await booking.deleteOne();
      throw err;
    }
  };

  let result;
  try {
    result = await mongoose.connection.transaction((session) => createRecords(session));
  } catch (err) {
    // Local MongoDB commonly runs as a standalone server. Keep booking + payment
    // functional there, while using a real transaction whenever the DB supports it.
    if (!transactionsUnsupported(err)) throw err;
    result = await createRecords(null);
  }

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

  const previousStatus = booking.status;
  const updateRecords = async (session) => {
    booking.status = status;
    await booking.save(session ? { session } : undefined);

    let refund = null;
    if (status === 'cancelled') {
      try {
        [refund] = await Transaction.create(
          [{ booking: booking._id, client: booking.client, freelancer: booking.freelancer, amount: booking.amount, type: 'refund' }],
          session ? { session } : undefined
        );
      } catch (err) {
        if (!session) {
          booking.status = previousStatus;
          await booking.save();
        }
        throw err;
      }
    }
    return { booking, refund };
  };

  let result;
  try {
    result = await mongoose.connection.transaction((session) => updateRecords(session));
  } catch (err) {
    if (!transactionsUnsupported(err)) throw err;
    result = await updateRecords(null);
  }

  res.status(200).json(result);
};

module.exports = { createBooking, getMyBookings, updateBookingStatus };
