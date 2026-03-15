<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import packageJson from '../package.json'
import PlaylistPanel from './components/PlaylistPanel.vue'
import SingerPanel from './components/SingerPanel.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import TopHitsPanel from './components/TopHitsPanel.vue'
import { reloadPage } from './lib/browserLocation'
import { resolveBaseUrl } from './lib/baseUrl'
import {
  BASE_URL_QUERY_PARAM,
  CLOUD_MARKER,
  DIAGNOSTIC_EVENT_LIMIT,
  LANGUAGE_OPTIONS,
  MIC_CONTROL_STORAGE_KEY,
  POLL_INTERVAL_MS,
  SINGER_COUNTRY_OPTIONS,
  SONG_TYPE_OPTIONS,
  SUPPORT_EMAIL,
} from './lib/appOptions'
import {
  deleteSong,
  fetchPlaylist,
  fetchSingers,
  micDown,
  micUp,
  musicDown,
  musicUp,
  prioritizeSong,
  queueSong,
  restartDevice,
  searchSongs,
  skipSong,
  toneDown,
  toneReset,
  toneUp,
  togglePlay,
  toggleMute,
  toggleVocals,
} from './lib/kodApi'

const initialBaseUrl = getBaseUrlFromQuery()
const initialPrimaryTab = initialBaseUrl ? 'topHits' : 'settings'
const activeBaseUrl = ref(initialBaseUrl)
const baseUrlInput = ref(initialBaseUrl)
const pageInput = ref(1)
const singerPageInput = ref(1)
const activeMobileTab = ref(initialPrimaryTab)
const activeBrowseTab = ref(initialPrimaryTab)
const commandBarBusy = ref(false)
const commandBarRef = ref(null)
const systemPrefersDarkMode = ref(getSystemDarkModePreference())
const themeOverride = ref(null)
const isDarkMode = computed(() => themeOverride.value ?? systemPrefersDarkMode.value)
const micControlledByKod = ref(window.localStorage.getItem(MIC_CONTROL_STORAGE_KEY) === 'true')
const showMixerControls = ref(false)

const searchForm = reactive({
  songName: '',
  singer: '',
  lang: LANGUAGE_OPTIONS[0].value,
  songType: '',
  sortType: '',
})

const singerForm = reactive({
  singer: '',
  singerType: SINGER_COUNTRY_OPTIONS[0].value,
})

const searchState = reactive({
  page: 0,
  maxPage: null,
  loading: false,
  songs: [],
  errorMessage: '',
})

const playlistState = reactive({
  loading: false,
  songs: [],
})

const singerState = reactive({
  page: 0,
  maxPage: null,
  loading: false,
  singers: [],
  errorMessage: '',
})

const diagnosticsState = reactive({
  lastError: '',
  lastRequest: '',
  lastRequestLabel: '',
  lastResponse: '',
  reportStatus: '',
  events: [],
})

let pollHandle = null
let commandBarResizeObserver = null
let reportStatusTimeout = null
let themeMediaQuery = null

const displayPage = computed(() => searchState.page + 1)
const singerDisplayPage = computed(() => singerState.page + 1)

function clearSearchForm() {
  searchForm.songName = ''
  searchForm.singer = ''
  searchForm.lang = LANGUAGE_OPTIONS[0].value
  searchForm.songType = ''
  searchForm.sortType = ''
  searchState.page = 0
  pageInput.value = 1
}

function resetSearch() {
  clearSearchForm()
  runSearch()
}

function hasConfiguredBaseUrl() {
  return Boolean(activeBaseUrl.value.trim())
}

function getBaseUrlFromQuery() {
  const currentUrl = new URL(window.location.href)
  return resolveBaseUrl(currentUrl.searchParams.get(BASE_URL_QUERY_PARAM) || '')
}

function getSystemDarkModePreference() {
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
}

function setThemeOverride(nextValue) {
  themeOverride.value = nextValue
}

function syncBaseUrlQuery(value) {
  const currentUrl = new URL(window.location.href)
  const trimmedValue = value.trim()

  if (trimmedValue) {
    currentUrl.searchParams.set(BASE_URL_QUERY_PARAM, trimmedValue)
  } else {
    currentUrl.searchParams.delete(BASE_URL_QUERY_PARAM)
  }

  window.history.replaceState({}, '', currentUrl)
}

function reloadIntoPrimaryTab() {
  reloadPage()
}

