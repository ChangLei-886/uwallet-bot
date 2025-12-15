// Lightweight wrapper for Telegram Web Apps SDK with a local fallback for development.
// Exports a default object with `isAvailable`, `init`, `expand`, `close`, `sendData`,
// `MainButton` and simple event helpers.

const hasWebApp = typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp
const tg = hasWebApp ? window.Telegram.WebApp : null

const fallback = {
  handlers: [],
  text: '',
  visible: false,
  disabled: false,
  onClick(h) { this.handlers.push(h) },
  offClick(h) { this.handlers = this.handlers.filter(fn => fn !== h) },
  click() { this.handlers.forEach(h => { try { h() } catch (e) { console.error(e) } }) }
}

// expose a dev helper to trigger the fallback main button from the console
if (!hasWebApp && typeof window !== 'undefined') {
  window.__tgDevMainButtonClick = () => fallback.click()
}

const wrapper = {
  isAvailable() {
    return !!tg
  },
  init() {
    if (tg && tg.ready) {
      try { tg.ready() } catch (e) { /* ignore */ }
    }
  },
  // return theme params (or empty object) for styling
  getThemeParams() {
    if (tg && tg.themeParams) return tg.themeParams
    return {}
  },
  // return color scheme: 'dark'|'light' or undefined
  getColorScheme() {
    if (tg && tg.colorScheme) return tg.colorScheme
    return undefined
  },
  // return raw initDataUnsafe when available (no validation performed)
  getInitDataUnsafe() {
    if (tg && tg.initDataUnsafe) return tg.initDataUnsafe
    return null
  },
  expand() { if (tg && tg.expand) tg.expand() },
  close() { if (tg && tg.close) tg.close() },
  sendData(payload) {
    if (tg && tg.sendData) {
      try { tg.sendData(payload) } catch (e) { console.error(e) }
    } else {
      // fallback: log to console so developer can see the payload
      // and also dispatch a custom event for local testing
      console.info('[Telegram.sendData - fallback]', payload)
      try {
        const ev = new CustomEvent('telegram:sendData', { detail: payload })
        window.dispatchEvent(ev)
      } catch (e) { /* ignore */ }
    }
  },
  MainButton: {
    setText(text) {
      if (tg && tg.MainButton && tg.MainButton.setText) tg.MainButton.setText(text)
      else fallback.text = text
    },
    show() { if (tg && tg.MainButton && tg.MainButton.show) tg.MainButton.show(); else fallback.visible = true },
    hide() { if (tg && tg.MainButton && tg.MainButton.hide) tg.MainButton.hide(); else fallback.visible = false },
    enable() { if (tg && tg.MainButton && tg.MainButton.enable) tg.MainButton.enable(); else fallback.disabled = false },
    disable() { if (tg && tg.MainButton && tg.MainButton.disable) tg.MainButton.disable(); else fallback.disabled = true },
    onClick(handler) { if (tg && tg.onEvent) tg.onEvent('mainButtonClicked', handler); else fallback.onClick(handler) },
    offClick(handler) { if (tg && tg.offEvent) tg.offEvent('mainButtonClicked', handler); else fallback.offClick(handler) },
    // dev helpers
    _devTrigger() { fallback.click() },
    _devState() { return { text: fallback.text, visible: fallback.visible, disabled: fallback.disabled } }
  },
  onEvent(name, handler) { if (tg && tg.onEvent) tg.onEvent(name, handler) },
  offEvent(name, handler) { if (tg && tg.offEvent) tg.offEvent(name, handler) }
}

export default wrapper
