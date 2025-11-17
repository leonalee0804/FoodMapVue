<template>
    <footer class="footer-bar">
        <!-- 波浪裝飾 -->
        <!-- <div class="wave-decoration">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M0,50 C300,100 900,0 1200,50 L1200,120 L0,120 Z" fill="#f5efe6"></path>
            </svg>
        </div> -->

        <div class="footer-content">
            <!-- 主要內容區 -->
            <div class="footer-main">

                <!-- 品牌區塊 -->
                <div class="brand-block">
                    <div class="brand-header">
                        <div class="brand-icon-wrapper">
                            <img src="/images/gururu_food.png" alt="Gururu Logo" class="brand-logo">
                        </div>
                        <div>
                            <h3 class="brand-name">Gururu</h3>
                            <p class="brand-subtitle">美食地圖</p>
                        </div>
                    </div>
                    <p class="brand-mission">探索全台美食地圖，發現屬於你的味蕾冒險。讓吃飯不只是日常，而是一場充滿驚喜的旅程。</p>

                    <!-- 社群連結 -->
                    <div class="social-section">
                        <p class="social-title">關注我們</p>
                        <div class="social-links">
                            <a href="#" class="social-link" aria-label="Facebook">
                                <i class="bi bi-facebook"></i>
                            </a>
                            <a href="#" class="social-link" aria-label="Instagram">
                                <i class="bi bi-instagram"></i>
                            </a>
                            <a href="#" class="social-link" aria-label="Twitter">
                                <i class="bi bi-twitter-x"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- 網站導覽 -->
                <div class="footer-column">
                    <h4 class="column-title">網站導覽</h4>
                    <nav class="nav-links">
                        <router-link to="/" class="nav-link">首頁</router-link>
                        <router-link to="/search" class="nav-link">搜尋餐廳</router-link>
                        <router-link to="/favorites" class="nav-link">我的收藏</router-link>
                        <router-link to="/about" class="nav-link">關於我們</router-link>
                        <router-link to="/contact" class="nav-link">聯絡我們</router-link>
                    </nav>
                </div>

                <!-- 聯絡資訊 -->
                <!-- 聯絡資訊 -->
                <div class="footer-column">
                    <h4 class="column-title">聯絡我們</h4>
                    <div class="contact-list">
                        <div class="contact-item">
                            <div class="contact-icon"><i class="bi bi-geo-alt-fill"></i></div>
                            <div class="contact-text">
                                <p class="contact-label">地址</p>
                                <p>台北市信義區美食路 123 號</p>
                            </div>
                        </div>

                        <div class="contact-item">
                            <div class="contact-icon"><i class="bi bi-telephone-fill"></i></div>
                            <div class="contact-text">
                                <p class="contact-label">電話</p>
                                <p>02-1234-5678</p>
                            </div>
                        </div>

                        <div class="contact-item">
                            <div class="contact-icon"><i class="bi bi-envelope-fill"></i></div>
                            <div class="contact-text">
                                <p class="contact-label">信箱</p>
                                <p>foodmap@example.com</p>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            <!-- 分隔線 -->
            <div class="divider"></div>

            <!-- 版權資訊 -->
            <div class="footer-bottom">
                <p class="copyright">© 2025 Gururu 美食地圖. All Rights Reserved.</p>
                <p class="disclaimer">本網站僅作為學術專題展示使用</p>
            </div>
        </div>
    </footer>
</template>

<script setup>
// 如果你的 logo 在 assets 資料夾中,請取消註解並修改路徑
// import logo from '@/assets/logo.png'
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.footer-bar {
    background: linear-gradient(180deg, #fff8f0 0%, #f5efe6 100%);
    font-family: "Microsoft JhengHei", "PingFang TC", sans-serif;
    position: relative;
    /* padding-top: 100px; */
    margin: 0;
}

/* 主要內容容器 */
.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 20px 15px;
}

.footer-main {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 60px;
    margin-bottom: 20px;
}

/* 品牌區塊 */
.brand-block {
    display: flex;
    flex-direction: column;
    /* gap: 8px; */
}

.brand-header {
    display: flex;
    align-items: center;
    gap: 24px;
}

.brand-icon-wrapper {
    width: 120px;
    height: 120px;
    background: #fff;
    border: 3px solid #f0dcc8;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(210, 105, 30, 0.15);
    padding: 8px;
    overflow: hidden;
}

