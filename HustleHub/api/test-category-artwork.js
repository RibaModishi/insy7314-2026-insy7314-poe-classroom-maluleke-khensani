const test = require('node:test');
const assert = require('node:assert/strict');
const { getCategoryArtwork } = require('./utils/categoryArtwork');

test('maps every supported category to a local frontend asset path', () => {
  const expected = {
    Design: '/images/gigs/design.jpg',
    Development: '/images/gigs/development.jpg',
    Illustration: '/images/gigs/illustration.jpg',
    Marketing: '/images/gigs/marketing.jpg',
    Other: '/images/gigs/other.jpg',
    Video: '/images/gigs/video.jpg',
    Writing: '/images/gigs/writing.jpg',
  };

  for (const [category, image] of Object.entries(expected)) {
    assert.equal(getCategoryArtwork(category), image);
  }
});

test('uses the Other asset for an unknown category', () => {
  assert.equal(getCategoryArtwork('Unlisted'), '/images/gigs/other.jpg');
});
