const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const Booking = require('../models/Booking');
const { assertOwnership } = require('../utils/ownership');
const { getCategoryArtwork } = require('../utils/categoryArtwork');

const EDITABLE_FIELDS = ['title', 'description', 'price', 'category'];

function isMissing(value) {
  return value === undefined || value === null || value === '';
}

// Validating first stops a malformed id from surfacing a raw Mongoose CastError.
async function findGigOrThrow(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid gig id');
  }

  const gig = await Gig.findById(id).populate('freelancer', 'name');
  if (!gig) {
    throw new Error('Gig not found');
  }
  return gig;
}

const createGig = async (req, res) => {
  const { title, description, price, category } = req.body || {};

  // isMissing rather than !value so a price of 0 is still accepted.
  if ([title, description, price, category].some(isMissing)) {
    throw new Error('Title, description, price and category are required');
  }

  // Owner comes from the verified token, never the body, so nobody can create
  // gigs on behalf of another user.
  const gig = await Gig.create({
    title,
    description,
    price,
    category,
    image: getCategoryArtwork(category),
    freelancer: req.user.id
  });

  res.status(201).json(gig);
};

const getGigs = async (req, res) => {
  const { category } = req.query;

  // Only a plain string is used as a filter, so query operators can't be injected.
  const filter = typeof category === 'string' && category ? { category } : {};
  const gigs = await Gig.find(filter).populate('freelancer', 'name').sort({ createdAt: -1 });

  res.status(200).json(gigs);
};

const getGigById = async (req, res) => {
  const gig = await findGigOrThrow(req.params.id);

  res.status(200).json(gig);
};

const updateGig = async (req, res) => {
  const gig = await findGigOrThrow(req.params.id);
  // Admins may moderate any gig; everyone else must own it.
  assertOwnership(gig, req.user, ['freelancer'], 'You do not own this gig', { allowAdmin: true });

  // Whitelist of editable fields, so ownership can never be reassigned via update.
  const body = req.body || {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) {
      gig[field] = body[field];
    }
  }
  if (body.category !== undefined) {
    gig.image = getCategoryArtwork(body.category);
  }

  // save() re-runs the schema validators (maxlength, min: 0) on the changed fields.
  await gig.save();

  res.status(200).json(gig);
};

const deleteGig = async (req, res) => {
  const gig = await findGigOrThrow(req.params.id);
  assertOwnership(gig, req.user, ['freelancer'], 'You do not own this gig', { allowAdmin: true });

  // Deleting a gig with open bookings would leave those bookings pointing at nothing.
  const openBookings = await Booking.exists({ gig: gig._id, status: { $in: ['pending', 'confirmed'] } });
  if (openBookings) {
    throw new Error('Cannot delete a gig with pending or confirmed bookings');
  }

  await gig.deleteOne();

  res.status(200).json({ message: 'Gig deleted' });
};

module.exports = { createGig, getGigs, getGigById, updateGig, deleteGig };