.brand-icon {
    font-size: 32px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* Logo 圖片樣式 (如果使用圖片) */
.brand-logo {
    width: 120px;
    height: 120px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.brand-name {
    font-size: 36px;
    font-weight: 800;
    color: #d2691e;
    line-height: 1.2;
    letter-spacing: -0.5px;
}

.brand-subtitle {
    font-size: 15px;
    color: #8b6f47;
    letter-spacing: 2px;
    margin-top: 6px;
}

.brand-mission {
    color: #6b4e2a;
    line-height: 1.8;
    font-size: 15px;
}

/* 社群區塊 */
.social-section {
    /* margin-top: 8px; */
}

.social-title {
    font-size: 18px;
    color: #8b6f47;
    margin-bottom: 12px;
    font-weight: 600;
    letter-spacing: 1px;
    text-align: left;
}

.social-links {
    display: flex;
    gap: 12px;
}

.social-link {
    width: 44px;
    height: 44px;
    background: #fff;
    border: 2px solid #f0dcc8;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d2691e;
    font-size: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
}

.social-link:hover {
    background: #d2691e;
    color: #fff;
    border-color: #d2691e;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(210, 105, 30, 0.3);
}

/* 欄位樣式 */
.footer-column {
    display: flex;
    flex-direction: column;
    text-align: left;
    /* 確保不是被 grid 或 flex 居中 */
}

/* 標題樣式 */
.column-title {
    display: inline-block;
    /* 讓底線只跟文字寬度對齊 */
    position: relative;
    font-size: 18px;
    font-weight: 700;
    color: #d2691e;
    margin-bottom: 20px;
    padding-bottom: 8px;
    transform: translateX(3px);
}

/* 標題底線 */
.column-title::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #d2691e, transparent);
    border-radius: 2px;
}

/* 導覽連結 */
.nav-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.nav-link {
    color: #6b4e2a;
    text-decoration: none;
    font-size: 15px;
    transition: all 0.3s ease;
    padding: 6px 0;
    display: inline-block;
    position: relative;
    width: fit-content;
}

.nav-link::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 4px;
    width: 0;
    height: 2px;
    background: #d2691e;
    transition: width 0.3s ease;
}

.nav-link:hover {
    color: #d2691e;
    padding-left: 8px;
}

.nav-link:hover::before {
    width: 100%;
}

/* 聯絡資訊 */
.contact-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.contact-item {
    display: flex;
    gap: 14px;
    align-items: flex-start;
}

.contact-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #fff 0%, #faf6f0 100%);
    border: 2px solid #f0dcc8;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
}

.contact-text {
    flex: 1;
}

.contact-label {
    font-size: 12px;
    color: #8b6f47;
    margin-bottom: 4px;
    font-weight: 600;
}

.contact-text p:not(.contact-label) {
    color: #6b4e2a;
    font-size: 14px;
    line-height: 1.6;
}

/* 分隔線 */
.divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #d2691e 20%, #d2691e 80%, transparent);
    opacity: 0.3;
    margin: 0 0 30px 0;
}

/* 版權區 */
.footer-bottom {
    text-align: center;
    padding: 6px 0;
    line-height: 1.3;
}

.copyright {
    color: #6b4e2a;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 2px;
}

.disclaimer {
    color: #8b6f47;
    font-size: 12px;
    margin: 0;
}


/* 響應式設計 */
@media (max-width: 968px) {
    .footer-main {
        grid-template-columns: 1fr 1fr;
        gap: 40px;
    }

    .brand-block {
        grid-column: 1 / -1;
    }
}

@media (max-width: 640px) {
    .footer-content {
        padding: 40px 20px 20px;
    }

    .footer-main {
        grid-template-columns: 1fr;
        gap: 40px;
        margin-bottom: 40px;
    }

    .brand-header {
        flex-direction: column;
        text-align: center;
    }

    .brand-mission {
        text-align: center;
    }

    .social-section {
        text-align: center;
    }

    .social-links {
        justify-content: center;
    }

    /* 保持靠左對齊 - 刪除或註解以下三段 */
    /* .column-title::after {
        left: 50%;
        transform: translateX(-50%);
    }

    .nav-links {
        align-items: center;
    }

    .contact-list {
        align-items: center;
    } */

    .contact-item {
        flex-direction: column;
        text-align: center;
        align-items: center;
    }
}

.contact-item {
    display: flex;
    gap: 14px;
    align-items: center;
    /* ← 改這裡讓 icon 與文字垂直居中 */
}

.contact-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #fff 0%, #faf6f0 100%);
    border: 2px solid #f0dcc8;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    position: relative;
    top: 2px;
    /* 👈 稍微往下推，讓右邊文字相對上移 */
}
</style>