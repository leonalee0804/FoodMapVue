<template>
  <div class="chatbot-container" :class="{ 'show-chatbot': showChatbot }">
    <!-- Chatbot Toggler -->
    <button
      id="chatbot-toggler"
      :class="{ rotate: showChatbot }"
      @click="toggleChatbot"
    >
      <span class="material-symbols-rounded">
        {{ showChatbot ? 'close' : 'support_agent' }}
      </span>
      <span class="tooltip">Gururu智能客服</span>
    </button>

    <div class="chatbot-popup">
      <!-- Header -->
      <div class="chat-header">
        <div class="header-info">
          <svg class="chatbot-logo" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"/>
          </svg>
          <h2 class="logo-text mt-2 mb-0">~ Gururu智能客服 ~</h2>
        </div>
        <button id="close-chatbot" class="material-symbols-rounded" @click="closeChatbot">keyboard_arrow_down</button>
      </div>

      <!-- Chat Body -->
      <div class="chat-body" ref="chatBody">
        <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
          <div v-if="msg.avatar" class="bot-avatar" v-html="msg.avatar"></div>
          <div class="message-text">
            <div v-if="msg.thinking" class="thinking-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
            <div v-else v-html="msg.text"></div>
          </div>
          <img v-if="msg.image" :src="msg.image" class="attachment"/>
        </div>
      </div>

      <!-- Footer -->
      <div class="chat-footer">
        <form class="chat-form" @submit.prevent="handleOutgoingMessage">
          <textarea
            ref="messageInput"
            class="message-input"
            v-model="userMessage"
            @input="resizeInput"
            @keydown.enter="handleEnter"
            placeholder="輸入訊息..."
          ></textarea>

          <div class="chat-controls">
            <button  @click="startListening" class="material-symbols-rounded">mic</button>
            <!-- <button type="button" id="emoji-picker" class="material-symbols-outlined" @click.prevent="togglePicker">sentiment_satisfied</button>
            <button type="button" id="file-cancel" v-if="userFile.data" @click="cancelFile">close</button> -->

            <div class="chat-actions">
              
              <input type="file" ref="fileInput" style="display:none" @change="handleFileChange" />
              
              <button type="submit" id="send-message" class="material-symbols-rounded">arrow_upward</button>
            </div>
          </div>
        </form>

        <!-- Emoji Picker -->
        <!-- <transition name="fade">
          <div v-if="showPicker" class="emoji-picker-wrapper" @click.stop>
            <EmojiPicker @emoji-click="onSelectEmoji" />
          </div>
        </transition> -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, onMounted, watch, computed } from "vue";
