# SearchServletYb

YouTube-style search endpoint:

```text
GET /SearchServletYb
```

Observed query parameters from stock UI JavaScript:
- `songName`
- `jsonpCallback`
- `_`

Example:

```text
/SearchServletYb?jsonpCallback=testcb&songName=jay
```

Observed JSON payload fields:
- `maxPage`
- `number`
- `page`
- `songList`

Observed `songList` item fields:
- `sONGBM`
- `sONGNAME`
- `sINGER`
- `sINGERPIC`
- `sONGVID`
- `cLOUD`

Live validation notes from `192.168.0.8:8080` on `2026-03-23`:
- `songName=jay` returned YouTube-like results immediately
- the first result included `sONGVID=M07xxAXUFLE`
- the first result `sINGERPIC` was a full YouTube thumbnail URL
- `songName=test` returned `number: 16`
- blank `songName` did not return within an 8 second probe timeout

Practical note:
- the stock UI uses this endpoint together with `CommandServlet` requests that also include `vid`, `songname`, and `singer`
- in one live queueing test, a result with `sONGBM=99000057` was accepted by the YouTube queue path, but the resulting `PlaylistServlet` row appeared as `xH=99000001`
