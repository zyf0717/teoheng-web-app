<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  DEFAULT_BASE_URL,
  DEFAULT_LANG,
  deleteSong,
  fetchPlaylist,
  musicDown,
  musicUp,
  prioritizeSong,
  queueSong,
  restartDevice,
  searchSongs,
  toggleMute,
  toggleVocals,
} from './lib/kodApi'

const POLL_INTERVAL_MS = 5000
const STORAGE_KEY = 'open-kod-base-url'

const activeBaseUrl = ref(window.localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE_URL)
const baseUrlInput = ref(activeBaseUrl.value)
const autoRefresh = ref(true)
const pageInput = ref(1)
const activeMobileTab = ref('search')
const commandBarBusy = ref(false)

const searchForm = reactive({
  songName: '',
  singer: '',
  lang: DEFAULT_LANG,
  songType: '',
  sortType: '',
})

const searchState = reactive({
  page: 0,
  maxPage: null,
  number: 0,
  status: 'Ready to search.',
  loading: false,
  songs: [],
})

const playlistState = reactive({
  loading: false,
  number: 0,
  hasChange: null,
  statePlay: null,
  stateMute: null,
  stateMuOr: null,
  songs: [],
})

let pollHandle = null

const displayPage = computed(() => searchState.page + 1)

const playlistFlags = computed(() => [
  `Play: ${formatFlag(playlistState.statePlay)}`,
  `Mute: ${formatFlag(playlistState.stateMute)}`,
  `MuOr: ${formatFlag(playlistState.stateMuOr)}`,
  `Changed: ${formatFlag(playlistState.hasChange)}`,
])

function formatFlag(value) {
  if (value === null || value === undefined || value === '') {
    return 'unknown'
  }

  return String(value)
}

function resetSearch() {
  searchForm.songName = ''
  searchForm.singer = ''
  searchForm.lang = DEFAULT_LANG
  searchForm.songType = ''
  searchForm.sortType = ''
  searchState.page = 0
  pageInput.value = 1
  searchState.status = 'Search form reset.'
}

function resolveBaseUrl(value) {
  return value.trim() || DEFAULT_BASE_URL
}

async function runSearch() {
  searchState.loading = true
  searchState.status = `Searching page ${displayPage.value}...`

  try {
    const response = await searchSongs(activeBaseUrl.value, {
      songName: searchForm.songName.trim(),
      songType: searchForm.songType.trim(),
      singer: searchForm.singer.trim(),
      lang: searchForm.lang.trim(),
      sortType: searchForm.sortType.trim(),
      page: searchState.page,
    })

    searchState.page = response.page
    pageInput.value = response.page + 1
    searchState.maxPage = response.maxPage
    searchState.number = response.number
    searchState.songs = response.songs
    searchState.status = response.songs.length
      ? `Showing ${response.number} result(s) on page ${response.page + 1}.`
      : 'No songs returned for this query.'
  } catch (error) {
    searchState.songs = []
    searchState.status = error.message
    console.error(error)
  } finally {
    searchState.loading = false
  }
}

async function refreshPlaylist() {
  playlistState.loading = true

  try {
    const response = await fetchPlaylist(activeBaseUrl.value)
    playlistState.number = response.number
    playlistState.hasChange = response.hasChange
    playlistState.statePlay = response.statePlay
    playlistState.stateMute = response.stateMute
    playlistState.stateMuOr = response.stateMuOr
    playlistState.songs = response.songs
  } catch (error) {
    console.error(error)
  } finally {
    playlistState.loading = false
  }
}

async function addSong(songId) {
  if (!songId) {
    return
  }

  try {
    await queueSong(activeBaseUrl.value, songId)
    await refreshPlaylist()
  } catch (error) {
    console.error(error)
  }
}

async function promoteSong(songId) {
  if (!songId) {
    return
  }

  try {
    await prioritizeSong(activeBaseUrl.value, songId)
    await refreshPlaylist()
  } catch (error) {
    console.error(error)
  }
}

