<template>
    <section class="ranking">
        <div class="inner">
            <h2>熱門排名</h2>

            <div class="map-container">
                <!-- Google Map -->
                <div id="map"></div>

                <!-- Top3 店家卡片 -->
                <div class="top-vendors">
                    <!-- Top 1 -->
                    <div class="vendor-top1" v-if="topVendors.length > 0" @click="goToVendor(topVendors[0].vendorId)">
                        <div class="rank-badge top1">Top 1</div>
                        <img :src="IMAGE_BASE_URL + topVendors[0].logoUrl" alt="Top 1 圖片" />
                        <h3>{{ topVendors[0].vendorName }}</h3>
                        <p>{{ topVendors[0].address }}</p>
                        <p>{{ topVendors[0].contactTel }}</p>
                    </div>

                    <!-- Top 2 + Top 3 -->
                    <div class="vendor-bottom" v-if="topVendors.length > 1">
                        <div class="vendor-card" v-for="(v, i) in topVendors.slice(1, 3)" :key="v.vendorId"
                            @click="goToVendor(v.vendorId)">
                            <div :class="['rank-badge', i === 0 ? 'top2' : 'top3']">
                                Top {{ i + 2 }}
                            </div>
                            <img :src="IMAGE_BASE_URL + `${v.logoUrl}`" :alt="`Top ${i + 2} 圖片`" />
                            <h3>{{ v.vendorName }}</h3>
                            <p>{{ v.address }}</p>
                            <p>{{ v.contactTel }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

---

<script setup>
import { ref, onMounted } from "vue";
import axiosapi from "@/plugins/axios";
import { useRouter } from "vue-router";
const router = useRouter();
const IMAGE_BASE_URL = "http://localhost:8082/Vendor_Pic/";
const topVendors = ref([]);

const goToVendor = (id) => {
    router.push({ name: "VendorPage", params: { vendorId: id } });
};
// 取得 Top 3 店家
async function fetchTopVendors() {
    try {
        const res = await axiosapi.get("/vendors/popular/top3");
        topVendors.value = res.data;
        console.log("Top 3 店家：", topVendors.value);
    } catch (err) {
        console.error("載入 Top 3 失敗：", err);
    }
}

// Google Map 初始化
let map;
let bounds;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 25.033964, lng: 121.564468 }, // 預設中心（台北101）
        zoom: 12,
        styles: [
            {
                elementType: "geometry",
                stylers: [{ color: "#f5efe6" }]
            },
            {
                elementType: "labels.text.fill",
                stylers: [{ color: "#5b4636" }]
            },
            {
                elementType: "labels.text.stroke",
                stylers: [{ color: "#f5efe6" }]
            },
            {
                featureType: "administrative",
                elementType: "geometry.stroke",
                stylers: [{ color: "#d8c3a5" }]
            },
            {
                featureType: "poi",
                elementType: "geometry",
                stylers: [{ color: "#f1e3d3" }]
            },
            {
                featureType: "poi.park",
                elementType: "geometry.fill",
                stylers: [{ color: "#d7e8c2" }]
            },
            {
                featureType: "poi.business",
                stylers: [{ visibility: "off" }]
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#fff8f0" }]
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#e3cba6" }]
            },
            {
                featureType: "road.highway.controlled_access",
                elementType: "geometry",
                stylers: [{ color: "#e0b988" }]
            },
            {
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [{ color: "#f2e2cf" }]
            },
            {
                featureType: "road.local",
                elementType: "geometry.fill",
                stylers: [{ color: "#faf3eb" }]
            },
            {
                featureType: "water",
                elementType: "geometry.fill",
                stylers: [{ color: "#c7d4df" }]
            },
            {
                featureType: "transit",
                stylers: [{ visibility: "off" }]
            }
        ]
    });
    bounds = new google.maps.LatLngBounds();

    topVendors.value.forEach((vendor) => {
        if (vendor.address) geocodeAddress(vendor);
    });
}

