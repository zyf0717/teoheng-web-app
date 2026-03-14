import { afterEach, vi } from 'vitest'

afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  window.localStorage.clear()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
