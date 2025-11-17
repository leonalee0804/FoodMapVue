<template>
    <div class="order-item">
        <!-- 訂單主要資訊 -->
        <div class="order-header">
            <div class="order-info">
                <div class="order-no">
                    <span class="label">訂單編號:</span>
                    <span class="value">{{ order.orderNo }}</span>
                </div>
                <div class="order-date">
                    <span class="label">訂單日期:</span>
                    <span class="value">{{ formatDate(order.paidAt || order.createdAt) }}</span>
                </div>
                <div class="order-amount">
                    <span class="label">訂單金額:</span>
                    <span class="value amount">NT$ {{ formatAmount(order.totalAmount) }}</span>
                </div>
                <div class="order-status">
                    <span :class="['status-badge', getStatusClass(order.paymentStatus)]">
                        {{ getStatusText(order.paymentStatus) }}
                    </span>
                </div>
            </div>

            <div class="order-actions">
                <button @click="toggleDetails" class="btn-detail" :class="{ active: showDetails }">
                    {{ showDetails ? '收起明細' : '查看明細' }}
                </button>
                <button @click="toggleComment" class="btn-comment" :class="{ active: showComment }">
                    {{ showComment ? '收起評論' : '查看評論' }}
                </button>
            </div>
        </div>

        <!-- 展開區域 -->
        <div class="order-expand-container">
            <!-- 訂單明細 -->
            <transition name="expand">
                <div v-if="showDetails" class="order-expand">
                    <div class="expand-divider"></div>

                    <!-- 載入明細中 -->
                    <div v-if="loadingDetails" class="loading-section">
                        <div class="spinner-tiny"></div>
                        <span>載入訂單明細中...</span>
                    </div>

                    <!-- 顯示訂單明細 -->
                    <div v-else-if="orderDetails && orderDetails.length > 0" class="order-details">
                        <h4 class="section-title">📋 訂單明細</h4>

                        <div class="details-table">
                            <div class="detail-item" v-for="detail in orderDetails" :key="detail.orderDetailId">
                                <div class="product-info">
                                    <div class="product-name">
                                        {{ detail.productName || detail.planName || '商品' }}
                                    </div>
                                    <div class="product-meta">
                                        <span class="quantity">數量: {{ detail.quantity }}</span>
                                        <span class="unit-price">單價: NT$ {{ formatAmount(detail.unitPrice) }}</span>
                                    </div>
                                    <div v-if="detail.expireDate" class="expire-date">
                                        到期日: {{ formatDate(detail.expireDate) }}
                                    </div>
                                </div>
                                <div class="subtotal">
                                    <span class="label">小計</span>
                                    <span class="amount">NT$ {{ formatAmount(detail.subtotal) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 訂單總計 -->
                        <div class="order-summary">
                            <div class="summary-row" v-if="order.discountAmount">
                                <span>折扣金額:</span>
                                <span class="discount">-NT$ {{ formatAmount(order.discountAmount) }}</span>
                            </div>
                            <div class="summary-row total">
                                <span>訂單總計:</span>
                                <span class="total-amount">NT$ {{ formatAmount(order.totalAmount) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 沒有明細 -->
                    <div v-else class="no-data">
                        <p>此訂單沒有明細資料</p>
                    </div>
                </div>
            </transition>

            <!-- 評論區域 - 直接使用 Comments 組件 -->
            <transition name="expand">
                <div v-if="showComment" class="order-expand">
                    <div class="expand-divider"></div>

                    <!-- 載入評論中 -->
                    <div v-if="loadingComment" class="loading-section">
                        <div class="spinner-tiny"></div>
                        <span>載入評論狀態中...</span>
                    </div>

                    <!-- 顯示評論組件 -->
                    <div v-else class="comment-section">
                        <h4 class="section-title">💬 訂單評論</h4>
                        <Comments :orderId="order.orderId" />
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Comments from '@/components/orderdetails/Comments.vue';

const props = defineProps({
    order: {
        type: Object,
        required: true
    }
});

const router = useRouter();
const showDetails = ref(false);
const showComment = ref(false);
const loadingDetails = ref(false);
const loadingComment = ref(false);
const orderDetails = ref([]);

const API_BASE = 'http://localhost:8082';

// 格式化金額
const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '0';
    return amount.toLocaleString('zh-TW');
};

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return '-';

    try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return '-';
    }
};

// 取得狀態樣式
const getStatusClass = (status) => {
    const statusMap = {
        'PAID': 'success',
        'PENDING': 'warning',
        'FAILED': 'danger',
        'NEW': 'info'
    };
    return statusMap[status] || 'default';
};

// 取得狀態文字
const getStatusText = (status) => {
    const textMap = {
        'PAID': '已付款',
        'PENDING': '待付款',
        'FAILED': '付款失敗',
        'NEW': '新訂單'
    };
    return textMap[status] || status || '未知';
};

// 切換訂單明細
const toggleDetails = async () => {
    showDetails.value = !showDetails.value;

    if (showDetails.value) {
        showComment.value = false;
    }

    if (showDetails.value && orderDetails.value.length === 0 && !loadingDetails.value) {
        await fetchOrderDetails();
    }
};

// 切換評論
const toggleComment = async () => {
    showComment.value = !showComment.value;

    if (showComment.value) {
        showDetails.value = false;
    }

    if (showComment.value) {
        loadingComment.value = true;
        setTimeout(() => {
            loadingComment.value = false;
        }, 300);
    }
};

// 載入訂單明細
const fetchOrderDetails = async () => {
    if (!props.order.orderId) {
        console.error('找不到訂單 ID');
        return;
    }

    loadingDetails.value = true;

    try {
        console.log('載入訂單明細 - orderId:', props.order.orderId);

        const response = await axios.get(
            `${API_BASE}/api/order/details/${props.order.orderId}`,
            { withCredentials: true }
        );

        console.log('訂單明細回應:', response.data);
        orderDetails.value = response.data || [];

    } catch (error) {
        console.error('載入訂單明細失敗:', error);
        console.error('錯誤詳情:', error.response?.data);
        orderDetails.value = [];
    } finally {
        loadingDetails.value = false;
    }
};
</script>

<style scoped>
.order-item {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.2s ease;
}

.order-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 訂單標頭 */
.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: white;
}