function geocodeAddress(vendor) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: vendor.address }, (results, status) => {
        if (status === "OK") {
            const position = results[0].geometry.location;
            const marker = new google.maps.Marker({
                map,
                position,
                title: vendor.vendorName,
                icon: {
                    url: "/images/map_icon.png",
                    scaledSize: new google.maps.Size(42, 42),     //調整大小
                    anchor: new google.maps.Point(21, 42),        //圖底中心對準定位點
                },
            });

            bounds.extend(position);

            const info = new google.maps.InfoWindow({
                content: `<b>${vendor.vendorName}</b><br>${vendor.address}`,
            });

            marker.addListener("click", () => info.open(map, marker));
            map.fitBounds(bounds);
        } else {
            console.error("Geocode failed:", status);
        }
    });
}

onMounted(async () => {
    await fetchTopVendors();
    setTimeout(initMap, 500); // 等資料與 DOM 就緒
});
</script>



<style scoped>
@font-face {
    font-family: "YozaiLight";
    src: url("@/assets/fonts/Yozai-Light.ttf") format("truetype");
    font-weight: normal;
    font-style: normal;
}

/* 外層區塊 */
.ranking {
    margin-top: 60px;
}

/* 內層容器：統一寬度與左右內距 */
.ranking .inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* 標題樣式 */
.ranking h2 {
    text-align: left;
    margin: 20px 0 0 0;
    font-family: "YozaiLight", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
    font-weight: 700;
    font-size: 3rem;
    color: #5b4636;
    position: relative;
    display: inline-block;
    padding-left: 30px;
}

.ranking h2::after {
    content: "";
    display: block;
    width: 400px;
    height: 4px;
    background: linear-gradient(to right, #d2691e, #e8a96b);
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(210, 105, 30, 0.3);
    margin-top: 8px;
}

/* 地圖 + 排行容器 */
.map-container {
    display: grid;
    grid-template-columns: 55% 45%;
    gap: 20px;
    align-items: flex-start;
    margin: 40px auto;
    max-width: 1200px;
    padding: 0 20px;
}

/* 地圖 */
#map {
    width: 100%;
    height: 500px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 右側 Top 3 */
.top-vendors {
    display: flex;
    flex-direction: column;
    gap: 15px;
    height: 500px;
    padding: 0;
    border: none;
    box-shadow: none;
    background: none;
}

/* Top 1 */
.vendor-top1 {
    flex: 1;
    width: 60%;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    text-align: center;
    padding: 10px;
    position: relative;
    margin: 0 auto;
}

.vendor-top1 img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
}

/* 下方 Top 2 + Top 3 */
.vendor-bottom {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    flex: 1;
}

.vendor-card {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    text-align: center;
    padding: 10px;
    position: relative;
}

.vendor-card img {
    width: 100%;
    height: 130px;
    object-fit: cover;
    border-radius: 8px;
}

/* 文字樣式 */
.vendor-top1 h3,
.vendor-card h3 {
    margin: 5px 0;
    font-size: 15px;
    color: #d2691e;
}

.vendor-top1 p,
.vendor-card p {
    margin: 2px 0;
    font-size: 13px;
    color: #555;
}

/* 排名徽章 */
.rank-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 14px;
    font-weight: bold;
    padding: 4px 10px;
    border-radius: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.rank-badge.top1 {
    background: linear-gradient(135deg, #ffd700, #ffcc33);
    color: #333;
}

.rank-badge.top2 {
    background: linear-gradient(135deg, #c0c0c0, #dcdcdc);
    color: #333;
}

.rank-badge.top3 {
    background: linear-gradient(135deg, #cd7f32, #b87333);
    color: #fff;
}

/* 滑鼠懸停效果 */
.vendor-top1,
.vendor-card {
    cursor: pointer;
    transition: transform 0.2s;
}

.vendor-top1:hover,
.vendor-card:hover {
    transform: translateY(-4px);
}

/* 響應式：小螢幕改上下排列 */
@media (max-width: 992px) {
    .map-container {
        grid-template-columns: 1fr;
    }

    .top-vendors {
        height: auto;
    }

    .ranking h2::after {
        width: 250px;
    }
}
</style>
