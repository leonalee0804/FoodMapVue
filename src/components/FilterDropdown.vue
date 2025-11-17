<template>
    <div class="filter-dropdown" ref="dropdownRef">
        <!-- 主按鈕 -->
        <button class="filter-btn" type="button" @click="toggleDropdown">
            {{ displayLabel }}
            <i class="bi" :class="showDropdown ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>

        <!-- 下拉面板 -->
        <transition name="fade">
            <div v-if="showDropdown" class="dropdown-panel">
                <div class="dropdown-header">
                    <h4>{{ title }}</h4>
                </div>

                <!-- 地區選項 -->
                <div v-if="title === '地區'">
                    <div v-for="(group, region) in groupedCities" :key="region" class="city-group">
                        <h5 class="region-title">{{ region }}</h5>
                        <div class="checkbox-group">
                            <label v-for="opt in group" :key="opt.value" class="option-label">
                                <input v-if="multiple" type="checkbox" v-model="localValue" :value="opt.value"
                                    @change="emit('update:modelValue', localValue)" />
                                <input v-else type="radio" name="dropdown-radio" v-model="localValue" :value="opt.value"
                                    @change="() => { emit('update:modelValue', localValue); showDropdown.value = false; }" />
                                <span class="checkmark"></span>
                                <span>{{ opt.label }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 風格選項 -->
                <div v-else-if="title === '風格'">
                    <div v-for="(group, category) in groupedStyles" :key="category" class="style-group">
                        <h5 class="region-title">{{ category }}</h5>
                        <div class="checkbox-group">
                            <label v-for="opt in group" :key="opt.value" class="option-label">
                                <input v-if="multiple" type="checkbox" v-model="localValue" :value="opt.value"
                                    @change="emit('update:modelValue', localValue)" />
                                <input v-else type="radio" name="dropdown-radio" v-model="localValue" :value="opt.value"
                                    @change="() => { emit('update:modelValue', localValue); showDropdown.value = false; }" />
                                <span class="checkmark"></span>
                                <span>{{ opt.label }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- 一般選項（其他用途） -->
                <div v-else class="checkbox-group">
                    <label v-for="opt in options" :key="opt.value" class="option-label">
                        <input v-if="multiple" type="checkbox" v-model="localValue" :value="opt.value"
                            @change="emit('update:modelValue', localValue)" />
                        <input v-else type="radio" name="dropdown-radio" v-model="localValue" :value="opt.value"
                            @change="() => { emit('update:modelValue', localValue); showDropdown.value = false; }" />
                        <span class="checkmark"></span>
                        <span>{{ opt.label }}</span>
                    </label>
                </div>

                <!-- 按鈕區 -->
                <div class="dropdown-actions">
                    <button type="button" class="btn-clear" @click="clearSelection">清除</button>
                    <button type="button" class="btn-apply" @click="applySelection">套用</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps({
    title: String,
    modelValue: [Array, String],
    options: Array,
    multiple: Boolean,
});
const emit = defineEmits(["update:modelValue", "open"]);

const showDropdown = ref(false);
const dropdownRef = ref(null);

const localValue = ref(
    props.multiple
        ? Array.isArray(props.modelValue)
            ? [...props.modelValue]
            : []
        : props.modelValue || ""
);

// === 地區分群 ===
const groupedCities = {
    北部地區: [
        { value: "台北市", label: "台北市" },
        { value: "新北市", label: "新北市" },
        { value: "基隆市", label: "基隆市" },
        { value: "桃園市", label: "桃園市" },
        { value: "新竹市", label: "新竹市" },
        { value: "新竹縣", label: "新竹縣" },
        { value: "宜蘭縣", label: "宜蘭縣" },
    ],
    中部地區: [
        { value: "苗栗縣", label: "苗栗縣" },
        { value: "台中市", label: "台中市" },
        { value: "彰化縣", label: "彰化縣" },
        { value: "南投縣", label: "南投縣" },
        { value: "雲林縣", label: "雲林縣" },
    ],
    南部地區: [
        { value: "嘉義市", label: "嘉義市" },
        { value: "嘉義縣", label: "嘉義縣" },
        { value: "台南市", label: "台南市" },
        { value: "高雄市", label: "高雄市" },
        { value: "屏東縣", label: "屏東縣" },
    ],
    東部地區: [
        { value: "花蓮縣", label: "花蓮縣" },
        { value: "台東縣", label: "台東縣" },
    ],
    離島地區: [
        { value: "澎湖縣", label: "澎湖縣" },
        { value: "金門縣", label: "金門縣" },
        { value: "連江縣", label: "連江縣" },
    ],
};

// === 風格分群 ===
const groupedStyles = {
    "🍱 亞洲料理": [
        { value: 5, label: "台式料理" },
        { value: 6, label: "中式料理" },
        { value: 7, label: "日式料理" },
        { value: 8, label: "韓式料理" },
        { value: 12, label: "港式料理" },
        { value: 9, label: "泰式料理" },
        { value: 11, label: "越式料理" },
        { value: 10, label: "印度料理" },
        { value: 13, label: "清真料理" },
    ],
    "🍔 西式料理": [
        { value: 1, label: "美式料理" },
        { value: 2, label: "義式料理" },
        { value: 3, label: "墨西哥料理" },
        { value: 4, label: "地中海料理" },
    ],
    "🍲 鍋物 / 烤物類": [
        { value: 14, label: "火鍋" },
        { value: 15, label: "燒烤" },
        { value: 16, label: "排餐" },
        { value: 17, label: "拉麵" },
        { value: 18, label: "麵食" },
        { value: 19, label: "漢堡 / 三明治" },
        { value: 20, label: "披薩" },
    ],
    "🐟 海鮮與地方特色": [
        { value: 21, label: "海鮮料理" },
        { value: 30, label: "特色地方菜" },
        { value: 31, label: "原住民風味料理" },
        { value: 32, label: "家常菜" },
    ],
    "🍰 甜品與飲品": [
        { value: 22, label: "手搖飲" },
        { value: 23, label: "冰品 / 甜湯" },
        { value: 24, label: "甜點" },
        { value: 25, label: "咖啡" },
        { value: 26, label: "烘焙 / 麵包" },
        { value: 27, label: "下午茶" },
    ],
    "🧆 小吃與夜市": [
        { value: 28, label: "小吃 / 攤販" },
        { value: 29, label: "夜市料理" },
    ],
    "🥗 特殊 / 健康取向": [
        { value: 33, label: "Buffet / 吃到飽" },
        { value: 34, label: "健康餐 / 沙拉" },
        { value: 35, label: "素食 / 蔬食" },
        { value: 36, label: "異國混合料理" },
    ],
};

// === 顯示標籤 ===
const displayLabel = computed(() => {
    if (props.multiple) {
        return localValue.value.length
            ? `${props.title} (${localValue.value.length})`
            : `選擇${props.title}`;
    }
    const allOptions =
        props.title === "地區"
            ? Object.values(groupedCities).flat()
            : props.title === "風格"
                ? Object.values(groupedStyles).flat()
                : props.options;
    const selected = allOptions.find((o) => o.value === localValue.value);
    return selected ? `${props.title}：${selected.label}` : `選擇${props.title}`;
});

function toggleDropdown() {
    showDropdown.value = !showDropdown.value;
    if (showDropdown.value) {
        emit("open", props.title); // 通知父層這個下拉被打開了
    }
}

function applySelection() {
    emit("update:modelValue", localValue.value);
    showDropdown.value = false;
}

function clearSelection() {
    localValue.value = props.multiple ? [] : "";
    emit("update:modelValue", localValue.value);
}

function handleClickOutside(e) {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
        showDropdown.value = false;
    }
}
// === 同步外部 v-model 值變動
watch(
    () => props.modelValue,
    (newVal) => {
        if (props.multiple) {
            localValue.value = Array.isArray(newVal) ? [...newVal] : [];
        } else {
            localValue.value = newVal || "";
        }
    }
);

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
function handleExternalClose(e) {
    if (e.detail !== props.title) {
        showDropdown.value = false;
    }
}
</script>

<style scoped>
.filter-dropdown {
    position: relative;
    display: inline-block;
}

.filter-btn {
    background-color: #fffaf3;
    border: 1px solid #ecd9c3;
    border-radius: 28px;
    padding: 9px 20px;
    cursor: pointer;
    font-weight: 400;
    color: #495057;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.25s ease;
}

.filter-btn:hover {
    background-color: #fff3e0;
    box-shadow: 0 2px 8px rgba(210, 105, 30, 0.25);
    transform: translateY(-1px);
}

.dropdown-panel {
    position: fixed;
    top: auto;
    left: auto;
    background: #fffdf9;
    border: 1px solid #ecd9c3;
    border-radius: 16px;
    padding: 16px 18px 12px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    width: 340px;
    max-height: 280px;
    overflow-y: auto;
    transform: translateY(10px);
}

.dropdown-header {
    border-bottom: 1px solid #f1e4d2;
    margin-bottom: 10px;
}

.dropdown-header h4 {
    font-size: 1rem;
    color: #b55318;
    margin: 0 0 6px 0;
    font-weight: 700;
}

.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
    padding: 4px 0;
}

.option-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.95rem;
    color: #4a3b2f;
    cursor: pointer;
    position: relative;
    padding: 3px 6px;
    border-radius: 8px;
    transition: background 0.2s, color 0.2s;
}

.option-label:hover {
    background: #fff4ea;
}

.option-label input[type="checkbox"],
.option-label input[type="radio"] {
    accent-color: #d2691e;
    cursor: pointer;
    transform: scale(1.05);
}

.dropdown-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #f1e4d2;
}

.btn-apply,
.btn-clear {
    border: none;
    border-radius: 20px;
    padding: 7px 16px;
    font-size: 0.9rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
}

.btn-apply {
    background-color: #d2691e;
    color: white;
}

.btn-apply:hover {
    background-color: #b55318;
    box-shadow: 0 2px 8px rgba(181, 83, 24, 0.3);
}

.btn-clear {
    background-color: #f2e7db;
    color: #5a4630;
}

.btn-clear:hover {
    background-color: #ead7c0;
}

.city-group,
.style-group {
    margin-bottom: 10px;
}

.region-title {
    font-weight: 700;
    font-size: 0.95rem;
    color: #b55318;
    margin-bottom: 6px;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
