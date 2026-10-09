const CATEGORY_ARTWORK = {
  Design: '/images/gigs/design.jpg',
  Development: '/images/gigs/development.jpg',
  Illustration: '/images/gigs/illustration.jpg',
  Marketing: '/images/gigs/marketing.jpg',
  Other: '/images/gigs/other.jpg',
  Video: '/images/gigs/video.jpg',
  Writing: '/images/gigs/writing.jpg',
};

export function getCategoryArtwork(category) {
  return CATEGORY_ARTWORK[category] || CATEGORY_ARTWORK.Other;
}

export function getGigArtwork(gig) {
  return typeof gig?.image === 'string' && gig.image.trim()
    ? gig.image
    : getCategoryArtwork(gig?.category);
}
