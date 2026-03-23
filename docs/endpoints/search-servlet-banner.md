# SearchServletBanner

Banner-driven browse endpoint:

```text
GET /SearchServletBanner
```

Observed query parameters from stock UI JavaScript:
- `songType`
- `page`
- `jsonpCallback`
- `_`

Example:

```text
/SearchServletBanner?jsonpCallback=testcb&songType=TopByYoutube&page=0
```

Observed JSON payload fields in live tests:
- `maxPage`
- `number`
- `page`
- `songList`

Observed `songList` item fields in live tests:
- `sONGBM`
- `sONGNAME`
- `sINGER`
- `sINGERPIC`
- `cLOUD`

Live validation notes from `192.168.0.8:8080` on `2026-03-23`:
- `songType=''` returned a normal song page
- `songType='bogus'` returned the same first page as blank
- `songType='TopByYoutube'` returned the same first page as blank
- `songType='TopByCollect'` returned the same first page as blank

Notes:
- the exact accepted `songType` values are still unclear
- the stock UI obtains banner metadata from an external service, `https://tvshow.huasee.com/api/place/qryTvLanguage`, and passes the clicked banner `type` into this endpoint
