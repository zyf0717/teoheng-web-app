# Current Caveats

- The device API uses `GET` even for state-changing commands.
- The API is JSONP-based rather than CORS JSON.
- `TopByNewSong` appears to override or ignore language filtering.
- `SearchServletYb` blank search did not respond during an 8 second probe timeout on the tested device.
- `SearchServletBanner` clearly exists, but the exact meaning of its `songType` values is still unclear from live probing alone.
- `LoginServlet` behavior on the tested device appears permissive and may be device-specific rather than a robust authentication system.
- Some stock UI features appear to depend on device state or attached media, especially `DiskListServlet`.
- The exact semantic meaning of some response flags may still need further validation on-device.
- The stock UI labels `PlaylistServlet type=2` as a sung/history view, but on the tested device `type=1`, `type=2`, and `type=3` all returned the same payload.
- No confirmed endpoint currently exposes a now-playing song id, current queue index, or per-row "currently playing" marker on the tested device.
