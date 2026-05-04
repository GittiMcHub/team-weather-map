import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabLayout } from './TabLayout';
import { DEFAULT_COL_CONFIG } from '../../constants';

describe('TabLayout', () => {
  it('renders all breakpoint sliders', () => {
    render(<TabLayout config={DEFAULT_COL_CONFIG} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/Mobile/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Small/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Medium/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Large/)).toBeInTheDocument();
  });

  it('calls onChange when a slider changes', () => {
    const onChange = vi.fn();
    render(<TabLayout config={DEFAULT_COL_CONFIG} onChange={onChange} />);
    const slider = screen.getByLabelText(/Mobile/);
    fireEvent.change(slider, { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_COL_CONFIG, xs: 3 });
  });

  it('calls onChange when city position is toggled', () => {
    const onChange = vi.fn();
    render(<TabLayout config={DEFAULT_COL_CONFIG} onChange={onChange} />);
    fireEvent.click(screen.getByText('top'));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_COL_CONFIG, cityPosition: 'top' });
  });
});
