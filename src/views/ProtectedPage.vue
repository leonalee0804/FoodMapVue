<template>
  <div>
    <h2>會員專區</h2>
    <p v-if="userStore.isLoggedIn">
      歡迎，{{ userStore.userName }}！(ID: {{ userStore.userId }})
    </p>
    <button @click="logout">登出</button>
  </div>
</template>

<script>
import { useUserStore } from '../stores/user'

export default {
  setup() {
    const userStore = useUserStore()
    const logout = () => {
      userStore.logout()
    }
    return { userStore, logout }
  }
}
</script>
