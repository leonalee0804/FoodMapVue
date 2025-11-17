import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
    state: () => ({
        user: null,
        isBlacklisted: false,
        blacklistReason: null,
    }),

    getters: {
        // 判斷是否已登入
        isLoggedIn: (state) => !!state.user,

        // 取得角色 ID
        roleId: (state) => state.user?.roleId ?? null,

        // 取得使用者名稱 (會員/廠商)
        userName: (state) => {
            if (!state.user) return "";
            if (state.user.roleId === 1) return ""; // 管理員不顯示名稱
            return state.user.vendor?.vendorName || state.user.member?.userName || state.user.userName || "";
        },
    },

    actions: {
        /** 登入 */
        async login(account, password) {
            try {
                const res = await axios.post("/api/login", { account, password }, { withCredentials: true });
                const data = res.data;

                if (data.success) {
                    this.user = {

                        roleId: data.roleId,

                        member: data.memberId

                            ? { memberId: data.memberId, userName: data.memberUserName, status: data.status }
                            : null,

                        vendor: data.vendorId

                            ? { vendorId: data.vendorId, vendorName: data.vendorName || data.vendorUserName }
                            : null,
                    };


                    return { success: true, message: data.message };
                } else {
                    return { success: false, message: data.message };
                }
            } catch (err) {
                console.error("Login error:", err);
                return { success: false, message: "伺服器錯誤" };
            }
        },

        /** 取得目前登入使用者 */
        async fetchUser() {
            try {
                const res = await axios.get("/api/currentUser", { withCredentials: true });
                const u = res.data.user;

                if (u) {
                    // 設置 store.user
                    this.user = {
                        roleId: u.roleId,
                        userName: u.userName, // 如果後端有提供 userName
                        vendor: u.vendorName ? { vendorName: u.vendorName, vendorId: u.userId } : null,
                        member: u.memberUserName ? { userName: u.memberUserName, memberId: u.memberId } : null,
                    };

                    // 判斷黑名單
                    this.isBlacklisted = u.status === 3;
                    this.blacklistReason = this.isBlacklisted ? (u.blacklistReason || "帳號已被黑名單") : null;


                } else {
                    this.user = null;
                    this.isBlacklisted = false;
                    this.blacklistReason = null;
                }
            } catch (err) {
                console.error("Fetch user error:", err);
                this.user = null;
                this.isBlacklisted = false;
                this.blacklistReason = null;
            }
        },




        // 登出
        async logout() {
            try {
                // 呼叫後端 API 登出
                await axios.post("/api/logout", {}, { withCredentials: true });
            } catch (err) {
                console.error("Logout failed:", err);
            } finally {
                // 清除前端狀態
                this.user = null;
                this.isBlacklisted = false;

                // 導向登入頁，替換歷史紀錄
                router.replace("/login");

                // 防止使用者按上一頁返回會員頁
                window.history.pushState(null, "", "/login");
                window.addEventListener("popstate", () => {
                    router.replace("/login");
                });

                // 可選：強制刷新頁面確保狀態更新
                window.location.reload();
            }
        },


        setBlacklisted(status, reason = null) {
            this.isBlacklisted = status;
            this.blacklistReason = reason;
            console.log("Store 黑名單狀態更新:", this.isBlacklisted, "原因:", this.blacklistReason);
        },

    },
});
