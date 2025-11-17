import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
let ws = null

// 黑名單狀態
const isBlacklisted = ref(false)

function connectWebSocket(memberId) {
    if (!memberId) return

    ws = new WebSocket(`ws://localhost:8082/ws/blacklist?memberId=${memberId}`)

    ws.onopen = () => {
        console.log("WebSocket 已連線")
    }

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        console.log("收到黑名單推播:", msg)

        if (msg.type === 'add') {
            isBlacklisted.value = true
            userStore.isBlacklisted = true
            alert(`⚠️ 您已被加入黑名單，原因：${msg.data.reason}`)
        } else if (msg.type === 'remove') {
            isBlacklisted.value = false
            userStore.isBlacklisted = false
            alert("✅ 您已被解除黑名單")
        }
    }

    ws.onclose = () => {
        console.log("WebSocket 已關閉，重新連線中...")
        setTimeout(() => connectWebSocket(memberId), 3000)
    }
}

export { connectWebSocket, isBlacklisted }
