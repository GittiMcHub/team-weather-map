import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders initials when no photo provided', () => {
    render(<Avatar name="John Doe" photo="" colorIdx={0} />);
    expect(screen.getByLabelText('John Doe')).toHaveTextContent('JD');
  });

  it('renders img element when photo is provided', () => {
    render(<Avatar name="Alice" photo="https://example.com/a.jpg" colorIdx={1} />);
    expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument();
  });

  it('falls back to initials when image errors', () => {
    render(<Avatar name="Bob Smith" photo="bad-url" colorIdx={0} />);
    const img = screen.getByRole('img', { name: 'Bob Smith' });
    fireEvent.error(img);
    expect(screen.getByLabelText('Bob Smith')).toHaveTextContent('BS');
  });

  it('applies custom size', () => {
    render(<Avatar name="X" photo="" colorIdx={0} size={48} />);
    const el = screen.getByLabelText('X');
    expect(el).toHaveStyle({ width: '48px', height: '48px' });
  });
});
