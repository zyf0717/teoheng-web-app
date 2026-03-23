# PlaylistServlet

Playlist endpoint:

```text
GET /PlaylistServlet
```

Observed query parameters:
- `onSelectPage`
- `click`
- `type`
- `jsonpCallback`
- `_`

Example:

```text
/PlaylistServlet?jsonpCallback=testcb&onSelectPage=true&type=1
```

Observed JSON payload fields:
- `eff`
- `hasChange`
- `mic`
- `number`
- `pitch`
- `songList`
- `stateMuOr`
- `stateMute`
- `statePlay`
- `vol`

Observed `songList` JSON item fields:
- `xH`: song id / queue item id
- `sONGNAME`: song title
- `sINGER`: singer name

Example:

```json
{
  "hasChange": "true",
  "number": 2,
  "songList": [
    { "sINGER": "æ¢¦ç„¶", "sONGNAME": "å°‘å¹´", "xH": "1503296" },
    { "sINGER": "é™ˆå¥•è¿…", "sONGNAME": "åå¹´", "xH": "1486462" }
  ],
  "stateMuOr": false,
  "stateMute": false,
  "statePlay": false
}
```

Observed `type` values from stock UI JavaScript:
- `1` = selected / queued songs
- `2` = sung / history songs
- `3` = like / collect navigation mode

Live validation notes from `192.168.0.8:8080` on `2026-03-23`:
- `type=1`, `type=2`, and `type=3` all returned HTTP 200
- all three returned the same response envelope during the probe session
- the tested device returned populated state fields such as `vol=22`, `mic=10`, `pitch=5`, `eff=6`
- after the queue was populated with 22 songs, `type=1`, `type=2`, and `type=3` still returned the same 22-song list in the same order
- `onSelectPage=true` and `onSelectPage=false` also returned the same list during that probe
- example first rows from the populated queue were `9029901 / å°å¹¸è¿ / ç”°é¦¥ç”„`, `1503296 / å°‘å¹´ / æ¢¦ç„¶`, and `1317765 / åƒé±¼ / çŽ‹è´°æµª`
- later probing on the same device showed `vol=-1` and `eff=-1`, so those fields may sometimes report sentinel or unavailable values rather than stable mixer levels
- a `Skip` command was reflected with a delay: the immediate next playlist poll still showed the old first row, while a later poll showed that row removed
- one tested YouTube queue entry appeared in `PlaylistServlet` with an `xH` value different from the `sONGBM` returned by `SearchServletYb`