function logDiagnosticEvent(message) {
  diagnosticsState.events.unshift(`${new Date().toISOString()} ${message}`)
  diagnosticsState.events.splice(DIAGNOSTIC_EVENT_LIMIT)
}

function setLastRequest(label, details) {
  diagnosticsState.lastRequestLabel = label
  diagnosticsState.lastRequest = details
}

function setLastResponse(details) {
  diagnosticsState.lastResponse = details
}

function setLastError(message) {
  diagnosticsState.lastError = message
}

function clearReportStatus() {
  if (reportStatusTimeout) {
    window.clearTimeout(reportStatusTimeout)
    reportStatusTimeout = null
  }
}

function setReportStatus(message) {
  clearReportStatus()
  diagnosticsState.reportStatus = message

  if (message) {
    reportStatusTimeout = window.setTimeout(() => {
      diagnosticsState.reportStatus = ''
      reportStatusTimeout = null
    }, 4000)
  }
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

function buildDiagnosticsReport() {
  const lines = [
    'Open KOD issue report',
    `Version: ${packageJson.version}`,
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${activeBaseUrl.value}`,
    `Active mobile tab: ${activeMobileTab.value}`,
    `Active browse tab: ${activeBrowseTab.value}`,
    `Theme: ${isDarkMode.value ? 'dark' : 'light'}`,
    `Mic controlled by KOD: ${micControlledByKod.value ? 'yes' : 'no'}`,
    `Top Hits filters: title="${searchForm.songName}" singer="${searchForm.singer}" lang="${searchForm.lang}" songType="${searchForm.songType}" sortType="${searchForm.sortType}"`,
    `Top Hits page: ${displayPage.value}${searchState.maxPage ? `/${searchState.maxPage}` : ''}`,
    `Singer filters: singer="${singerForm.singer}" country="${singerForm.singerType}"`,
    `Singer page: ${singerDisplayPage.value}${singerState.maxPage ? `/${singerState.maxPage}` : ''}`,
    `Playlist items: ${playlistState.songs.length}`,
    `Last request: ${diagnosticsState.lastRequestLabel || 'n/a'} ${diagnosticsState.lastRequest || ''}`.trim(),
    `Last response: ${diagnosticsState.lastResponse || 'n/a'}`,
    `Last error: ${diagnosticsState.lastError || 'none'}`,
    `User agent: ${navigator.userAgent}`,
    'Recent events:',
    ...diagnosticsState.events,
  ]

  return lines.join('\n')
}

function buildReportFilename() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `open-kod-issue-report-${stamp}.txt`
}

function downloadIssueReport() {
  try {
    downloadTextFile(buildReportFilename(), buildDiagnosticsReport())
    setReportStatus('Issue report downloaded. Attach it to your email.')
    logDiagnosticEvent('Issue report downloaded')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    setReportStatus('Unable to download the issue report on this browser.')
    setLastError(message)
    logDiagnosticEvent(`Issue report download failed: ${message}`)
  }
}

function singerImageUrl(fileName) {
  if (!fileName || !hasConfiguredBaseUrl()) {
    return ''
  }

  return new URL(`singer/${fileName}`, `${activeBaseUrl.value.replace(/\/+$/, '')}/`).toString()
}

async function runSearch() {
  if (!hasConfiguredBaseUrl()) {
    searchState.loading = false
    searchState.maxPage = null
    searchState.songs = []
    searchState.errorMessage = ''
    setLastResponse('Search skipped: no base URL configured')
    return
  }

  searchState.loading = true
  searchState.errorMessage = ''

  try {
    setLastRequest(
      'SearchServlet',
      `page=${searchState.page} songName="${searchForm.songName.trim()}" singer="${searchForm.singer.trim()}" lang="${searchForm.lang.trim()}" songType="${searchForm.songType.trim()}" sortType="${searchForm.sortType.trim()}"`,
    )
    const response = await searchSongs(activeBaseUrl.value, {
      songName: searchForm.songName.trim(),
      singer: searchForm.singer.trim(),
      songType: searchForm.songType.trim(),
      lang: searchForm.lang.trim(),
      sortType: searchForm.sortType.trim(),
      page: searchState.page,
    })

    searchState.page = response.page
    searchState.maxPage = response.maxPage
    pageInput.value = response.page + 1
    searchState.songs = response.songs
    searchState.errorMessage = ''
    setLastResponse(`Search returned ${response.number} result(s), max page ${response.maxPage ?? 'n/a'}`)
    setLastError('')
    logDiagnosticEvent(`Search returned ${response.number} result(s)`)
  } catch (error) {
    searchState.maxPage = null
    searchState.songs = []
    searchState.errorMessage = 'Unable to load songs. Check the server URL in Setup.'
    setLastError(error instanceof Error ? error.message : String(error))
    setLastResponse('Search failed')
    logDiagnosticEvent(`Search failed: ${diagnosticsState.lastError}`)
    console.error(error)
  } finally {
    searchState.loading = false
  }
}

async function refreshPlaylist(force = false) {
  if (playlistState.loading && !force) {
    return
  }

  if (!hasConfiguredBaseUrl()) {
    playlistState.loading = false
    playlistState.songs = []
    setLastResponse('Playlist skipped: no base URL configured')
    return
  }

  playlistState.loading = true

  try {
    setLastRequest('PlaylistServlet', 'type=1 onSelectPage=true')
    const response = await fetchPlaylist(activeBaseUrl.value)
    playlistState.songs = response.songs
    setLastResponse(`Playlist returned ${response.number} item(s)`)
    setLastError('')
  } catch (error) {
    setLastError(error instanceof Error ? error.message : String(error))
    setLastResponse('Playlist refresh failed')
    logDiagnosticEvent(`Playlist refresh failed: ${diagnosticsState.lastError}`)
    console.error(error)
  } finally {
    playlistState.loading = false
  }
}

async function runSingerSearch() {
  if (!hasConfiguredBaseUrl()) {
    singerState.loading = false
    singerState.maxPage = null
    singerState.singers = []
    singerState.errorMessage = ''
    setLastResponse('Singer search skipped: no base URL configured')
    return
  }

  singerState.loading = true
  singerState.errorMessage = ''

  try {
    setLastRequest('SingerServlet', `page=${singerState.page} singer="${singerForm.singer.trim()}" singerType="${singerForm.singerType}"`)
    const response = await fetchSingers(activeBaseUrl.value, {
      singer: singerForm.singer.trim(),
      singerType: singerForm.singerType,
      sortType: '',
      page: singerState.page,
    })

    singerState.page = response.page
    singerState.maxPage = response.maxPage
    singerPageInput.value = response.page + 1
    singerState.singers = response.singers
    singerState.errorMessage = ''
    setLastResponse(`Singer search returned ${response.number} result(s), max page ${response.maxPage ?? 'n/a'}`)
    setLastError('')
    logDiagnosticEvent(`Singer search returned ${response.number} result(s)`)
  } catch (error) {
    singerState.maxPage = null
    singerState.singers = []
    singerState.errorMessage = 'Unable to load singers. Check the server URL in Setup.'
    setLastError(error instanceof Error ? error.message : String(error))
    setLastResponse('Singer search failed')
    logDiagnosticEvent(`Singer search failed: ${diagnosticsState.lastError}`)
    console.error(error)
  } finally {
    singerState.loading = false
  }
}

function submitSingerSearch() {
  singerState.page = 0
  singerPageInput.value = 1
  runSingerSearch()
}

function resetSingerSearch() {
  singerForm.singer = ''
  singerForm.singerType = SINGER_COUNTRY_OPTIONS[0].value
  singerState.page = 0
  singerPageInput.value = 1
  runSingerSearch()
}

function searchTopHitsBySinger(singerName) {
  clearSearchForm()
  searchForm.singer = singerName.trim()
  setBrowseTab('topHits')
  runSearch()
}

function setMobileTab(tab) {
  activeMobileTab.value = tab

  if (tab === 'topHits' || tab === 'singer') {
    activeBrowseTab.value = tab
  }
}

function setBrowseTab(tab) {
  activeBrowseTab.value = tab
  activeMobileTab.value = tab
}

function goToSetup() {
  setBrowseTab('settings')
}

function goToPreviousSingerPage() {
  if (singerState.page === 0 || singerState.loading) {
    return
  }

  singerState.page -= 1
  singerPageInput.value = singerState.page + 1
  runSingerSearch()
}

function goToNextSingerPage() {
  if (singerState.loading) {
    return
  }

  singerState.page += 1
  singerPageInput.value = singerState.page + 1
  runSingerSearch()
}

function goToSingerPage() {
  if (singerState.loading) {
    return
  }

  const nextPage = Math.max(1, Number(singerPageInput.value) || 1)
  singerState.page = nextPage - 1
  singerPageInput.value = nextPage
  runSingerSearch()
}

async function addSong(songId) {
  if (!songId || !hasConfiguredBaseUrl()) {
    return
  }

  try {
    setLastRequest('CommandServlet', `cmd=Add1 cmdValue=${songId}`)
    await queueSong(activeBaseUrl.value, songId)
    setLastResponse(`Command Add1 succeeded for ${songId}`)
    setLastError('')
    logDiagnosticEvent(`Queued song ${songId}`)
    await refreshPlaylist(true)
  } catch (error) {
    setLastError(error instanceof Error ? error.message : String(error))
    setLastResponse('Command Add1 failed')
    logDiagnosticEvent(`Queue failed for ${songId}: ${diagnosticsState.lastError}`)
    console.error(error)
  }
}

async function promoteSong(songId) {
  if (!songId || !hasConfiguredBaseUrl()) {
    return
  }

  try {
    setLastRequest('CommandServlet', `cmd=Pro1 cmdValue=${songId}`)
    await prioritizeSong(activeBaseUrl.value, songId)
    setLastResponse(`Command Pro1 succeeded for ${songId}`)
    setLastError('')
    logDiagnosticEvent(`Prioritized song ${songId}`)
    await refreshPlaylist(true)
  } catch (error) {
    setLastError(error instanceof Error ? error.message : String(error))
    setLastResponse('Command Pro1 failed')
    logDiagnosticEvent(`Prioritize failed for ${songId}: ${diagnosticsState.lastError}`)
    console.error(error)
  }
}

async function removeSong(songId) {
  if (!songId || !hasConfiguredBaseUrl()) {
    return
  }

  try {
    setLastRequest('CommandServlet', `cmd=Del1 cmdValue=${songId}`)
    await deleteSong(activeBaseUrl.value, songId)
    setLastResponse(`Command Del1 succeeded for ${songId}`)
    setLastError('')
    logDiagnosticEvent(`Deleted song ${songId}`)
    await refreshPlaylist(true)
  } catch (error) {
    setLastError(error instanceof Error ? error.message : String(error))
    setLastResponse('Command Del1 failed')
    logDiagnosticEvent(`Delete failed for ${songId}: ${diagnosticsState.lastError}`)
    console.error(error)
  }
}

async function runGlobalCommand(commandRunner) {
  if (commandBarBusy.value || !hasConfiguredBaseUrl()) {
    return
  }

  commandBarBusy.value = true

  try {
    setLastRequest('CommandServlet', `cmd=${commandRunner.name || 'unknown'}`)
    await commandRunner(activeBaseUrl.value)
    setLastResponse(`Command ${commandRunner.name || 'unknown'} succeeded`)
    setLastError('')
    logDiagnosticEvent(`Command ${commandRunner.name || 'unknown'} succeeded`)
    await refreshPlaylist(true)
  } catch (error) {
    setLastError(error instanceof Error ? error.message : String(error))
    setLastResponse(`Command ${commandRunner.name || 'unknown'} failed`)
    logDiagnosticEvent(`Command ${commandRunner.name || 'unknown'} failed: ${diagnosticsState.lastError}`)
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

async function saveResolvedBaseUrl(nextBaseUrl = baseUrlInput.value) {
  const trimmedBaseUrl = nextBaseUrl.trim()
  const resolvedBaseUrl = resolveBaseUrl(nextBaseUrl)

  baseUrlInput.value = resolvedBaseUrl

  if (!resolvedBaseUrl) {
    activeBaseUrl.value = ''
    syncBaseUrlQuery('')
    logDiagnosticEvent(trimmedBaseUrl ? `Base URL saved: ${resolvedBaseUrl}` : 'Base URL cleared')
    reloadIntoPrimaryTab()
    return
  }

  activeBaseUrl.value = resolvedBaseUrl
  syncBaseUrlQuery(resolvedBaseUrl)
  logDiagnosticEvent(`Base URL saved: ${resolvedBaseUrl}`)
  reloadIntoPrimaryTab()
}

async function saveBaseUrl() {
  await saveResolvedBaseUrl(baseUrlInput.value)
}

async function handleScannedBaseUrl(scannedBaseUrl) {
  await saveResolvedBaseUrl(scannedBaseUrl)
}

function initializeDeviceAccess() {
  syncPolling()
  runSearch()
  runSingerSearch()
  refreshPlaylist()
}

function syncPolling() {
  if (pollHandle) {
    window.clearInterval(pollHandle)
    pollHandle = null
  }

  pollHandle = window.setInterval(() => {
    refreshPlaylist()
  }, POLL_INTERVAL_MS)
}

function updateCommandBarOffset() {
  const height = commandBarRef.value
    ? Math.ceil(commandBarRef.value.getBoundingClientRect().height)
    : 0

  document.documentElement.style.setProperty('--command-bar-offset', `${height + 16}px`)
}

function applyTheme() {
  document.documentElement.dataset.theme = isDarkMode.value ? 'dark' : 'light'
}

function syncThemePreference(event) {
  systemPrefersDarkMode.value = event.matches
}

function saveMicControlPreference() {
  window.localStorage.setItem(MIC_CONTROL_STORAGE_KEY, micControlledByKod.value ? 'true' : 'false')
}

watch(isDarkMode, () => {
  applyTheme()
})

watch(micControlledByKod, () => {
  saveMicControlPreference()
})

onMounted(() => {
  applyTheme()
  themeMediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null

  if (themeMediaQuery) {
    themeMediaQuery.addEventListener('change', syncThemePreference)
  }

  logDiagnosticEvent('Session started')
  initializeDeviceAccess()
  updateCommandBarOffset()

  if (typeof ResizeObserver !== 'undefined' && commandBarRef.value) {
    commandBarResizeObserver = new ResizeObserver(() => {
      updateCommandBarOffset()
    })
    commandBarResizeObserver.observe(commandBarRef.value)
  }

  window.addEventListener('resize', updateCommandBarOffset)
})

onBeforeUnmount(() => {
  if (pollHandle) {
    window.clearInterval(pollHandle)
  }

  if (commandBarResizeObserver) {
    commandBarResizeObserver.disconnect()
  }

  if (themeMediaQuery) {
    themeMediaQuery.removeEventListener('change', syncThemePreference)
  }

  clearReportStatus()

  window.removeEventListener('resize', updateCommandBarOffset)
})
</script>

<template>
  <main class="app-shell">
    <div class="mobile-tabs section-gap" role="tablist" aria-label="Main panels">
      <button
        type="button"
        class="mobile-tab"
        :class="{ 'mobile-tab-active': activeMobileTab === 'settings' }"
        :aria-selected="activeMobileTab === 'settings'"
        @click="setMobileTab('settings')"
      >
        Setup
      </button>
      <button
        type="button"
        class="mobile-tab"
        :class="{ 'mobile-tab-active': activeMobileTab === 'topHits' }"
        :aria-selected="activeMobileTab === 'topHits'"
        @click="setBrowseTab('topHits')"
      >
        Top Hits
      </button>
      <button
        type="button"
        class="mobile-tab"
        :class="{ 'mobile-tab-active': activeMobileTab === 'singer' }"
        :aria-selected="activeMobileTab === 'singer'"
        @click="setBrowseTab('singer')"
      >
        Singer
      </button>
      <button
        type="button"
        class="mobile-tab"
        :class="{ 'mobile-tab-active': activeMobileTab === 'playlist' }"
        :aria-selected="activeMobileTab === 'playlist'"
        @click="setMobileTab('playlist')"
      >
        Playlist
      </button>
    </div>

    <div class="desktop-tabs desktop-only section-gap" role="tablist" aria-label="Main panels">
      <button
        data-test="desktop-tab-settings"
        type="button"
        class="mobile-tab"
        :class="{ 'mobile-tab-active': activeBrowseTab === 'settings' }"
        :aria-selected="activeBrowseTab === 'settings'"
        @click="setBrowseTab('settings')"
      >
        Setup
      </button>
      <button
        data-test="desktop-tab-top-hits"
        type="button"
        class="mobile-tab"
        :class="{ 'mobile-tab-active': activeBrowseTab === 'topHits' }"
        :aria-selected="activeBrowseTab === 'topHits'"
        @click="setBrowseTab('topHits')"
      >
        Top Hits
      </button>
      <button
        data-test="desktop-tab-singer"
        type="button"
        class="mobile-tab"
        :class="{ 'mobile-tab-active': activeBrowseTab === 'singer' }"
        :aria-selected="activeBrowseTab === 'singer'"
        @click="setBrowseTab('singer')"
      >
        Singer
      </button>
    </div>

    <div class="main-panels section-gap">
      <div class="primary-column stack">
        <section
          class="panel stack mobile-panel settings-panel"
          :class="{
            'mobile-panel-hidden': activeMobileTab !== 'settings',
            'desktop-panel-hidden': activeBrowseTab !== 'settings',
          }"
        >
          <SettingsPanel
            :base-url-input="baseUrlInput"
            :is-dark-mode="isDarkMode"
            :mic-controlled-by-kod="micControlledByKod"
            :report-status="diagnosticsState.reportStatus"
            :support-email="SUPPORT_EMAIL"
            note-placement="footer"
            @download-report="downloadIssueReport"
            @scanner-detected-base-url="handleScannedBaseUrl"
            @save-base-url="saveBaseUrl"
            @update:base-url-input="baseUrlInput = $event"
            @update:is-dark-mode="setThemeOverride"
            @update:mic-controlled-by-kod="micControlledByKod = $event"
          />
        </section>

        <TopHitsPanel
          :active-mobile-tab="activeMobileTab"
          :active-browse-tab="activeBrowseTab"
          :search-state="searchState"
          :search-form="searchForm"
          :language-options="LANGUAGE_OPTIONS"
          :song-type-options="SONG_TYPE_OPTIONS"
          :cloud-marker="CLOUD_MARKER"
          :display-page="displayPage"
          :page-input="pageInput"
          :singer-image-url="singerImageUrl"
          @go-to-setup="goToSetup"
          @submit-search="submitSearch"
          @reset-search="resetSearch"
          @promote-song="promoteSong"
          @add-song="addSong"
          @update:page-input="pageInput = $event"
          @go-to-previous-page="goToPreviousPage"
          @go-to-next-page="goToNextPage"
          @go-to-page="goToPage"
        />

        <SingerPanel
          :active-mobile-tab="activeMobileTab"
          :active-browse-tab="activeBrowseTab"
          :singer-state="singerState"
          :singer-form="singerForm"
          :singer-country-options="SINGER_COUNTRY_OPTIONS"
          :singer-display-page="singerDisplayPage"
          :singer-page-input="singerPageInput"
          :singer-image-url="singerImageUrl"
          @go-to-setup="goToSetup"
          @submit-search="submitSingerSearch"
          @reset-search="resetSingerSearch"
          @search-top-hits-by-singer="searchTopHitsBySinger"
          @update:singer-page-input="singerPageInput = $event"
          @go-to-previous-page="goToPreviousSingerPage"
          @go-to-next-page="goToNextSingerPage"
          @go-to-page="goToSingerPage"
        />
      </div>

      <PlaylistPanel
        :active-mobile-tab="activeMobileTab"
        :playlist-state="playlistState"
        :poll-interval-ms="POLL_INTERVAL_MS"
        @promote-song="promoteSong"
        @remove-song="removeSong"
      />
    </div>
  </main>

  <div ref="commandBarRef" class="command-bar">
    <div class="command-bar-inner">
      <div v-show="showMixerControls" class="command-bar-row command-bar-row-primary">
        <div class="command-group">
          <span class="command-group-label">Pitch</span>
          <div class="command-group-buttons">
            <button data-test="command-tone-down" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(toneDown)">
              ♭
            </button>
            <button data-test="command-tone-reset" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(toneReset)">
              ♮
            </button>
            <button data-test="command-tone-up" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(toneUp)">
              ♯
            </button>
          </div>
        </div>
        <div class="command-group">
          <span class="command-group-label">Volume</span>
          <div class="command-group-buttons">
            <button data-test="command-mute" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(toggleMute)">
              🔇
            </button>
            <button data-test="command-music-down" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(musicDown)">
              🔉
            </button>
            <button data-test="command-music-up" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(musicUp)">
              🔊
            </button>
            <button data-test="command-mic-down" type="button" :disabled="commandBarBusy || !micControlledByKod" @click="runGlobalCommand(micDown)">
              🎤-
            </button>
            <button data-test="command-mic-up" type="button" :disabled="commandBarBusy || !micControlledByKod" @click="runGlobalCommand(micUp)">
              🎤+
            </button>
          </div>
        </div>
      </div>
      <div class="command-bar-row command-bar-row-secondary">
        <button data-test="command-reset" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(restartDevice)">
          Replay
        </button>
        <button data-test="command-vocals" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(toggleVocals)">
          Vocals
        </button>
        <button data-test="command-play" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(togglePlay)">
          ⏯
        </button>
        <button data-test="command-skip" type="button" :disabled="commandBarBusy" @click="runGlobalCommand(skipSong)">
          ⏭
        </button>
        <button
          data-test="command-toggle-mixer"
          type="button"
          :aria-expanded="showMixerControls"
          :title="showMixerControls ? 'Hide pitch and volume controls' : 'Show pitch and volume controls'"
          @click="showMixerControls = !showMixerControls"
        >
          ☰
        </button>
      </div>
    </div>
  </div>
</template>
