<script setup>
defineProps({
  activeMobileTab: {
    type: String,
    required: true,
  },
  playlistState: {
    type: Object,
    required: true,
  },
  pollIntervalMs: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['promote-song', 'remove-song'])
</script>

<template>
  <section class="panel stack mobile-panel" :class="{ 'mobile-panel-hidden': activeMobileTab !== 'playlist' }">
    <div class="section-heading panel-heading">
      <div>
        <h2>Playlist</h2>
        <p class="field-help playlist-subtitle">
          <em>Refreshes automatically every {{ pollIntervalMs / 1000 }} seconds.</em>
        </p>
      </div>
    </div>

    <ol v-if="playlistState.songs.length" class="playlist">
      <li v-for="song in playlistState.songs" :key="`${song.id}-${song.name}`">
        <div class="playlist-row">
          <div class="song-meta">
            <div class="song-title-row">
              <strong>{{ song.name }}</strong>
            </div>
            <div class="song-artist">{{ song.singer }}</div>
          </div>
          <div class="action-cell">
            <button
              :data-test="`playlist-promote-song-${song.id}`"
              type="button"
              class="button-secondary button-command button-emoji"
              @click="emit('promote-song', song.id)"
            >
              ⏫
            </button>
            <button
              :data-test="`delete-song-${song.id}`"
              type="button"
              class="button-secondary button-danger button-emoji"
              @click="emit('remove-song', song.id)"
            >
              ⛔
            </button>
          </div>
        </div>
      </li>
    </ol>
    <p v-else class="empty">Playlist is empty.</p>
  </section>
</template>
