# DiskListServlet

USB / local disk song browse endpoint found in the stock UI JavaScript:

```text
GET /DiskListServlet
```

Observed query parameters from stock UI JavaScript:
- `page`
- `jsonpCallback`
- `_`

Expected response fields from stock UI handling code:
- `maxPage`
- `number`
- `page`
- `songList`

Expected `songList` item fields from stock UI handling code:
- `sONGNAME`
- `sINGER`
- `pATH`

Observed command integration from stock UI:
- `Udisk_Add` uses `pATH`
- `Udisk_Pro` uses `pATH`

Live validation note from `192.168.0.8:8080` on `2026-03-23`:
- the endpoint timed out after 8 seconds with zero bytes received
- likely explanations are that the feature depends on an attached USB disk, a different device mode, or another prerequisite not active during probing
