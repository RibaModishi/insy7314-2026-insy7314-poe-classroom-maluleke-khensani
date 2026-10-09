// Catch-all for requests that matched no route. Registered after every route in index.js
// and before the error handler.
function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

module.exports = notFound;
