# Stock UI Endpoint Inventory

Device-local endpoints found in the saved stock UI files:

- `LoginServlet`
- `SearchServletYb`
- `SearchServletBanner`
- `SearchServletCollect`
- `DiskListServlet`

Notes:
- `LoginServlet`, `SearchServletYb`, `SearchServletBanner`, and `SearchServletCollect` were all live-validated on `192.168.0.8:8080`
- `DiskListServlet` was referenced clearly in the stock UI JavaScript, but the tested device timed out with no bytes returned during live probing
- the stock UI also calls an external banner metadata API, `https://tvshow.huasee.com/api/place/qryTvLanguage`, which is not hosted on the karaoke device itself
