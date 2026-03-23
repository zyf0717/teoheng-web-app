# SearchServletCollect

Collection / favourites endpoint:

```text
GET /SearchServletCollect
```

Observed query parameters from stock UI JavaScript:
- `username`
- `password`
- `jsonpCallback`
- `_`

Example:

```text
/SearchServletCollect?jsonpCallback=testcb&username=test&password=test
```

Observed JSON payload fields in live tests:
- `maxPage`
- `number`
- `page`
- `songList`

Live validation notes from `192.168.0.8:8080` on `2026-03-23`:
- blank credentials returned `maxPage: 0`, `number: 0`, `page: 0`, `songList: []`
- `test` / `test` returned the same empty result
- `alpha` / `beta` returned the same empty result

Notes:
- the stock UI hides this behind a login flow
- the endpoint still responded directly to unauthenticated probe requests
