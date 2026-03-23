# SingerServlet

Singer browse/search endpoint:

```text
GET /SingerServlet
```

Observed query parameters:
- `singer`
- `singerType`
- `sortType`
- `page`
- `jsonpCallback`
- `_`

Example:

```text
/SingerServlet?jsonpCallback=testcb&singer=&singerType=å¤§é™†&sortType=&page=0
```

Observed response fields:
- `maxPage`
- `number`
- `page`
- `singerList`

Observed `singerList` item fields:
- `name`
- `picture`

Example item:

```json
{
  "name": "å‘¨æ°ä¼¦",
  "picture": "27356.jpg"
}
```

Discovery method:
- first found by inspecting the stock device UI
- then spot-checked against live `SingerServlet` responses

Verified `singerType` values:
- `å…¨éƒ¨` = All
- `å¤§é™†` = China
- `æ¸¯å°` = Hong Kong / Taiwan
- `è‹±è¯­` = English
- `æ—¥æœ¬` = Japan
- `éŸ©å›½` = Korea
- `è¶Šå—` = Vietnam
- `æŸ¬åŸ”å¯¨` = Cambodia
- `å°åº¦` = India
- `æ³°å›½` = Thailand
- `è²å¾‹å®¾` = Philippines
- `é©¬æ¥è¥¿äºš` = Malaysia
- `ç¼…ç”¸` = Myanmar
- `å°å°¼` = Indonesia
- `è€æŒ` = Laos
- `ä¿„ç½—æ–¯` = Russia
- `æ³•å›½` = France
- `å…¶ä»–` = Other

Notes from live checks:
- many of these return singer lists immediately on page 0
- some categories such as `è€æŒ`, `ä¿„ç½—æ–¯`, and `å…¶ä»–` returned `number: 8` but the first visible item was empty in spot checks, so those may need deeper validation

Additional live notes from `192.168.0.8:8080` on `2026-03-23`:
- `sortType=''`, `TopByHotSong`, and `TopByNewSong` all returned HTTP 200
- those three `sortType` values returned the same first singer during quick spot checks on the tested device
