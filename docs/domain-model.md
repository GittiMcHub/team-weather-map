# Domain Model

## Entities

| Entity | Identity | Lifecycle |
|--------|----------|-----------|
| `Country` | `id: string` | Created/deleted by user in Places config |
| `City` | `id: string` | Created/deleted per country in Places config |
| `TeamMember` | `id: string` | Created/deleted in Team config |

## Value Objects

| Value Object | Attributes | Notes |
|--------------|------------|-------|
| `WeatherData` | `temp: number, code: number` | Ephemeral — refetched on load; cached in `twm-weather-cache` by date |
| `WeekendData` | `sat?: WeekendDayData, sun?: WeekendDayData` | Ephemeral; cached in `twm-weekend-cache` by date |
| `WeekendDayData` | `temp, tempMin, code, date` | One day's data |
| `ColConfig` | `xs, sm, md, lg: number; cityPosition; weatherAnimations: boolean` | Layout preferences + animation toggle |

## Associations

```
Country 1 ──── 0..* City
City    1 ──── 0..* TeamMember (via cityId)
```

## Domain Events

| Event | Trigger | Reaction |
|-------|---------|----------|
| Cities changed | ConfigModal save | Weather + weekend data cleared for changed cities; refetch triggered |
| Tab switched to Map | Header click | `MapView.invalidateSize()` + marker redraw called after 50 ms |
| Config imported | User selects a valid `.json` file in ConfigModal | Local modal state (members, countries, cities, colConfig) replaced; Save required to persist to localStorage |
| Geocode lookup | "🔍" button in TabPlaces city editor | Nominatim called with city name + country; lat/lon fields auto-filled on success |

## Bounded Contexts

```
┌─────────────────────────────┐  ┌──────────────────────────────┐
│  Configuration Context      │  │  Display Context             │
│  Countries, Cities,         │  │  CityTile, WeekendTile,      │
│  TeamMembers, ColConfig      │  │  MapView, DayCol             │
│  (persisted in localStorage)│  │  (read-only, driven by state)│
└─────────────────────────────┘  └──────────────────────────────┘
             │                                │
             └──────────── App.tsx ───────────┘
```
