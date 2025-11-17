<template>
    <!-- Main container -->
    <div class="container-fluid">
        <div class="d-flex flex-row flex-nowrap min-vh-200">

            <!-- 使用獨立的 Sidebar 組件 -->
            <MemberSidebar @logout="logout" />

            <!-- Main content -->
            <main class="main-content flex-grow-1 p-4">
                <div class="p-4">
                    <h2>會員評論紀錄</h2>

                    <div>
                        <table class="table table-hover align-middle text-center table-striped">
                            <thead class="table-info">
                                <tr>
                                    <th>訂單編號</th>
                                    <th>店家名稱</th>
                                    <th>超好吃！</th>
                                    <th>超迅速！</th>
                                    <th>超友善！</th>
                                    <th>超上相！</th>
                                    <th>高CP值！</th>
                                    <th class="comment-text">評論內容</th>
                                    <th>圖片</th>
                                    <th>評論時間</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-if="comments.length === 0">
                                    <td colspan="10" class="py-4 text-muted text-center">尚無資料</td>
                                </tr>

                                <tr v-else v-for="comment in comments" :key="comment.commentId">
                                    <td>{{ comment.orderId }}</td>
                                    <td>{{ comment.vendorName }}</td>
                                    <td class="text-center">{{ comment.delicious ? '✓' : '' }}</td>
                                    <td class="text-center">{{ comment.quick ? '✓' : '' }}</td>
                                    <td class="text-center">{{ comment.friendly ? '✓' : '' }}</td>
                                    <td class="text-center">{{ comment.photogenic ? '✓' : '' }}</td>
                                    <td class="text-center">{{ comment.topCP ? '✓' : '' }}</td>
                                    <td class="comment-text">{{ comment.commentContext }}</td>

                                    <td>
                                        <img v-for="(img, idx) in [comment.photo1, comment.photo2, comment.photo3].filter(p => p)"
                                            :key="idx" :src="`${BASE_URL}${img.startsWith('/') ? img : '/' + img}`"
                                            alt="Comment Photo" class="comment-photo"
                                            @click="showImage(`${BASE_URL}${img.startsWith('/') ? img : '/' + img}`)" />
                                    </td>

                                    <td>{{ formatDate(comment.createdAt) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- 放大圖片遮罩 -->
                    <div v-if="activeImage" class="image-overlay" @click="activeImage = null">
                        <img :src="activeImage" alt="Full Image" class="full-image" />
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
import MemberSidebar from "@/components/member/memberSidebar.vue";

const comments = ref([])
const activeImage = ref(null)  // 點擊放大圖片
const BASE_URL = "http://localhost:8082"  // 後端根目錄

const showImage = (url) => {
    activeImage.value = url
}

// 格式化時間
const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleString()
}

onMounted(async () => {
    try {
        const profileRes = await axios.get('http://localhost:8082/api/member/profile', { withCredentials: true });
        if (profileRes.data && profileRes.data.memberId) {
            const memberId = profileRes.data.memberId
            const commentRes = await axios.get(`http://localhost:8082/comment/bymember/${memberId}`, { withCredentials: true })
            comments.value = commentRes.data
        }
    } catch (err) {
        console.error(err)
        comments.value = []
    }
})
</script>

<style scoped>
h2 {
    margin-top: 30px;
    margin-bottom: 30px;
}

td.comment-text,
th.comment-text {
    max-width: 350px;
    /* 收窄寬度，可調整 */
    white-space: normal;
    /* 允許自動換行 */
    word-wrap: break-word;
    /* 強制換行長單詞 */
}


table {
    width: 100%;
    /* 強制佔滿父容器 */
    min-width: 800px;
    /* 可視需求調整，防止表格過窄 */
    border-collapse: separate;
    /* 使用 separate 才能圓角 */
    border-spacing: 0;
    border-radius: 12px;
    /* 整個表格圓角 */
    overflow: hidden;
    /* 隱藏邊框外的內容 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    /* 軟陰影 */
}

th,
td {
    padding: 6px;
    text-align: center;
}

.comment-photo {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    margin: 2px;
    transition: transform 0.2s;
}

.comment-photo:hover {
    transform: scale(1.2);
}

/* 放大圖片遮罩 */
.image-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.full-image {
    max-width: 90%;
    max-height: 90%;
    border-radius: 8px;
}
</style>
