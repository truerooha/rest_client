type WebSocketMessage = {
  type: 'group_order_update' | 'order_status_update' | 'participant_joined' | 'participant_left'
  data: unknown
}

type WebSocketCallback = (message: WebSocketMessage) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string = ''
  private callbacks: WebSocketCallback[] = []
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 3000
  private isIntentionallyClosed: boolean = false
  
  connect(url: string, params: Record<string, string>) {
    this.url = `${url}?${new URLSearchParams(params).toString()}`
    this.isIntentionallyClosed = false
    this.reconnectAttempts = 0
    this.createConnection()
  }
  
  private createConnection() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }
    
    try {
      this.ws = new WebSocket(this.url)
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage
          this.callbacks.forEach((callback) => callback(message))
        } catch (error) {
          // Ignore parse errors
        }
      }
      
      this.ws.onerror = () => {
        // Connection error
      }
      
      this.ws.onclose = () => {
        if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts += 1
            this.createConnection()
          }, this.reconnectDelay)
        }
      }
    } catch (error) {
      // Connection failed
    }
  }
  
  subscribe(callback: WebSocketCallback) {
    this.callbacks = [...this.callbacks, callback]
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback)
    }
  }
  
  disconnect() {
    this.isIntentionallyClosed = true
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
  
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const wsClient = new WebSocketClient()