async function removeSong(songId) {
  if (!songId) {
    return
  }

  try {
    await deleteSong(activeBaseUrl.value, songId)
    await refreshPlaylist()
  } catch (error) {
    console.error(error)
  }
}

async function runGlobalCommand(commandRunner) {
  if (commandBarBusy.value) {
    return
  }

  commandBarBusy.value = true

  try {
    await commandRunner(activeBaseUrl.value)
    await refreshPlaylist()
  } catch (error) {
    console.error(error)
  } finally {
    commandBarBusy.value = false
  }
}

function submitSearch() {
  searchState.page = 0
  pageInput.value = 1
  runSearch()
}

function goToPreviousPage() {
  if (searchState.page === 0 || searchState.loading) {
    return
  }

  searchState.page -= 1
  pageInput.value = searchState.page + 1
  runSearch()
}

function goToNextPage() {
  if (searchState.loading) {
    return
  }

  searchState.page += 1
  pageInput.value = searchState.page + 1
  runSearch()
}

function goToPage() {
  if (searchState.loading) {
    return
  }

  const nextPage = Math.max(1, Number(pageInput.value) || 1)
  searchState.page = nextPage - 1
  pageInput.value = nextPage
  runSearch()
}

function saveBaseUrl() {
  activeBaseUrl.value = resolveBaseUrl(baseUrlInput.value)
  baseUrlInput.value = activeBaseUrl.value
  window.localStorage.setItem(STORAGE_KEY, activeBaseUrl.value)
  runSearch()
  refreshPlaylist()
}

function syncPolling() {
  if (pollHandle) {
    window.clearInterval(pollHandle)
    pollHandle = null
  }

  if (autoRefresh.value) {
    pollHandle = window.setInterval(() => {
      refreshPlaylist()
    }, POLL_INTERVAL_MS)
  }
}

watch(autoRefresh, () => {
  syncPolling()
})

onMounted(() => {
  syncPolling()
  runSearch()
  refreshPlaylist()
})

onBeforeUnmount(() => {
  if (pollHandle) {
    window.clearInterval(pollHandle)
  }
})
</script>

