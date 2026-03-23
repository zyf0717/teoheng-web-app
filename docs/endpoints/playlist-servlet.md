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

Not observed in either the stock UI handlers or live payloads on the tested device:
- no current-song id
- no current-song index
- no per-row "now playing" flag
- no separate history-only item shape

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
    { "sINGER": "Dreamer", "sONGNAME": "Youth", "xH": "1503296" },
    { "sINGER": "Eason", "sONGNAME": "Ten Years", "xH": "1486462" }
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
- after the queue was populated with 22 songs, `type=1`, `type=2`, and `type=3` still returned the same 22-song list in the same order
- `onSelectPage=true` and `onSelectPage=false` also returned the same list during probing
- a deeper read-only sweep across all combinations of `type in {1,2,3}`, `onSelectPage in {true,false}`, and `click in {0,1,2}` returned payloads that were identical after JSON normalization
- one read-only sweep returned `number=16` and identical first rows `1290980 / 拥抱你离去 / 张北北`, `1291685 / 年少有为 / 李荣浩`, and `1088506 / 告白气球 / 周杰伦` for every probed combination
- the tested device exposed coarse state fields such as `statePlay`, `stateMute`, `stateMuOr`, `mic`, `pitch`, and sometimes `vol` / `eff`
- later probing on the same device showed `vol=-1` and `eff=-1`, so those fields may sometimes report sentinel or unavailable values rather than stable mixer levels
- a `Skip` command was reflected with a delay: the immediate next playlist poll still showed the old first row, while a later poll showed that row removed
- one tested YouTube queue entry appeared in `PlaylistServlet` with an `xH` value different from the `sONGBM` returned by `SearchServletYb`

Interpretation for app features:
- the stock UI clearly intends `type=2` to mean sung/history, but this tested device did not expose a distinct sung list through `PlaylistServlet`
- on this device, `PlaylistServlet` is useful for queue contents and coarse playback state, but not for a reliable now-playing row or a proper sung-history view
