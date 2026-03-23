# SearchServlet

Search endpoint:

```text
GET /SearchServlet
```

Observed query parameters:
- `songName`
- `songType`
- `singer`
- `lang`
- `sortType`
- `page`
- `jsonpCallback`
- `_`

Example:

```text
/SearchServlet?jsonpCallback=testcb&songName=&songType=&singer=&lang=å›½è¯­&sortType=&page=0
```

Observed JSON payload fields:
- `maxPage`
- `number`
- `page`
- `songList`

Observed `songList` item fields:
- `sONGBM`: song id
- `sONGNAME`: song title
- `sINGER`: singer name
- `sINGERPIC`: singer image filename
- `cLOUD`: cloud flag, `1` or `0`

Example item:

```json
{
  "cLOUD": 1,
  "sINGER": "ç”°é¦¥ç”„",
  "sINGERPIC": "26940.jpg",
  "sONGBM": "9029901",
  "sONGNAME": "å°å¹¸è¿"
}
```

## Supported `lang` values

Discovery method:
- first found by inspecting the stock device UI
- then spot-checked against live `SearchServlet` results

- `''` = All in teoheng-web-app default requests
- `å…¨éƒ¨` = All in some stock UI flows
- `å›½è¯­` = Mandarin
- `ç²¤è¯­` = Cantonese
- `é—½è¯­` = Hokkien
- `è‹±è¯­` = English
- `æ—¥è¯­` = Japanese
- `éŸ©è¯­` = Korean
- `æ³°è¯­` = Thai
- `è¶Šå—è¯­` = Vietnamese
- `æŸ¬åŸ”å¯¨è¯­` = Khmer
- `ç¼…ç”¸è¯­` = Burmese
- `è€æŒè¯­` = Lao
- `å°åº¦è¯­` = Hindi
- `å·«è¯­` = Malay
- `å°å°¼è¯­` = Indonesian
- `è²å¾‹å®¾è¯­` = Filipino
- `ä¿„è¯­` = Russian
- `æ³•è¯­` = French
- `å…¶ä»–` = Other

Notes:
- teoheng-web-app standardizes default filter values to blank where possible, so `All` is sent as `lang=''`.
- `å°è¯­` did not appear in the stock UI.
- in live testing, `å°è¯­` did not behave like a distinct supported value and appeared to fall back.

## Supported `songType` values

Discovery method:
- first found by inspecting the stock device UI
- some values were then checked against live `SearchServlet` behavior
- this is not currently a self-enumerating endpoint field

- `å¯¹å”±` = Duet
- `æ°‘æ­Œ` = Folk
- `æˆæ›²` = Opera
- `å„¿æ­Œ` = Children's
- `ç”Ÿæ—¥` = Birthday
- `å–œåº†` = Celebration
- `æ€€æ—§` = Nostalgia
- `ä¸²çƒ§` = Medley
- `å­—å¹•` = Romanised / subtitle-assisted songs

## Supported `sortType` values

Discovery method:
- first found in stock UI wiring
- then checked against live `SearchServlet` responses

- `TopByHotSong`
- `TopByNewSong`

Observed behavior:
- blank `sortType` returns the default browse list
- `TopByHotSong` behaved the same as blank in live tests performed so far
- `TopByNewSong` returned a different list and appeared to ignore `lang`

Practical recommendation:
- use blank for `Top Hits`
- use `TopByNewSong` for `New Songs`
