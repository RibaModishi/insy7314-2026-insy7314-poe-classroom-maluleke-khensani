// Manual check for the Mongoose models against the database in MONGO_URI. Not loaded by the app.
// Only touches records whose email ends in @hustlehub.test.
//   node test-models.js            creates sample data you can view in Atlas Data Explorer
//   node test-models.js --cleanup  deletes that sample data again
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Gig = require('./models/Gig');
const Booking = require('./models/Booking');
const Transaction = require('./models/Transaction');

const TEST_DOMAIN = '@hustlehub.test';

function pass(label) {
  console.log(`PASS  ${label}`);
}

function fail(label, detail) {
  console.log(`FAIL  ${label}${detail ? ` (${detail})` : ''}`);
  process.exitCode = 1;
}

async function expectRejected(label, action) {
  try {
    await action();
    fail(label, 'it was saved but should have been rejected');
  } catch (err) {
    pass(`${label} -> rejected: ${err.message.split('\n')[0]}`);
  }
}

async function cleanup() {
  const testUsers = await User.find({ email: { $regex: `${TEST_DOMAIN.replace('.', '\\.')}$` } });
  const ids = testUsers.map((u) => u._id);
  const t = await Transaction.deleteMany({ $or: [{ client: { $in: ids } }, { freelancer: { $in: ids } }] });
  const b = await Booking.deleteMany({ $or: [{ client: { $in: ids } }, { freelancer: { $in: ids } }] });
  const g = await Gig.deleteMany({ freelancer: { $in: ids } });
  const u = await User.deleteMany({ _id: { $in: ids } });
  console.log(`Deleted ${u.deletedCount} users, ${g.deletedCount} gigs, ${b.deletedCount} bookings, ${t.deletedCount} transactions.`);
}

async function run() {
  const stamp = Date.now();

  const freelancer = await User.create({
    name: 'Test Freelancer',
    email: `Freelancer${stamp}${TEST_DOMAIN}`,
    passwordHash: 'not-a-real-hash',
    role: 'freelancer'
  });
  freelancer.email === freelancer.email.toLowerCase()
    ? pass(`User saved, email lowercased to ${freelancer.email}`)
    : fail('User email lowercase', freelancer.email);

  const client = await User.create({
    name: 'Test Client',
    email: `client${stamp}${TEST_DOMAIN}`,
    passwordHash: 'not-a-real-hash'
  });
  client.role === 'client' ? pass('User role defaults to client') : fail('User role default', client.role);

  const gig = await Gig.create({
    title: '  Logo design  ',
    description: 'A simple logo for your business',
    price: 500,
    category: 'design',
    freelancer: freelancer._id
  });
  gig.title === 'Logo design' ? pass('Gig saved, title trimmed') : fail('Gig title trim', gig.title);

  const booking = await Booking.create({
    gig: gig._id,
    client: client._id,
    freelancer: freelancer._id,
    amount: gig.price
  });
  booking.status === 'pending' ? pass('Booking saved, status defaults to pending') : fail('Booking status', booking.status);

  const transaction = await Transaction.create({
    booking: booking._id,
    freelancer: freelancer._id,
    client: client._id,
    amount: booking.amount
  });
  transaction.type === 'payment' ? pass('Transaction saved, type defaults to payment') : fail('Transaction type', transaction.type);

  const populated = await Booking.findById(booking._id).populate('gig client freelancer');
  populated.gig.title === 'Logo design' && populated.client.name === 'Test Client'
    ? pass('Booking references link to the real Gig and User')
    : fail('Booking populate');

  console.log('\nRule checks (each of these should be rejected):');
  await User.init();
  await expectRejected('Duplicate email in different case', () =>
    User.create({ name: 'Dup', email: freelancer.email.toUpperCase(), passwordHash: 'x' })
  );
  await expectRejected('User with unknown role', () =>
    User.create({ name: 'X', email: `role${stamp}${TEST_DOMAIN}`, passwordHash: 'x', role: 'superadmin' })
  );
  await expectRejected('Gig with negative price', () =>
    Gig.create({ title: 'Bad', description: 'Bad', price: -10, category: 'x', freelancer: freelancer._id })
  );
  await expectRejected('Gig title over 100 characters', () =>
    Gig.create({ title: 'x'.repeat(101), description: 'd', price: 1, category: 'x', freelancer: freelancer._id })
  );
  await expectRejected('Booking with unknown status', () =>
    Booking.create({ gig: gig._id, client: client._id, freelancer: freelancer._id, amount: 1, status: 'paid' })
  );
  await expectRejected('Transaction with negative amount', () =>
    Transaction.create({ booking: booking._id, freelancer: freelancer._id, client: client._id, amount: -1 })
  );

  console.log(`\nSample data left in the "${mongoose.connection.name}" database for you to inspect.`);
  console.log('Run "node test-models.js --cleanup" when you are done.');
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    if (process.argv.includes('--cleanup')) {
      await cleanup();
    } else {
      await run();
    }
  } catch (err) {
    fail('Unexpected error', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
