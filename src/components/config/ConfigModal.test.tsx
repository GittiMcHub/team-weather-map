import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfigModal } from './ConfigModal';
import { DEFAULT_COUNTRIES, DEFAULT_CITIES, DEFAULT_COL_CONFIG } from '../../constants';
import type { ConfigSavePayload } from '../../types';

vi.mock('../../utils/configIO', async () => {
  const actual = await vi.importActual<typeof import('../../utils/configIO')>('../../utils/configIO');
  return { ...actual, exportConfig: vi.fn() };
});

import { exportConfig } from '../../utils/configIO';

const baseProps = {
  members: [],
  countries: DEFAULT_COUNTRIES,
  cities: DEFAULT_CITIES,
  colConfig: DEFAULT_COL_CONFIG,
  onSave: vi.fn(),
  onClose: vi.fn(),
};

const importedPayload: ConfigSavePayload = {
  members: [{ id: 'x1', name: 'Bob', photo: '', cityId: 'london', colorIdx: 1 }],
  countries: [{ id: 'gb', name: 'United Kingdom', flag: '🇬🇧' }],
  cities: [{ id: 'london', name: 'London', countryId: 'gb', lat: 51.5074, lon: -0.1278 }],
  colConfig: { xs: 2, sm: 3, md: 4, lg: 6, cityPosition: 'top' },
};

describe('ConfigModal', () => {
  it('renders the settings dialog', () => {
    render(<ConfigModal {...baseProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<ConfigModal {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when × button is clicked', () => {
    const onClose = vi.fn();
    render(<ConfigModal {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onSave and onClose when Save is clicked', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<ConfigModal {...baseProps} onSave={onSave} onClose={onClose} />);
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('switches to Places tab when clicked', () => {
    render(<ConfigModal {...baseProps} />);
    fireEvent.click(screen.getByText('Places'));
    expect(screen.getByText(/Countries/)).toBeInTheDocument();
  });

  it('switches to Layout tab when clicked', () => {
    render(<ConfigModal {...baseProps} />);
    fireEvent.click(screen.getByText('Layout'));
    expect(screen.getByText(/Mobile/)).toBeInTheDocument();
  });

  describe('export', () => {
    beforeEach(() => vi.mocked(exportConfig).mockClear());

    it('renders the Export JSON button', () => {
      render(<ConfigModal {...baseProps} />);
      expect(screen.getByRole('button', { name: 'Export JSON' })).toBeInTheDocument();
    });

    it('calls exportConfig when Export JSON is clicked', () => {
      render(<ConfigModal {...baseProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }));
      expect(exportConfig).toHaveBeenCalledOnce();
    });
  });

  describe('import', () => {
    it('renders the Import JSON file input', () => {
      render(<ConfigModal {...baseProps} />);
      expect(screen.getByLabelText('Import JSON file')).toBeInTheDocument();
    });

    it('populates state from a valid import and calls onSave with imported data on Save', async () => {
      const onSave = vi.fn();
      render(<ConfigModal {...baseProps} onSave={onSave} />);

      const input = screen.getByLabelText('Import JSON file');
      const file = new File([JSON.stringify(importedPayload)], 'config.json', { type: 'application/json' });
      fireEvent.change(input, { target: { files: [file] } });

      // Wait for the imported member name to appear (confirms state updated)
      await screen.findByText('Bob');

      fireEvent.click(screen.getByText('Save'));
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        members: importedPayload.members,
        countries: importedPayload.countries,
      }));
    });

    it('shows an inline error when the JSON is structurally invalid', async () => {
      render(<ConfigModal {...baseProps} />);

      const input = screen.getByLabelText('Import JSON file');
      // '{}' parses as JSON but fails the members array check
      fireEvent.change(input, { target: { files: [new File(['{}'], 'c.json')] } });

      await screen.findByRole('alert');
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid config: members must be an array');
    });

    it('shows an inline error when the file is not valid JSON', async () => {
      render(<ConfigModal {...baseProps} />);

      const input = screen.getByLabelText('Import JSON file');
      fireEvent.change(input, { target: { files: [new File(['not json'], 'c.json')] } });

      await screen.findByRole('alert');
      expect(screen.getByRole('alert').textContent).toBeTruthy();
    });

    it('clears the error after a successful import following a failed one', async () => {
      render(<ConfigModal {...baseProps} />);

      const input = screen.getByLabelText('Import JSON file');
      fireEvent.change(input, { target: { files: [new File(['{}'], 'c.json')] } });
      await screen.findByRole('alert');

      fireEvent.change(input, { target: { files: [new File([JSON.stringify(importedPayload)], 'c.json')] } });
      await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    });
  });
});