.order-info {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    flex: 1;
}

.order-info>div {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
}

.value {
    font-size: 0.938rem;
    color: #1f2937;
}

.order-no .value {
    font-family: 'Courier New', monospace;
    color: #6b7280;
}

.amount {
    font-weight: 600;
    color: var(--primary-color, #8b4513);
    font-size: 1.1rem !important;
}

/* 狀態標籤 */
.status-badge {
    display: inline-block;
    padding: 5px 12px;
    border-radius: 16px;
    font-size: 0.813rem;
    font-weight: 500;
    white-space: nowrap;
    width: fit-content;
}

.status-badge.success {
    background: #d1fae5;
    color: #065f46;
}

.status-badge.warning {
    background: #fef3c7;
    color: #92400e;
}

.status-badge.danger {
    background: #fee2e2;
    color: #991b1b;
}

.status-badge.info {
    background: #dbeafe;
    color: #1e40af;
}

/* 操作按鈕 */
.order-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.btn-detail,
.btn-comment {
    padding: 8px 16px;
    background: white;
    border: 1.5px solid var(--primary-color, #8b4513);
    color: var(--primary-color, #8b4513);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-detail:hover,
.btn-comment:hover {
    background: var(--primary-color, #8b4513);
    color: white;
}

.btn-detail.active,
.btn-comment.active {
    background: var(--primary-color, #8b4513);
    color: white;
}

/* 展開容器 */
.order-expand-container {
    position: relative;
}

.order-expand {
    padding: 0 20px 20px;
    background: #fafafa;
}

.expand-divider {
    height: 1px;
    background: #e5e7eb;
    margin-bottom: 20px;
}

.section-title {
    font-size: 1.1rem;
    color: #374151;
    margin-bottom: 15px;
    font-weight: 600;
}

/* 載入狀態 */
.loading-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px;
    color: #6b7280;
}

.spinner-tiny {
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--primary-color, #8b4513);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg)
    }

    100% {
        transform: rotate(360deg)
    }
}

/* 訂單明細 */
.order-details {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.details-table {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding: 15px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    transition: all 0.2s;
}

.detail-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.product-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
}

.product-meta {
    display: flex;
    gap: 20px;
    font-size: 0.938rem;
    color: #6b7280;
}

.quantity {
    font-weight: 500;
}

.unit-price {
    color: #6b7280;
}

.expire-date {
    font-size: 0.813rem;
    color: #ef4444;
    font-weight: 500;
}

.subtotal {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 5px;
    min-width: 120px;
}

.subtotal .label {
    font-size: 0.75rem;
    color: #9ca3af;
}

.subtotal .amount {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--primary-color, #8b4513);
}

/* 訂單總計 */
.order-summary {
    background: white;
    padding: 15px;
    border-radius: 8px;
    border: 2px solid var(--primary-color, #8b4513);
}

.summary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 0.938rem;
}

.summary-row.total {
    border-top: 2px solid #e5e7eb;
    margin-top: 8px;
    padding-top: 12px;
    font-size: 1.1rem;
    font-weight: 700;
}

.discount {
    color: #ef4444;
    font-weight: 600;
}

.total-amount {
    color: var(--primary-color, #8b4513);
    font-size: 1.3rem;
}

/* 評論區域 */
.comment-section {
    animation: fadeIn 0.3s ease;
}

/* 無資料狀態 */
.no-data {
    text-align: center;
    padding: 40px;
    color: #6b7280;
}

/* 展開動畫 */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease;
    max-height: 1000px;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
    .order-info {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    }

    .order-header {
        flex-direction: column;
        gap: 15px;
    }

    .order-actions {
        width: 100%;
        justify-content: space-between;
    }

    .detail-item {
        flex-direction: column;
        gap: 10px;
    }

    .subtotal {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
}
</style>