// vuejs 3 websocket use hook

import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

export function useWebSocket({ url, reconnect = true }: { url: string; reconnect?: boolean }) {
  const ws = ref<WebSocket | null>(null)
  const websocketUrl = ref(url)

  const connectionState = ref<'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'>('CONNECTING')

  const close = () => {
    if (ws.value) {
      ws.value.close()
    }

    connectionState.value = 'CLOSED'
  }

  const connect = () => {
    ws.value = new WebSocket(websocketUrl.value)
    connectionState.value = 'CONNECTING'

    console.log('WebSocket connecting to', websocketUrl.value)

    ws.value.onopen = () => {
      connectionState.value = 'OPEN'
    }

    ws.value.onclose = () => {
      connectionState.value = 'CLOSED'

      if (reconnect) {
        console.log('WebSocket connection closed. Reconnecting in 1s …')

        setTimeout(() => {
          connect()
        }, 1000)

        connectionState.value = 'CONNECTING'
      }
    }
  }

  onMounted(() => {
    connect()
  })

  watch(
    () => url,
    () => {
      console.log('WebSocket URL changed. Reconnecting …')

      close()
      connect()
    },
  )

  onBeforeUnmount(() => {
    close()
  })

  return { ws, state: connectionState, connect, close }
}
