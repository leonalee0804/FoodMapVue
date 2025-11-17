<template>
    <div class="container-fluid">
        <div class="d-flex flex-row flex-nowrap">

                <!-- 使用獨立的 Sidebar 組件 -->
    <MemberSidebar @logout="logout" />

            <!-- Main content -->
            <main class="main-content flex-grow-1">

                <h2 class="mb-4 text-center fw-bold ">會員客服紀錄</h2>
                <div class="shadow-sm rounded-3 overflow-hidden" style="width: 80%; margin: 0 auto;">
                    <div class="table-responsive">
                        <table class="table table-hover table-bordered align-middle mb-0">
                            <thead class="table-success text-center align-middle">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">立案時間</th>
                                    <th scope="col">主旨</th>
                                    <th scope="col">內容</th>
                                    <th scope="col">客服回覆</th>
                                    <th scope="col">回覆時間</th>
                                </tr>
                            </thead>
                            <tbody class="text-center">
                                <tr v-if="loading">
                                    <td colspan="6" class="py-4 text-secondary">載入中...</td>
                                </tr>
                                <tr v-else-if="records.length === 0">
                                    <td colspan="6" class="py-4 text-muted">尚無客服紀錄</td>
                                </tr>
                                <tr v-else v-for="(r, index) in records" :key="index">
                                    <td class="fw-semibold text-secondary">{{ index + 1 }}</td>
                                    <td>{{ formatDate(r.createAt) }}</td>
                                    <td class="text-start">{{ r.subject }}</td>
                                    <td class="text-start text-break">{{ r.context }}</td>
                                    <td class="text-start text-break">{{ r.reply || '-' }}</td>
                                    <td>{{ formatDate(r.replyAt) || '-' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MemberSidebar from "@/components/member/memberSidebar.vue";

const memberId = ref('')
const records = ref([])
const loading = ref(false)

// 取得會員 session
async function fetchMemberSession() {
    try {
        const res = await axios.get('http://localhost:8082/api/member/profile', { withCredentials: true })
        if (res.data) memberId.value = res.data.memberId
    } catch (err) {
        console.error('取得會員資料失敗:', err)
    }
}

// 抓取客服紀錄
async function fetchRecords() {
    if (!memberId.value) return
    loading.value = true
    try {
        const res = await axios.get(`http://localhost:8082/customerservice/${memberId.value}`)
        records.value = res.data || []
    } catch (err) {
        console.error('讀取客服紀錄失敗:', err)
        records.value = []
    } finally {
        loading.value = false
    }
}

// 日期格式化
function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mi = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

onMounted(async () => {
    await fetchMemberSession()
    await fetchRecords()
})
</script>

<style scoped>
h2 {
    margin-top: 30px;
}

.cs-page {
    border-radius: 12px;
}

.table {
    font-size: 0.95rem;
}

.table-hover tbody tr:hover {
    background-color: #f8f5f0;
    transition: 0.2s ease-in-out;
}

th {
    white-space: nowrap;
}

td {
    vertical-align: middle;
    word-wrap: break-word;
    white-space: normal;
}

.text-break {
    word-break: break-word;
}
</style>
