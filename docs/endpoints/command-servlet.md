# CommandServlet

Command endpoint:

```text
GET /CommandServlet
```

Observed query parameters:
- `cmd`
- `cmdValue` when applicable
- `vid` for YouTube-style queue actions
- `songname` for YouTube-style queue actions
- `singer` for YouTube-style queue actions
- `jsonpCallback`
- `_`

Typical JSON payload on success:

```json
{
  "cmd": "Add1",
  "code": "0"
}
```

Observed commands:

## Queue management

- `Add1`
  - add song to queue
  - requires `cmdValue=<song id>`
- `Pro1`
  - prioritize song
  - requires `cmdValue=<song id>`
- `Pro2`
  - prioritize a queued song by playlist item id
  - stock UI uses `xH` from `PlaylistServlet`
- `Del1`
  - delete song from queue
  - requires `cmdValue=<song id>`
- `SelReplay`
  - replay a previously sung song
  - stock UI uses `xH` from the sung list view

Live validation notes from `192.168.0.8:8080` on `2026-03-23`:
- `Add1` on a non-queued song appended that song to the end of the playlist
- `Pro1` worked on both a newly added song and an already queued song, moving the target song to the top
- `Del1` removed both newly added and already queued songs as expected
- deleting the current last song and then re-adding the same song id restored the full playlist exactly in the tested case
- `Pro2` returned `code: "0"` but did not change queue order in two tested cases:
  - a newly added song at the end of the queue
  - the second song in an already queued playlist
- `MuOr` toggled `stateMuOr` in `PlaylistServlet`
- `Mute` toggled `stateMute` in `PlaylistServlet`
- `Play` toggled `statePlay` in `PlaylistServlet`
- `Mic_up` and `Mic_down` changed the `mic` field in `PlaylistServlet`
- `Tone_up` and `Tone_down` changed the `pitch` field in `PlaylistServlet`
- `Tone_nom` returned success, but produced no visible change when the device was already at the baseline pitch value seen during testing
- `Music_up` and `Music_down` returned success, but no reflected `vol` change was visible through `PlaylistServlet` on the tested device state
- `Reset` returned success, but produced no visible `PlaylistServlet` state change during the tested device state
- `huanying` returned success, but produced no visible `PlaylistServlet` state change during live probing
- `Skip` returned success and eventually removed the current first queued song, but the removal was not reflected in the immediate next `PlaylistServlet` snapshot
- `SelReplay` returned success, but had no visible effect when sent against a current queue item rather than a known sung-list item
- the stock YouTube flow using `vid`, `songname`, and `singer` successfully added a queue row, but one tested `SearchServletYb` result with `sONGBM=99000057` appeared in `PlaylistServlet` as `xH=99000001`
- in that same YouTube test, `Del1` using the original `sONGBM` did not remove the queued row, but `Del1` using the `PlaylistServlet` row id did

## Playback and mode

- `Play`
  - play or pause toggle
- `Skip`
  - skip current song
- `Reset`
  - replay / restart current playback
- `MuOr`
  - vocals toggle
- `Mute`
  - mute toggle
- `huanying`
  - exposed by the stock UI as the `TVideo` button
  - exact on-device effect still needs deeper validation

## Music volume

- `Music_up`
- `Music_down`

## Microphone volume

- `Mic_up`
- `Mic_down`

## Pitch

- `Tone_nom`
  - original key
- `Tone_down`
  - flatten
- `Tone_up`
  - sharpen

## Disk / local media

- `Udisk_Add`
  - add a disk song using its `pATH`
- `Udisk_Pro`
  - prioritize a disk song using its `pATH`
