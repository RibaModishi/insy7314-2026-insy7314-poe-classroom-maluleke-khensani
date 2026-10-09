const CATEGORY_ARTWORK = Object.freeze({
  Design: '/images/gigs/design.jpg',
  Development: '/images/gigs/development.jpg',
  Illustration: '/images/gigs/illustration.jpg',
  Marketing: '/images/gigs/marketing.jpg',
  Other: '/images/gigs/other.jpg',
  Video: '/images/gigs/video.jpg',
  Writing: '/images/gigs/writing.jpg',
});

function getCategoryArtwork(category) {
  return CATEGORY_ARTWORK[category] || CATEGORY_ARTWORK.Other;
}

module.exports = { getCategoryArtwork };
