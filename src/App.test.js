import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  searchSongs,
  fetchPlaylist,
  queueSong,
  prioritizeSong,
  deleteSong,
  toggleVocals,
  restartDevice,
  toggleMute,
  musicUp,
  musicDown,
} = vi.hoisted(() => ({
  searchSongs: vi.fn(),
  fetchPlaylist: vi.fn(),
  queueSong: vi.fn(),
  prioritizeSong: vi.fn(),
  deleteSong: vi.fn(),
  toggleVocals: vi.fn(),
  restartDevice: vi.fn(),
  toggleMute: vi.fn(),
  musicUp: vi.fn(),
  musicDown: vi.fn(),
}))

vi.mock('./lib/kodApi', () => ({
  DEFAULT_BASE_URL: 'http://192.168.0.8:8080',
  DEFAULT_LANG: '\u56fd\u8bed',
  deleteSong,
  fetchPlaylist,
  prioritizeSong,
  queueSong,
  restartDevice,
  searchSongs,
  musicDown,
  musicUp,
  toggleMute,
  toggleVocals,
}))

import App from './App.vue'

function buildSearchResponse() {
  return {
    page: 0,
    maxPage: 45658,
    number: 1,
    songs: [
      {
        id: '9029901',
        name: 'Lucky',
        singer: 'Tester',
        cloud: false,
      },
    ],
    raw: { page: 0 },
  }
}

function buildPlaylistResponse() {
  return {
    number: 1,
    hasChange: 'true',
    statePlay: false,
    stateMute: false,
    stateMuOr: false,
    songs: [
      {
        id: '1486462',
        name: 'Ten Years',
        singer: 'Eason',
      },
    ],
    raw: { number: 1 },
  }
}

describe('App', () => {
  beforeEach(() => {
    searchSongs.mockReset()
    fetchPlaylist.mockReset()
    queueSong.mockReset()
    prioritizeSong.mockReset()
    deleteSong.mockReset()
    toggleVocals.mockReset()
    restartDevice.mockReset()
    toggleMute.mockReset()
    musicUp.mockReset()
    musicDown.mockReset()

    searchSongs.mockResolvedValue(buildSearchResponse())
    fetchPlaylist.mockResolvedValue(buildPlaylistResponse())
    queueSong.mockResolvedValue({ cmd: 'Add1', code: '0' })
    prioritizeSong.mockResolvedValue({ cmd: 'Pro1', code: '0' })
    deleteSong.mockResolvedValue({ cmd: 'Del1', code: '0' })
    toggleVocals.mockResolvedValue({ cmd: 'MuOr', code: '0' })
    restartDevice.mockResolvedValue({ cmd: 'Reset', code: '0' })
    toggleMute.mockResolvedValue({ cmd: 'Mute', code: '0' })
    musicUp.mockResolvedValue({ cmd: 'Music_up', code: '0' })
    musicDown.mockResolvedValue({ cmd: 'Music_down', code: '0' })
  })

  it('loads search results and playlist items on mount', async () => {
    const wrapper = mount(App)

    await flushPromises()

    expect(searchSongs).toHaveBeenCalledTimes(1)
    expect(fetchPlaylist).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Lucky')
    expect(wrapper.text()).toContain('Ten Years')

    wrapper.unmount()
  })

  it('queues a song from the search results and refreshes the playlist', async () => {
    const wrapper = mount(App)

    await flushPromises()
    await wrapper.get('[data-test="add-song-9029901"]').trigger('click')
    await flushPromises()

    expect(queueSong).toHaveBeenCalledWith('http://192.168.0.8:8080', '9029901')
    expect(fetchPlaylist).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('prioritizes a song from the search results and refreshes the playlist', async () => {
    const wrapper = mount(App)

    await flushPromises()
    await wrapper.get('[data-test="promote-song-9029901"]').trigger('click')
    await flushPromises()

    expect(prioritizeSong).toHaveBeenCalledWith('http://192.168.0.8:8080', '9029901')
    expect(fetchPlaylist).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('deletes a song from the playlist and refreshes the playlist', async () => {
    const wrapper = mount(App)

    await flushPromises()
    await wrapper.get('[data-test="delete-song-1486462"]').trigger('click')
    await flushPromises()

    expect(deleteSong).toHaveBeenCalledWith('http://192.168.0.8:8080', '1486462')
    expect(fetchPlaylist).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('prioritizes a song from the playlist and refreshes the playlist', async () => {
    const wrapper = mount(App)

    await flushPromises()
    await wrapper.get('[data-test="playlist-promote-song-1486462"]').trigger('click')
    await flushPromises()

    expect(prioritizeSong).toHaveBeenCalledWith('http://192.168.0.8:8080', '1486462')
    expect(fetchPlaylist).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('toggles vocals from the command bar and refreshes the playlist', async () => {
    const wrapper = mount(App)

    await flushPromises()
    await wrapper.get('[data-test="command-vocals"]').trigger('click')
    await flushPromises()

    expect(toggleVocals).toHaveBeenCalledWith('http://192.168.0.8:8080')
    expect(fetchPlaylist).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('sends mute from the command bar and refreshes the playlist', async () => {
    const wrapper = mount(App)

    await flushPromises()
    await wrapper.get('[data-test="command-mute"]').trigger('click')
    await flushPromises()

    expect(toggleMute).toHaveBeenCalledWith('http://192.168.0.8:8080')
    expect(fetchPlaylist).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('saves the edited base URL before running new requests', async () => {
    const wrapper = mount(App)

    await flushPromises()
    await wrapper.get('[data-test="base-url-input"]').setValue('http://10.0.0.20:8080')
    await wrapper.get('[data-test="save-base-url"]').trigger('click')
    await flushPromises()

    expect(window.localStorage.getItem('open-kod-base-url')).toBe('http://10.0.0.20:8080')
    expect(searchSongs).toHaveBeenLastCalledWith(
      'http://10.0.0.20:8080',
      expect.objectContaining({ page: 0 }),
    )
    expect(fetchPlaylist).toHaveBeenLastCalledWith('http://10.0.0.20:8080')

    wrapper.unmount()
  })
})
