// composables/googleLogin.js
import axios from "axios";
import Swal from "sweetalert2";

export function useGoogleLogin(router, roleIdRef) {
  // 等待 Google SDK 載入完成
  function waitForGoogleSDK() {
    return new Promise((resolve) => {
      console.log("等待 Google SDK 載入...");
      if (window.google && window.google.accounts) {
        console.log("Google SDK 已存在，直接 resolve");
        resolve();
      } else {
        const interval = setInterval(() => {

          if (window.google && window.google.accounts) {
            clearInterval(interval);

            resolve();
          }
        }, 100);
      }
    });
  }

  // 初始化 Google 登入按鈕
  async function initGoogleLogin(elementId, mode = "signin") {
    try {
      await waitForGoogleSDK();

      if (!window.google || !window.google.accounts) {
        console.error("Google SDK 尚未載入！");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: "155562336859-rq8homtfrs5qf9bpr1dljodf9m8o1ka4.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });


      if (elementId) {
        const el = document.getElementById(elementId);
        if (!el) {
          console.warn("找不到元素，無法渲染 Google 按鈕:", elementId);
        } else {
          window.google.accounts.id.renderButton(el, {
            theme: "outline",
            size: "large",
            shape: "circle",
            text: mode === "signup" ? "signup_with" : "signin_with",
            width: 234,
          });
          console.log("Google 按鈕渲染完成於元素:", elementId);
        }
      }

      // 自動提示 One Tap 登入
      window.google.accounts.id.prompt();
    } catch (err) {
      console.error("initGoogleLogin 發生錯誤:", err);
    }
  }

  // 處理 Google 回傳 token
  async function handleCredentialResponse(response) {
    const token = response?.credential;
    if (!token) {
      console.error("沒有取得 token");
      Swal.fire({ icon: "error", title: "取得 Google ID Token 失敗" });
      return;
    }
    console.log("Google ID Token:", token);

    // 取得前端選擇的角色
    const roleId = roleIdRef?.value;
    console.log("前端選擇的角色 roleId:", roleId);
    if (!roleId) {
      Swal.fire({ icon: "warning", title: "請先選擇您的身份" });
      return;
    }

    // 送到後端進行 Google 登入或註冊
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/google-login`,
        { token, roleId },
        { withCredentials: true }
      );

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "登入成功",
          text: "歡迎 " + (res.data.userName || ""),
          confirmButtonText: "確定"
        }).then(() => {
          if (router) router.push("/");
        });
      } else {
        Swal.fire({ icon: "error", title: res.data.message });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Google 登入失敗" });
    }
  }

  return { initGoogleLogin };
}
