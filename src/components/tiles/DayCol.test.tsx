import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DayCol } from './DayCol';

const dayData = { temp: 18, tempMin: 10, code: 0, date: '2026-01-10' };

describe('DayCol', () => {
  it('shows loading bar when data is undefined', () => {
    render(<DayCol label="Sat" data={undefined} />);
    expect(screen.getByTestId('loading-bar')).toBeInTheDocument();
  });

  it('shows dash when data is null', () => {
    render(<DayCol label="Sun" data={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows temperature when data is provided', () => {
    render(<DayCol label="Sat" data={dayData} />);
    expect(screen.getByText('18°')).toBeInTheDocument();
    expect(screen.getByText('10° min')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<DayCol label="Sat" data={null} />);
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });
});
