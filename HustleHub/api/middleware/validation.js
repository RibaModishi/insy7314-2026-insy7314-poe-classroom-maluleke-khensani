// Input validation and sanitisation, wired into the route files so controllers only ever see
// input that has passed these checks. House style: throw a plain Error on bad input (no
// try/catch, no res.status here); middleware/errorHandler.js turns it into a 400.
//
// Every body field is type-checked as well as presence-checked. That is what blocks NoSQL
// operator injection such as {"title": {"$gt": ""}} or {"gigId": {"$ne": null}}: only plain
// strings and numbers ever reach a query or a save. Text is trimmed and length-capped before
// it is stored. express-mongo-sanitize and xss-clean are deliberately not used — both try to
// overwrite req.query, which is read-only in Express 5, and crash every request.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 8+ characters with an uppercase letter, a lowercase letter, a digit and a special character.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Stricter than mongoose.Types.ObjectId.isValid, which also accepts any 12-character string.
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

// Same list as SELF_REGISTER_ROLES in authController.js: admin can never be self-registered.
const SELF_REGISTER_ROLES = ['client', 'freelancer'];

const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

const GIG_FIELDS = ['title', 'description', 'price', 'category'];

// title and description match the maxlength in models/Gig.js.
const GIG_TEXT_LIMITS = { title: 100, description: 1000, category: 50 };

const MAX_GIG_PRICE = 1000000;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

// bcrypt only uses the first 72 bytes of a password, so anything longer would be silently cut.
const MAX_PASSWORD_BYTES = 72;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isMissing(value) {
  return value === undefined || value === null || value === '';
}

function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body || {};

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw new Error('Name, email and password are required');
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (trimmedName.length > MAX_NAME_LENGTH) {
    throw new Error(`Name must be ${MAX_NAME_LENGTH} characters or fewer`);
  }
  if (trimmedEmail.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(trimmedEmail)) {
    throw new Error('Email must be a valid email address');
  }
  if (!PASSWORD_REGEX.test(password)) {
    throw new Error(
      'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character'
    );
  }
  if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
    throw new Error(`Password must be ${MAX_PASSWORD_BYTES} characters or fewer`);
  }

  // An omitted role becomes 'client' in the controller, so only a supplied role is checked.
  if (role && !SELF_REGISTER_ROLES.includes(role)) {
    throw new Error('Role must be either client or freelancer');
  }

  req.body.name = trimmedName;
  req.body.email = trimmedEmail;
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    throw new Error('Email and password are required');
  }

  req.body.email = email.trim();
  next();
}

// Trims the field in place, so the trimmed value is what gets stored.
function cleanGigText(body, field) {
  const value = body[field];
  if (typeof value !== 'string') {
    throw new Error(`Gig ${field} must be text`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Gig ${field} must not be empty`);
  }
  if (trimmed.length > GIG_TEXT_LIMITS[field]) {
    throw new Error(`Gig ${field} must be ${GIG_TEXT_LIMITS[field]} characters or fewer`);
  }

  body[field] = trimmed;
}

function checkGigPrice(price) {
  // Rejects "abc", true, "100" and NaN — only a real number is accepted.
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    throw new Error('Gig price must be a number');
  }
  if (price < 0) {
    throw new Error('Gig price must be 0 or more');
  }
  if (price > MAX_GIG_PRICE) {
    throw new Error(`Gig price must be ${MAX_GIG_PRICE} or less`);
  }
}

function validateGigCreate(req, res, next) {
  const body = req.body || {};

  if (GIG_FIELDS.some((field) => isMissing(body[field]))) {
    throw new Error('Title, description, price and category are required');
  }

  cleanGigText(body, 'title');
  cleanGigText(body, 'description');
  cleanGigText(body, 'category');
  checkGigPrice(body.price);
  next();
}

// Only the fields that were sent are checked; unknown fields are left for the controller,
// which ignores anything that isn't one of the four editable fields.
function validateGigUpdate(req, res, next) {
  const body = req.body || {};
  const sent = GIG_FIELDS.filter((field) => body[field] !== undefined);

  if (sent.length === 0) {
    throw new Error('At least one of title, description, price or category is required');
  }

  for (const field of sent) {
    if (field === 'price') checkGigPrice(body.price);
    else cleanGigText(body, field);
  }
  next();
}

function validateGigId(req, res, next) {
  if (!OBJECT_ID_REGEX.test(req.params.id)) {
    throw new Error('Invalid gig id');
  }
  next();
}

function validateBooking(req, res, next) {
  const { gigId } = req.body || {};

  if (isMissing(gigId)) {
    throw new Error('Gig id is required');
  }
  if (typeof gigId !== 'string' || !OBJECT_ID_REGEX.test(gigId)) {
    throw new Error('Invalid gig id');
  }
  next();
}

function validateBookingStatus(req, res, next) {
  const { status } = req.body || {};

  if (isMissing(status)) {
    throw new Error('Status is required');
  }
  if (typeof status !== 'string' || !BOOKING_STATUSES.includes(status)) {
    throw new Error(`Status must be one of: ${BOOKING_STATUSES.join(', ')}`);
  }
  if (!OBJECT_ID_REGEX.test(req.params.id)) {
    throw new Error('Invalid booking id');
  }
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateGigCreate,
  validateGigUpdate,
  validateGigId,
  validateBooking,
  validateBookingStatus
};
