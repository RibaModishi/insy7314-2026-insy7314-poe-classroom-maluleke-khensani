// The one place ownership is decided, used by every controller that touches a user's data.

// Throws `message` unless the user owns the document through one of `fields` (checked in
// order). Returns the field that matched, so callers can tell which side of a booking the
// user is on. With allowAdmin, an admin passes the check and 'admin' is returned.
function assertOwnership(doc, user, fields, message, { allowAdmin = false } = {}) {
  const ownerField = fields.find((field) => {
    const reference = doc[field]?._id || doc[field];
    return reference && reference.toString() === user.id;
  });
  if (ownerField) {
    return ownerField;
  }
  if (allowAdmin && user.role === 'admin') {
    return 'admin';
  }
  throw new Error(message);
}

// Query filter that only matches documents the user owns through one of `fields`, so list
// endpoints can never return other users' records.
function ownershipFilter(userId, fields) {
  return { $or: fields.map((field) => ({ [field]: userId })) };
}

module.exports = { assertOwnership, ownershipFilter };
