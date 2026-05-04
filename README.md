
> [!NOTE]
> This is a fun project to test Claude Design and Claude Code... and the caveman plugin.

# Team Weather Map 
You like chitty chatty in the standup? Alrighty, let's start with the weather! 
Team Weather Map is a team dashboard that shows live weather for your office locations around the world.

**What it does**:
- Today tab — tile grid showing each city's current max temperature and weather condition
- Weekend tab — looks back at the last Saturday & Sunday, with a fun "vibe" summary (🎉 Perfect!, 😩 Rained out, etc.) — great to open on Monday mornings
- Map tab — all cities pinned on a real interactive map (OpenStreetMap/CartoDB) with weather markers showing icons, temps, and team member avatars

**Team members**:
- Add people, assign them to a city, pick an avatar color
- Upload a profile photo with a drag-to-crop circle tool, or paste a URL

**Fully configurable**:
- Add/remove countries and cities (with custom lat/lon for weather accuracy)
- Set how many columns the grid shows at each screen size (mobile → desktop)
- Toggle city name position (top or bottom of each tile)

Everything persists in localStorage — team, cities, layout preferences all survive page refresh.

## Quickstart

**Requirements:** Node.js ≥ 18, pnpm ≥ 10

```bash
pnpm install
pnpm run dev        # http://localhost:5173
```

**Run tests:**
```bash
pnpm run test
pnpm run test:coverage   # with coverage report
```

**Production build:**
```bash
pnpm run build      # output in dist/
```

**Docker (build + serve with nginx):**
```bash
docker compose build && docker compose up   # http://localhost:8080
```
