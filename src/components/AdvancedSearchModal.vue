<template>
    <div v-if="show" class="modal" @click.self="close">
        <div class="modal-content">
            <span class="close" @click="close">&times;</span>
            <h3>進階搜尋條件</h3>

            <label>價位區間：</label>
            <select v-model="local.priceRange">
                <option value="">不限</option>
                <option value="0-199">200 以下</option>
                <option value="200-399">200–399</option>
                <option value="400-699">400–699</option>
                <option value="700-999999">700 以上</option>
            </select>
            <br /><br />

            <label>營業時段：</label>
            <select v-model="local.timeSlot">
                <option value="">不限</option>
                <option value="breakfast">早餐 (05:00–9:59)</option>
                <option value="lunch">午餐 (10:00–13:59)</option>
                <option value="afternoon">下午餐 (14:00–16:59)</option>
                <option value="dinner">晚餐 (17:00–23:59)</option>
            </select>
            <br /><br />

            <label><input type="checkbox" v-model="local.airConditioner" /> 有冷氣</label>
            <label><input type="checkbox" v-model="local.veganFriendly" /> 蔬食友善</label>
            <label><input type="checkbox" v-model="local.petFriendly" /> 寵物友善</label>
            <br /><br />

            <button @click="apply">套用條件</button>
        </div>
    </div>
</template>

<script setup>
import { reactive, watch, defineEmits, defineProps } from "vue";

const props = defineProps({
    show: Boolean, // 是否顯示
    modelValue: Object, // 父元件傳入的搜尋條件
});

const emit = defineEmits(["close", "update:modelValue", "apply"]);


const local = reactive({
    priceRange: "",
    timeSlot: "",
    airConditioner: false,
    veganFriendly: false,
    petFriendly: false,
});

watch(
    () => props.modelValue,
    (val) => {
        Object.assign(local, val || {});
    },
    { immediate: true }
);

function close() {
    emit("close");
}

function apply() {
    emit("update:modelValue", { ...local });
    emit("apply", { ...local });
    console.log("Modal emit apply (saved only):", local);
    close();
}
</script>

<style scoped>
.modal {
    display: flex;
    position: fixed;
    z-index: 2000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.45);
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}


.modal-content {
    background: linear-gradient(180deg, #fffdf8 0%, #fff3e0 100%);
    padding: 30px 40px;
    border-radius: 15px;
    width: 420px;
    max-width: 90%;
    text-align: left;
    font-family: "Microsoft JhengHei", sans-serif;
    color: #333;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    border-top: 5px solid #d2691e;
    animation: popup 0.3s ease-out;
    position: relative;
}


.close {
    position: absolute;
    top: 12px;
    right: 18px;
    font-size: 22px;
    font-weight: bold;
    color: #555;
    cursor: pointer;
    transition: color 0.2s, transform 0.2s;
}

.close:hover {
    color: #d2691e;
    transform: scale(1.2);
}

.modal-content h3 {
    margin-top: 0;
    color: #5a3e2b;
    border-bottom: 2px solid #d2691e;
    padding-bottom: 8px;
    font-size: 20px;
    letter-spacing: 1px;
}

.modal-content label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #444;
}

.modal-content select {
    width: 100%;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
    margin-top: 4px;
    font-size: 15px;
}

.modal-content input[type="checkbox"] {
    margin-right: 6px;
}

.modal-content button {
    display: block;
    margin-top: 20px;
    padding: 10px 18px;
    background: #d2691e;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
}

.modal-content button:hover {
    background: #b55318;
}


@keyframes popup {
    from {
        transform: translateY(-80px);
        /* 從上方開始滑下來 */
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
