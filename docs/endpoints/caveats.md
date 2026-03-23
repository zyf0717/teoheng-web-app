# Current Caveats

- The device API uses `GET` even for state-changing commands.
- The API is JSONP-based rather than CORS JSON.
- `TopByNewSong` appears to override or ignore language filtering.
- `SearchServletYb` blank search did not respond during an 8 second probe timeout on the tested device.
- `SearchServletBanner` clearly exists, but the exact meaning of its `songType` values is still unclear from live probing alone.
- `LoginServlet` behavior on the tested device appears permissive and may be device-specific rather than a robust authentication system.
- Some stock UI features appear to depend on device state or attached media, especially `DiskListServlet`.
- The exact semantic meaning of some response flags may still need further validation on-device.
