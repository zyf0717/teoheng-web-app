# Endpoint Reference

This is the landing page for the KOD device endpoint documentation used by `teoheng-web-app`.

The detailed notes have been split into smaller files under `endpoints/`.

## Scope

These docs combine:
- live endpoint testing against a device on the local network
- inspection of the stock device web UI HTML and JavaScript

When option lists are mentioned, the source matters:
- `stock UI inspection`
- `live endpoint validation`
- `inference`

Important:
- `SearchServlet` and `SingerServlet` do not currently appear to expose a self-describing metadata response listing all valid filter values.
- In practice, `teoheng-web-app` derives most filter values from the stock UI first, then validates them against live endpoint behavior.

## Overview

- [Transport and shared notes](endpoints/transport.md)
- [SearchServlet](endpoints/search-servlet.md)
- [SearchServletYb](endpoints/search-servlet-yb.md)
- [SearchServletBanner](endpoints/search-servlet-banner.md)
- [SearchServletCollect](endpoints/search-servlet-collect.md)
- [LoginServlet](endpoints/login-servlet.md)
- [PlaylistServlet](endpoints/playlist-servlet.md)
- [CommandServlet](endpoints/command-servlet.md)
- [SingerServlet](endpoints/singer-servlet.md)
- [Singer images](endpoints/singer-images.md)
- [DiskListServlet](endpoints/disk-list-servlet.md)
- [Stock UI endpoint inventory](endpoints/stock-ui-notes.md)
- [Current caveats](endpoints/caveats.md)

## Stock UI Snapshots

Captured from `http://192.168.0.8:8080` on `2026-03-23` during live inspection:

- `stock-ui/192.168.0.8-root.html`
- `stock-ui/192.168.0.8-en_us_demo_foreign.js`
