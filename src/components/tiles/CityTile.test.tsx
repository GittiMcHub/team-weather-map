import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CityTile } from './CityTile';
import type { City, TeamMember, WeatherData } from '../../types';

const city: City = { id: 'berlin', name: 'Berlin', countryId: 'de', lat: 52.52, lon: 13.405 };
const weather: WeatherData = { temp: 12, code: 0 };
const member: TeamMember = { id: 'm1', name: 'Alice', photo: '', cityId: 'berlin', colorIdx: 0 };

describe('CityTile', () => {
  it('shows loading bar when weather is undefined', () => {
    render(<CityTile city={city} flag="🇩🇪" weather={undefined} members={[]} cityPosition="bottom" />);
    expect(screen.getByTestId('loading-bar')).toBeInTheDocument();
  });

  it('shows unavailable message when weather is null', () => {
    render(<CityTile city={city} flag="🇩🇪" weather={null} members={[]} cityPosition="bottom" />);
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('shows temperature when weather is available', () => {
    render(<CityTile city={city} flag="🇩🇪" weather={weather} members={[]} cityPosition="bottom" />);
    expect(screen.getByText('12°')).toBeInTheDocument();
  });

  it('shows city name and flag', () => {
    render(<CityTile city={city} flag="🇩🇪" weather={weather} members={[]} cityPosition="bottom" />);
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getByText('🇩🇪')).toBeInTheDocument();
  });

  it('shows no-members message when members list is empty', () => {
    render(<CityTile city={city} flag="🇩🇪" weather={weather} members={[]} cityPosition="bottom" />);
    expect(screen.getByText('No members')).toBeInTheDocument();
  });

  it('renders member avatars when members are present', () => {
    render(<CityTile city={city} flag="🇩🇪" weather={weather} members={[member]} cityPosition="bottom" />);
    expect(screen.getByLabelText('Alice')).toBeInTheDocument();
  });
});
