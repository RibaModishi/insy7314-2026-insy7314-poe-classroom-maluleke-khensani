// Catch-all for any request that didn't match a route above it. Must be registered
// with app.use() after all real routes, and before the error handler.
function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

module.exports = notFound;
