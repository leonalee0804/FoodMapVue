<template>
    <div class="content">
        <h2>常見Q&A</h2>
        <FAQList />
        <div class="form-container">
            <h2>聯絡我們</h2>
            <form id="form" @submit.prevent="ServiceFormSubmit">
                <label for="email">Email</label>
                <input id="email" type="email" v-model="customerServive.email" placeholder="user@example.com"
                    autocomplete="off" required>

                <!-- 不顯示只抓值     -->
                <!-- <label for="memberId">會員ID（依Session自動代入） </label>
                <input id="memberId" type="number" v-model="customerServive.memberId" placeholder="1"
                    autocomplete="off"> -->

                <label for="subject">主旨（必填）</label>
                <input id="subject" type="text" v-model="customerServive.subject" placeholder="請輸入主旨" autocomplete="off"
                    required>

                <label for="vendor">廠商</label>
                <select id="vendor" class="form-select" v-model="customerServive.vendorId">
                    <!-- @change="getVerdorId($event)" -->
                    <option :value="null">-- 請選擇廠商 --</option>
                    <option v-for="vendor in vendorList" :key="vendor.id" :value="vendor.id">
                        {{ vendor.label }}
                    </option>
                </select>

                <label for="context">內容（必填）</label>
                <textarea id="context" v-model="customerServive.context" autocomplete="off" required>
                </textarea>

                <button type="submit" id="submit" class="btn btn-primary">送出</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import FAQList from '@/components/customerservice/FAQList.vue';

// data
const customerServive = reactive({
    email: '',
    memberId: null,
    vendorId: null,
    subject: '',
    context: '',
});

// 存放所有廠商
const vendorList = ref([]);

// 掛載時載入廠商清單
onMounted(() => {
    fetchAllVendors();
});

// 確認登入資訊
onMounted(async () => {
    const res = await axios.get('http://localhost:8082/api/member/profile', { withCredentials: true });
    if (res.data != null) {
        customerServive.memberId = res.data.memberId;
        customerServive.email = res.data.account;
    }
});

// 獲取所有廠商列表
async function fetchAllVendors() {
    try {
        const response = await axios.get("http://localhost:8082/vendor/searchforcsservice?keyword=");
        vendorList.value = response.data;
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '錯誤',
            text: '無法載入廠商列表，請稍後重試'
        });
        console.error(error);
    }
}


// Submit
async function ServiceFormSubmit() {
    const body = { ...customerServive }; // 建立一個副本送出
    if (body.memberId === "") {
        body.memberId = null;
    }

    await axios.post("http://localhost:8082/customerservice", body)
        .then(function (response) {
            console.log(response.data);
            Swal.fire({
                icon: "success",
                title: "成功",
                text: "您的案件已經送出，我們會盡快回覆至您的信箱",
            });
            // 清空表單
            for (const key in customerServive) {
                customerServive[key] = null;
            }
        })
        .catch(function (error) {
            console.error("Submission Error:", error);
            Swal.fire({
                icon: "error",
                title: "提交失敗",
                text: "無法連接到伺服器，請稍後再試。",
            });
        });
}

</script>

<style scoped>
h2 {
    margin: 20px;
}

/* 主容器：左右排列 */
.content {
    display: flex;
    flex-direction: row;
    /* 改為橫向 */
    justify-content: center;
    align-items: flex-start;
    gap: 20px;
    /* 左右間距 */
    padding: 60px;
    font-family: Arial, sans-serif;
    min-height: 100vh;
    justify-content: space-around;
}

/* FAQ 區塊 */
.content>h2 {
    display: none;
    /* 移除頂部標題 */
}

.content> :first-child {
    flex: 1;
}

/* FAQList 外層區塊（右側） */
.content>.faq-list {
    flex: 1;
}

/* 表單容器：左側 */
.form-container {
    background-color: #ffffff;
    border: 2px solid #e2d3c9;
    border-radius: 12px;
    gap: 60px;
    padding: 30px;
    width: 50%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-right: 40px;
}

/* 表單內部樣式保持 */
label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #5a3822;
}

input,
textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #c2a58a;
    border-radius: 6px;
    margin-bottom: 15px;
    background-color: #fdfcf9;
    font-size: large;
}

textarea {
    resize: vertical;
    height: 150px;
}

#submit {
    width: 100%;
    height: 50px;
}

.faq-list {
    margin-left: 40px;
    /* 調整距離，可自行微調為 -20~-40px */
}
</style>