import { useUserStore } from "@/stores/user.js";
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";
import QAList from "@/assets/AI_faqs.json";
import stringSimilarity from "string-similarity";
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  
  name: "ChatBot",
  components: { EmojiPicker },
  setup() {
     const userStore = useUserStore();
     const router = useRouter();

    // ===== 語音辨識部分 =====
    const isListening = ref(false);
    const userMessage = ref("");
    let recognition = null;

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = "zh-TW";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        userMessage.value = speechResult;
        handleOutgoingMessage(); // 語音辨識完成後直接送出訊息
      };

      recognition.onend = () => {
        isListening.value = false;
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        isListening.value = false;
      };
    }

    const startListening = () => {
      if (!recognition) return alert("您的瀏覽器不支援語音辨識");
      if (!isListening.value) {
        isListening.value = true;
        recognition.start();
      } else {
        recognition.stop();
        isListening.value = false;
      }
    };
    // ===== 語音辨識結束 =====

    // --- Chatbot UI ---
    const showChatbot = ref(false);
    const chatBody = ref(null);
    const messageInput = ref(null);
    const userFile = ref({ data: null, mime_type: null, preview: null });
    const messages = ref([
      {
        text: "(此功能目前已停用)親愛的貴賓您好👋  <br /> 我是Gururu智能客服~ <br /> 請問今天有什麼需要幫忙的呢?",
        role: "bot-message",
        avatar: `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
              <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"/>
            </svg>`,
        thinking: false
      }
    ]);
    const chatHistory = ref([{ role: "system", content: "你是一個友善的美食地圖客服助理,請以繁體中文或英文回答所有問題,語氣自然親切。" }]);

    // --- 使用者登入資訊 (改用 computed 即時取得 userStore 的狀態) ---
    const isUserLoggedIn = computed(() => userStore.isLoggedIn);
    const currentUserName = computed(() => userStore.userName);

    // 一開始載入時抓取 session
    onMounted(async () => {
      await userStore.fetchUser();
    });

    // 監聽登入狀態變化,自動發送歡迎訊息
    watch(
      () => userStore.isLoggedIn,
      (loggedIn) => {
        if (loggedIn) {
          const avatarSVG = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
              <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"/>
            </svg>`;
          createMessageElement(
            `歡迎回來,${userStore.userName}!我已經知道你登入了,可以提供個人化服務囉~`,
            "bot-message",
            avatarSVG
          );
        }
      }
    );

    // --- JSON QA 模糊查詢 ---
    const getQAAnswer = (text) => {
      if (!QAList || QAList.length === 0) return null;
      const questions = QAList.map((q) => q.Q);
      const { bestMatchIndex, bestMatch } = stringSimilarity.findBestMatch(text, questions);
      if (bestMatch.rating < 0.4) return null;

      const qa = QAList[bestMatchIndex];
      let targetUrl = qa.target || "";

      if (qa.action === "redirect") {
        setTimeout(async () => {
          if (qa.target === "/logout") {
            await userStore.logout(); 
          } else if (qa.target.startsWith("http")) {
            window.open(qa.target, "_blank");
          } else {
            router.push(qa.target);
          }
        }, 800);
      }

      // 產生回覆文字 + 連結(如果有)
      return `${qa.A || ""}${targetUrl ? `<br><a href="${targetUrl}" class="qa-link" target="_blank">👉🏻 點我前往</a>` : ""}`;
    };

    // --- Emoji ---
    const showPicker = ref(false);
    const togglePicker = () => (showPicker.value = !showPicker.value);
    const onSelectEmoji = (emojiEvent) => {
      userMessage.value += emojiEvent.emoji || emojiEvent.native || "";
      nextTick(() => resizeInput());
    };

    // --- UI 操作 ---
    const toggleChatbot = () => (showChatbot.value = !showChatbot.value);
    const closeChatbot = () => (showChatbot.value = false);
    const resizeInput = () => {
      const textarea = messageInput.value;
      if (!textarea) return;
      textarea.style.height = "50px";
      textarea.style.height = textarea.scrollHeight + "px";
    };

    const handleEnter = (e) => {
      if (!e.shiftKey) {
        e.preventDefault();
        handleOutgoingMessage();
      }
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        userFile.value.data = evt.target.result.split(",")[1];
        userFile.value.mime_type = file.type;
        userFile.value.preview = evt.target.result;
      };
      reader.readAsDataURL(file);
    };
    const cancelFile = () => (userFile.value = { data: null, mime_type: null, preview: null });

    const scrollToBottom = () => {
      nextTick(() => {
        if (chatBody.value) chatBody.value.scrollTo({ top: chatBody.value.scrollHeight, behavior: "smooth" });
      });
    };

    const createMessageElement = (text, role, avatar = null, image = null, thinking = false) => {
      messages.value.push({ text, role, avatar, image, thinking });
      scrollToBottom();
    };

    // --- OpenAI ---
    const OPENAI_API_KEY = "";
    const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    const generateBotResponse = async (msgIndex) => {
      try {
        const res = await fetch(OPENAI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: chatHistory.value,
          }),
        });
        const data = await res.json();
        const reply = data.choices[0].message.content.trim();
        messages.value[msgIndex].text = reply;
        messages.value[msgIndex].thinking = false;
        chatHistory.value.push({ role: "assistant", content: reply });
        scrollToBottom();
      } catch (err) {
        messages.value[msgIndex].text = `發生錯誤:${err.message}`;
        messages.value[msgIndex].thinking = false;
        scrollToBottom();
      }
    };

    // --- 處理使用者訊息 ---
    const handleOutgoingMessage = async () => {
      if (!userMessage.value.trim() && !userFile.value.data) return;
      const userText = userMessage.value.trim();
      createMessageElement(userText, "user-message", null, userFile.value.preview);
      chatHistory.value.push({ role: "user", content: userText });
      userMessage.value = "";
      userFile.value = { data: null, mime_type: null, preview: null };

      // 先 JSON QA
      const qaAnswer = getQAAnswer(userText);
      if (qaAnswer) {
        const avatarSVG = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
              <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"/>
            </svg>`;
        createMessageElement(qaAnswer, "bot-message", avatarSVG);
        chatHistory.value.push({ role: "assistant", content: qaAnswer });
        return;
      }

      // 檢查登入狀態 (使用 computed 即時狀態)
      if (!isUserLoggedIn.value) {
        const avatarSVG = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
              <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"/>
            </svg>`;
        const msg = "請先註冊並登入才能享有更智能的服務喔!";
        createMessageElement(msg, "bot-message", avatarSVG);
        chatHistory.value.push({ role: "assistant", content: msg });
        return;
      }

      // 呼叫 OpenAI
      const avatarSVG = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"/>
                          </svg>`;
      createMessageElement("", "bot-message", avatarSVG, null, true);
      const botMsgIndex = messages.value.length - 1;
      await nextTick();
      chatBody.value?.scrollTo({ top: chatBody.value.scrollHeight, behavior: "smooth" });
      setTimeout(async () => await generateBotResponse(botMsgIndex), 600);
    };

    return {
      showChatbot,
      userMessage,
      userFile,
      messages,
      chatBody,
      messageInput,
      toggleChatbot,
      closeChatbot,
      resizeInput,
      handleEnter,
      handleFileChange,
      cancelFile,
      handleOutgoingMessage,
      showPicker,
      togglePicker,
      onSelectEmoji,
      isListening,
      startListening,
    };
  },
};

</script>


<style scoped>
@import "@/assets/css/ChatBot/style.css";
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,400,1,0');

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}


</style>