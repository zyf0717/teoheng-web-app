# Transport and Shared Notes

## Transport

The device browser API uses JSONP, not plain JSON.

Be clear about the difference:

- JSON:
  - plain data only
  - example:

```json
{"cmd":"Add1","code":"0"}
```

- JSONP:
  - a JavaScript function call whose argument is JSON
  - example:

```js
jQuery111109054655546115213_1773475935717({"cmd":"Del1","code":"0"})
```

The karaoke device returns JSONP responses like the second form.

Typical requests include:
- `jsonpCallback=<callback name>`
- `_=` timestamp cache-buster

Typical response shape:

```js
callbackName({...json payload...})
```

The callback name is often:
- a jQuery-generated callback such as `jQuery1111...`
- or an app-generated callback such as `__openKodJsonp_...`

So:
- the payload inside the parentheses is JSON
- the full HTTP response is JSONP

## Base URL

Example device base URL:

```text
http://device-ip:8080
```

## Stock UI Snapshots

Captured from `http://192.168.0.8:8080` on `2026-03-23` during live inspection:

- `docs/stock-ui/192.168.0.8-root.html`
- `docs/stock-ui/192.168.0.8-en_us_demo_foreign.js`
