import { describe, expect, it } from 'vitest';
import { getCategoryArtwork, getGigArtwork } from './gigArtwork';

describe('gig category artwork', () => {
  it.each([
    ['Design', '/images/gigs/design.jpg'],
    ['Development', '/images/gigs/development.jpg'],
    ['Illustration', '/images/gigs/illustration.jpg'],
    ['Marketing', '/images/gigs/marketing.jpg'],
    ['Video', '/images/gigs/video.jpg'],
    ['Writing', '/images/gigs/writing.jpg'],
  ])('maps %s to local artwork', (category, expected) => {
    expect(getCategoryArtwork(category)).toBe(expected);
  });

  it('uses the Other artwork for an unknown category', () => {
    expect(getCategoryArtwork('Unlisted')).toBe('/images/gigs/other.jpg');
  });

  it('keeps an image saved on the gig', () => {
    expect(getGigArtwork({ category: 'Design', image: '/uploads/custom.jpg' })).toBe('/uploads/custom.jpg');
  });

  it('fills in artwork for older gigs with no saved image', () => {
    expect(getGigArtwork({ category: 'Writing' })).toBe('/images/gigs/writing.jpg');
  });
});
