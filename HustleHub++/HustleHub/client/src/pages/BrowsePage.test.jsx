import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrowsePage from './BrowsePage';

const gigs = [
  { id: 'one', title: 'Brand identity design', description: 'A complete visual identity for your business.', category: 'Design', price: 1200, freelancerName: 'Thandi' },
  { id: 'two', title: 'React landing page', description: 'A responsive page built for your product.', category: 'Development', price: 2500, freelancerName: 'Kabelo' },
];

describe('BrowsePage', () => {
  it('renders marketplace listings supplied by the API', () => {
    render(<BrowsePage gigs={gigs} onNavigate={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Browse all gigs' })).toBeInTheDocument();
    expect(screen.getByText('Brand identity design')).toBeInTheDocument();
    expect(screen.getByText('React landing page')).toBeInTheDocument();
  });

  it('filters listings when the search field is used', async () => {
    const user = userEvent.setup();
    render(<BrowsePage gigs={gigs} onNavigate={vi.fn()} />);
    await user.type(screen.getByRole('textbox', { name: 'Search gigs' }), 'React');
    expect(screen.getByText('React landing page')).toBeInTheDocument();
    expect(screen.queryByText('Brand identity design')).not.toBeInTheDocument();
  });
});
