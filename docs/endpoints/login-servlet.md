# LoginServlet

Login endpoint used by the stock UI modal:

```text
GET /LoginServlet
```

Observed query parameters from stock UI JavaScript:
- `username`
- `password`
- `jsonpCallback`
- `_`

Example:

```text
/LoginServlet?jsonpCallback=testcb&username=test&password=test
```

Observed JSON payload fields:
- `code`
- `message`
- `success`

Live validation notes from `192.168.0.8:8080` on `2026-03-23`:
- blank username and password returned `success: false`, `code: 200`, `message: "Wrong Password"`
- `test` / `test` returned `success: true`
- `alpha` / `beta` also returned `success: true`

Practical note:
- this appears to be a very weak or device-specific login gate rather than conventional authentication
