// Fills the database in MONGO_URI with readable demo data for the demo video and for markers.
// Only touches users whose email ends in @hustlehub.demo (plus the optional admin below).
//   npm run seed              creates the demo data if it isn't there yet
//   npm run seed -- --reset   deletes the demo data and creates it again from scratch
// An admin account is created only when SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are set in .env,
// so no admin password is ever stored in the repository.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

const DEMO_DOMAIN = '@hustlehub.demo';
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'Demo!Pass2026';
const SALT_ROUNDS = 10;
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const USERS = [
  { key: 'thandi', name: 'Thandi Nkosi', role: 'freelancer' },
  { key: 'kabelo', name: 'Kabelo Mokoena', role: 'freelancer' },
  { key: 'lerato', name: 'Lerato Dlamini', role: 'client' },
  { key: 'sipho', name: 'Sipho Ndlovu', role: 'client' }
];

const GIGS = [
  { key: 'logo', owner: 'thandi', title: 'Logo design', category: 'Design', price: 1200,
    description: 'A clean, modern logo for your brand, with three concepts and two rounds of changes.' },
  { key: 'social', owner: 'thandi', title: 'Social media graphics pack', category: 'Design', price: 650,
    description: 'Ten ready-to-post graphics sized for Instagram, Facebook and LinkedIn.' },
  { key: 'landing', owner: 'kabelo', title: 'Website landing page', category: 'Development', price: 3500,
    description: 'A responsive one-page website built in React, ready to deploy.' },
  { key: 'cv', owner: 'kabelo', title: 'CV and cover letter writing', category: 'Writing', price: 400,
    description: 'A professionally written CV and a cover letter tailored to one job application.' }
];

// One booking in each interesting state, so bookings, transactions and income all have something to show.
const BOOKINGS = [
  { gig: 'logo', client: 'lerato', status: 'completed' },
  { gig: 'landing', client: 'sipho', status: 'pending' },
  { gig: 'cv', client: 'lerato', status: 'cancelled' }
];

const demoEmail = (key) => `${key}${DEMO_DOMAIN}`;

async function deleteDemoData() {
  const users = await User.find({ email: { $regex: `${DEMO_DOMAIN.replace('.', '\\.')}$` } });
  const ids = users.map((u) => u._id);
  const involves = { $or: [{ client: { $in: ids } }, { freelancer: { $in: ids } }] };
  const t = await Transaction.deleteMany(involves);
  const b = await Booking.deleteMany(involves);
  const g = await Gig.deleteMany({ freelancer: { $in: ids } });
  const u = await User.deleteMany({ _id: { $in: ids } });
  console.log(`Removed old demo data: ${u.deletedCount} users, ${g.deletedCount} gigs, ${b.deletedCount} bookings, ${t.deletedCount} transactions.`);
}

async function createDemoData() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  await mongoose.connection.transaction(async (session) => {
    const users = {};
    for (const u of USERS) {
      [users[u.key]] = await User.create([{ name: u.name, email: demoEmail(u.key), passwordHash, role: u.role }], { session });
    }

    const gigs = {};
    for (const g of GIGS) {
      const { key, owner, ...fields } = g;
      [gigs[key]] = await Gig.create([{ ...fields, freelancer: users[owner]._id }], { session });
    }

    // Mirrors bookingController: every booking gets a payment, and a cancellation adds a refund.
    for (const b of BOOKINGS) {
      const gig = gigs[b.gig];
      const client = users[b.client];
      const [booking] = await Booking.create(
        [{ gig: gig._id, client: client._id, freelancer: gig.freelancer, amount: gig.price, status: b.status }],
        { session }
      );
      const base = { booking: booking._id, client: client._id, freelancer: gig.freelancer, amount: booking.amount };
      await Transaction.create([{ ...base, type: 'payment' }], { session });
      if (b.status === 'cancelled') {
        await Transaction.create([{ ...base, type: 'refund' }], { session });
      }
    }
  });

  console.log(`Created ${USERS.length} demo users, ${GIGS.length} gigs and ${BOOKINGS.length} bookings.`);
}

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || '').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || '';
  if (!email || !password) {
    console.log('Admin skipped: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env to create one.');
    return;
  }
  if (!STRONG_PASSWORD.test(password)) {
    console.log('Admin skipped: SEED_ADMIN_PASSWORD needs 8+ characters with an uppercase letter, a lowercase letter, a number and a special character.');
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    // Never silently promote an existing account to admin.
    console.log(existing.role === 'admin'
      ? `Admin ${email} already exists.`
      : `Admin skipped: ${email} already belongs to a ${existing.role} account.`);
    return;
  }

  await User.create({ name: 'HustleHub Admin', email, passwordHash: await bcrypt.hash(password, SALT_ROUNDS), role: 'admin' });
  console.log(`Created admin ${email} (password is the one in SEED_ADMIN_PASSWORD).`);
}

function printLogins() {
  console.log('\nDemo logins (all use the same password):');
  for (const u of USERS) {
    console.log(`  ${u.role.padEnd(10)} ${u.name.padEnd(16)} ${demoEmail(u.key)}`);
  }
  console.log(`  password: ${DEMO_PASSWORD}`);
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
    process.exitCode = 1;
    return;
  }
  await mongoose.connect(process.env.MONGO_URI);

  const reset = process.argv.includes('--reset');
  const alreadySeeded = await User.exists({ email: demoEmail(USERS[0].key) });

  if (reset) {
    await deleteDemoData();
  }
  if (reset || !alreadySeeded) {
    await createDemoData();
  } else {
    console.log('Demo data already exists. Run `npm run seed -- --reset` to recreate it.');
  }

  await seedAdmin();
  printLogins();
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
