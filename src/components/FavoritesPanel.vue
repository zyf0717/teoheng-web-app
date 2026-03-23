<script setup>
defineProps({
  activeMobileTab: {
    type: String,
    required: true,
  },
  activeBrowseTab: {
    type: String,
    required: true,
  },
  favoriteSongs: {
    type: Array,
    required: true,
  },
  singerImageUrl: {
    type: Function,
    required: true,
  },
  isSongQueued: {
    type: Function,
    required: true,
  },
  isSongPending: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['promote-song', 'add-song', 'favorite-song'])
</script>

<template>
  <section
    class="panel stack mobile-panel"
    :class="{
      'mobile-panel-hidden': activeMobileTab !== 'favorites',
      'desktop-panel-hidden': activeBrowseTab !== 'favorites',
    }"
  >
    <div class="section-heading panel-heading">
      <div>
        <h2>Favourites</h2>
      </div>
    </div>

    <div v-if="favoriteSongs.length" class="table-wrap">
      <table>
        <tbody>
          <tr v-for="song in favoriteSongs" :key="song.id">
            <td class="top-hit-main-cell">
              <div class="top-hit-row-content">
                <img
                  v-if="song.singerPic"
                  :src="singerImageUrl(song.singerPic)"
                  :alt="`${song.singer} portrait`"
                  class="singer-icon"
                  loading="lazy"
                />
                <div class="song-meta">
                  <div class="song-title-row">
                    <strong>{{ song.name }}</strong>
                  </div>
                  <div class="song-artist">{{ song.singer }}</div>
                </div>
              </div>
            </td>
            <td class="top-hit-action-cell">
              <div class="action-cell">
                <button
                  :data-test="`favorite-panel-remove-song-${song.id}`"
                  type="button"
                  class="button-secondary button-command button-emoji"
                  :aria-label="`Remove ${song.name} from favorites`"
                  @click="emit('favorite-song', song)"
                >
                  ⭐️
                </button>
                <button
                  :data-test="`favorite-panel-promote-song-${song.id}`"
                  type="button"
                  class="button-secondary button-command button-emoji"
                  :disabled="isSongPending(song.id)"
                  @click="emit('promote-song', song.id)"
                >
                  ⏫
                </button>
                <button
                  :data-test="`favorite-panel-add-song-${song.id}`"
                  type="button"
                  class="button-secondary button-command"
                  :disabled="isSongPending(song.id)"
                  @click="emit('add-song', song.id)"
                >
                  {{ isSongQueued(song.id) ? 'Del' : 'Add' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty empty-state">
      <span>No favourites saved yet.</span>
    </div>
  </section>
</template>
