<template>
    <footer class="footer-bar">
        <p class="contact">
            📧 <span>foodmap@example.com</span> ｜ ☎ <span>02-1234-5678</span>
        </p>
        <p class="copyright">
            © 2025 美食地圖網站 — All Rights Reserved
        </p>
    </footer>
</template>

---

<script setup>

</script>

---

<style scoped>
.footer-bar {
    background: #fff8f0;
    padding: 30px 20px;
    text-align: center;
    font-family: "Microsoft JhengHei", "Noto Sans TC", sans-serif;
    color: #5a3e2b;
    margin-top: 50px;
    border-top: 1px solid #ddd;
    box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.08);
}

.footer-bar p {
    margin: 8px 0;
}

.footer-bar .contact {
    font-size: 15px;
    font-weight: 600;
}

.footer-bar .contact span {
    margin: 0 10px;
}

.footer-bar .copyright {
    font-size: 13px;
    color: #777;
}
</style>
