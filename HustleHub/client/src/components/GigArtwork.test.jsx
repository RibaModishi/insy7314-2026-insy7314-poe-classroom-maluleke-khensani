import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GigArtwork from './GigArtwork';

describe('GigArtwork', () => {
  it('renders the local category image for a gig without saved artwork', () => {
    render(<GigArtwork gig={{ title: 'Logo design', category: 'Design' }} />);

    expect(screen.getByRole('img', { name: 'Logo design artwork' })).toHaveAttribute('src', '/images/gigs/design.jpg');
  });

  it('falls back to the local category image when a saved image fails', () => {
    render(<GigArtwork gig={{ title: 'Editing', category: 'Video', image: 'https://example.invalid/video.jpg' }} />);
    fireEvent.error(screen.getByRole('img', { name: 'Editing artwork' }));

    expect(screen.getByRole('img', { name: 'Editing artwork' })).toHaveAttribute('src', '/images/gigs/video.jpg');
  });

  it('shows a labeled placeholder if the local asset cannot load either', () => {
    render(<GigArtwork gig={{ title: 'Writing', category: 'Writing' }} />);
    fireEvent.error(screen.getByRole('img', { name: 'Writing artwork' }));

    expect(screen.getByRole('img', { name: 'Writing category artwork' })).toBeInTheDocument();
  });
});
