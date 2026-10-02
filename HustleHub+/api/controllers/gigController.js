const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const Booking = require('../models/Booking');

const EDITABLE_FIELDS = ['title', 'description', 'price', 'category'];

function isMissing(value) {
  return value === undefined || value === null || value === '';
}

// Validating first stops a malformed id from surfacing a raw Mongoose CastError.
async function findGigOrThrow(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid gig id');
  }

  const gig = await Gig.findById(id);
  if (!gig) {
    throw new Error('Gig not found');
  }
  return gig;
}

function assertOwner(gig, userId) {
  if (gig.freelancer.toString() !== userId) {
    throw new Error('You do not own this gig');
  }
}

const createGig = async (req, res) => {
  const { title, description, price, category } = req.body || {};

  // isMissing rather than !value so a price of 0 is still accepted.
  if ([title, description, price, category].some(isMissing)) {
    throw new Error('Title, description, price and category are required');
  }

  // Owner comes from the verified token, never the body, so nobody can create
  // gigs on behalf of another user.
  const gig = await Gig.create({ title, description, price, category, freelancer: req.user.id });

  res.status(201).json(gig);
};

const getGigs = async (req, res) => {
  const { category } = req.query;

  // Only a plain string is used as a filter, so query operators can't be injected.
  const filter = typeof category === 'string' && category ? { category } : {};
  const gigs = await Gig.find(filter);

  res.status(200).json(gigs);
};

const getGigById = async (req, res) => {
  const gig = await findGigOrThrow(req.params.id);

  res.status(200).json(gig);
};

const updateGig = async (req, res) => {
  const gig = await findGigOrThrow(req.params.id);
  assertOwner(gig, req.user.id);

  // Whitelist of editable fields, so ownership can never be reassigned via update.
  const body = req.body || {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) {
      gig[field] = body[field];
    }
  }

  // save() re-runs the schema validators (maxlength, min: 0) on the changed fields.
  await gig.save();

  res.status(200).json(gig);
};

const deleteGig = async (req, res) => {
  const gig = await findGigOrThrow(req.params.id);
  assertOwner(gig, req.user.id);

  // Deleting a gig with open bookings would leave those bookings pointing at nothing.
  const openBookings = await Booking.exists({ gig: gig._id, status: { $in: ['pending', 'confirmed'] } });
  if (openBookings) {
    throw new Error('Cannot delete a gig with pending or confirmed bookings');
  }

  await gig.deleteOne();

  res.status(200).json({ message: 'Gig deleted' });
};

module.exports = { createGig, getGigs, getGigById, updateGig, deleteGig };