<template>
  <main class="app-shell">
    <header class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Vue + Vite proof of concept</p>
        <h1>Open KOD</h1>
        <p class="subtitle">
          Search songs, queue tracks, and monitor the current playlist from one page.
        </p>
      </div>

      <form class="panel stack" @submit.prevent="saveBaseUrl">
        <label>
          Device base URL
          <input
            v-model="baseUrlInput"
            data-test="base-url-input"
            type="url"
            placeholder="http://192.168.0.8:8080"
          />
        </label>
        <div class="toolbar">
          <button data-test="save-base-url" type="submit">Save</button>
        </div>
      </form>
    </header>

    <div class="mobile-tabs section-gap" role="tablist" aria-label="Main panels">
      <button
        type="button"
        class="mobile-tab"
        :class="{ 'mobile-tab-active': activeMobileTab === 'search' }"
        :aria-selected="activeMobileTab === 'search'"
        @click="activeMobileTab = 'search'"
      >
        Search
      </button>
      <button
        type="button"
        class="mobile-tab"
        :class="{ 'mobile-tab-active': activeMobileTab === 'playlist' }"
        :aria-selected="activeMobileTab === 'playlist'"
        @click="activeMobileTab = 'playlist'"
      >
        Playlist
      </button>
    </div>

    <div class="main-panels section-gap">
      <section class="panel stack mobile-panel" :class="{ 'mobile-panel-hidden': activeMobileTab !== 'search' }">
        <div class="section-heading">
          <div>
            <h2>Song Search</h2>
            <p>{{ searchState.status }}</p>
          </div>
        </div>

        <form class="grid-form" @submit.prevent="submitSearch">
          <label>
            Song name
            <input v-model="searchForm.songName" type="text" placeholder="Song title" />
          </label>
          <label>
            Singer
            <input v-model="searchForm.singer" type="text" placeholder="Singer name" />
          </label>
          <label>
            Language
            <input v-model="searchForm.lang" type="text" />
          </label>
          <label>
            Song type
            <input v-model="searchForm.songType" type="text" placeholder="Optional" />
          </label>
          <label>
            Sort type
            <input v-model="searchForm.sortType" type="text" placeholder="Optional" />
          </label>
          <div class="toolbar align-end">
            <button data-test="search-submit" type="submit" :disabled="searchState.loading">
              {{ searchState.loading ? 'Searching...' : 'Search' }}
            </button>
            <button type="button" class="button-secondary" @click="resetSearch">Reset</button>
          </div>
        </form>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Song</th>
                <th>Singer</th>
                <th>Cloud</th>
                <th></th>
              </tr>
            </thead>
            <tbody v-if="searchState.songs.length">
              <tr v-for="song in searchState.songs" :key="song.id">
                <td>{{ song.name }}</td>
                <td>{{ song.singer }}</td>
                <td>{{ song.cloud ? 'Yes' : 'No' }}</td>
                <td class="action-cell">
                  <button
                    :data-test="`promote-song-${song.id}`"
                    type="button"
                    class="button-secondary button-command"
                    @click="promoteSong(song.id)"
                  >
                    TOP
                  </button>
                  <button
                    :data-test="`add-song-${song.id}`"
                    type="button"
                    class="button-secondary button-command"
                    @click="addSong(song.id)"
                  >
                    ADD
                  </button>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="4" class="empty">No results yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-stack">
          <div class="pagination-bar">
            <button type="button" @click="goToPreviousPage" :disabled="searchState.page === 0 || searchState.loading">
              Prev
            </button>
            <span>Page {{ displayPage }}</span>
            <button type="button" @click="goToNextPage" :disabled="searchState.loading">
              Next
            </button>
          </div>
          <div class="page-jump-row">
            <label class="page-jump">
              <span>Specify page:</span>
              <input v-model.number="pageInput" type="number" min="1" />
            </label>
            <button type="button" @click="goToPage" :disabled="searchState.loading">
              Go
            </button>
          </div>
        </div>
      </section>

      <section class="panel stack mobile-panel" :class="{ 'mobile-panel-hidden': activeMobileTab !== 'playlist' }">
        <div class="section-heading">
          <div>
            <h2>Playlist</h2>
            <p>{{ playlistState.number }} item(s) returned.</p>
          </div>
          <div class="toolbar">
            <label class="checkbox">
              <input v-model="autoRefresh" type="checkbox" />
              Auto refresh
            </label>
            <button
              data-test="refresh-playlist"
              type="button"
              @click="refreshPlaylist"
              :disabled="playlistState.loading"
            >
              {{ playlistState.loading ? 'Refreshing...' : 'Refresh' }}
            </button>
          </div>
        </div>

        <div class="pill-row">
          <span v-for="flag in playlistFlags" :key="flag" class="pill">{{ flag }}</span>
        </div>

        <ol v-if="playlistState.songs.length" class="playlist">
          <li v-for="song in playlistState.songs" :key="`${song.id}-${song.name}`">
            <div class="playlist-row">
              <span>
                <strong>{{ song.name }}</strong> by {{ song.singer }}
              </span>
              <div class="action-cell">
                <button
                  :data-test="`playlist-promote-song-${song.id}`"
                  type="button"
                  class="button-secondary button-command"
                  @click="promoteSong(song.id)"
                >
                  TOP
                </button>
                <button
                  :data-test="`delete-song-${song.id}`"
                  type="button"
                  class="button-secondary button-danger"
                  @click="removeSong(song.id)"
                >
                  DEL
                </button>
              </div>
            </div>
          </li>
        </ol>
        <p v-else class="empty">Playlist is empty.</p>
      </section>
    </div>
  </main>

  <div class="command-bar">
    <div class="command-bar-inner">
      <button data-test="command-reset" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(restartDevice)">
        Restart
      </button>
      <button data-test="command-mute" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(toggleMute)">
        Mute
      </button>
      <button data-test="command-vocals" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(toggleVocals)">
        Vocals
      </button>
      <button data-test="command-music-down" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(musicDown)">
        Music -
      </button>
      <button data-test="command-music-up" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(musicUp)">
        Music +
      </button>
    </div>
  </div>
</template>
