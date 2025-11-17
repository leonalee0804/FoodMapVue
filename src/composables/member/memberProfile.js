import { reactive, ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import cities from '@/assets/TwCities.json';

export function memberProfile() {

  // -------------------- Member Data --------------------
  const member = reactive({
    memberId: null,
    user: { accountId: null },
    avatarURL: null,
    userName: '',
    gender: '男',
    birthdate: '',
    phone: '',
    city: '',
    district: ''
  });

  const selectedCity = ref(null);    // v-select 城市
  const selectedDistrict = ref(null); // v-select 區域
  const districts = ref([]);          // 區域選單
  const loading = ref(false);         

  // -------------------- Watch 城市/區域 --------------------
  watch(selectedCity, (city) => {
    if (city) {
      districts.value = city.districts || [];
      member.city = city.city || '';
    } else {
      districts.value = [];
      member.city = '';
    }

  });

  watch(selectedDistrict, (district) => {
    member.district = district?.name || '';
  });

  // -------------------- Load Member Data --------------------
  const loadMemberData = async () => {
    loading.value = true;
    try {
      const res = await axios.get('/api/member/profile', { withCredentials: true });
      Object.assign(member, res.data);

      // 設定選中的城市
      if (member.city) {
        const cityObj = cities.find(c => c.city === member.city);
        selectedCity.value = cityObj || null;
        districts.value = cityObj?.districts || [];

        // 設定選中的區域
        if (member.district) {
          const districtObj = districts.value.find(d => d.name === member.district);
          selectedDistrict.value = districtObj || null;
        }
      }
    } catch (err) {
      console.error("載入會員資料時發生錯誤:", err);
    } finally {
      loading.value = false;
    }
  };

  onMounted(loadMemberData);

  // -------------------- Avatar --------------------
  const avatarFile = ref(null);
  const avatarPreview = computed(() => {
    if (avatarFile.value) return URL.createObjectURL(avatarFile.value);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    return member?.avatarURL
      ? `${baseUrl}/uploads/avatars/${member.avatarURL}`
      : '/images/gururu_food.png';
  });

  const onAvatarChange = (e) => {
    avatarFile.value = e.target.files[0];
  };

  // -------------------- Profile Submit --------------------
  const showProfileSuccess = (message = '會員資料更新成功') => {
    Swal.fire({ icon: 'success', title: '成功', text: message, confirmButtonText: "OK" });
  };

  const showProfileError = (message = '會員資料更新失敗') => {
    Swal.fire({ icon: 'error', title: '錯誤', text: message, showConfirmButton: false });
  };

  const submitProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('accountId', member.user.accountId);
      formData.append('userName', member.userName || '');
      formData.append('gender', member.gender || '');
      formData.append('birthdate', member.birthdate || '');
      formData.append('phone', member.phone || '');
      formData.append('city', selectedCity.value?.city || '');
      formData.append('district', member.district || '');
      if (avatarFile.value) formData.append('avatarFile', avatarFile.value);

      await axios.post('/api/member/setting', formData, { withCredentials: true });
      showProfileSuccess();
      await loadMemberData();
      avatarFile.value = null;
    } catch (err) {
      console.error(err);
      showProfileError();
    }
  };

  const resetProfile = () => {
    loadMemberData();
    avatarFile.value = null;
  };

  // -------------------- Password --------------------
  const passwordForm = reactive({ password:'', newPassword:'', confirmPassword:'' });

  const resetPasswordForm = () => {
    passwordForm.password = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  };

  const updatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire('錯誤','新密碼與確認密碼不一致','error');
      return;
    }

    const result = await Swal.fire({
      title: '確認更新密碼？', icon:'question', showCancelButton:true,
      confirmButtonText:'確定', cancelButtonText:'取消'
    });

    if (result.isConfirmed) {
      try {
        await axios.post('/api/member/changePwd', passwordForm, { withCredentials: true });
        Swal.fire('更新成功','密碼已更新','success');
        resetPasswordForm();
      } catch(err) {
        console.error(err);
        Swal.fire('更新失敗','請稍後再試','error');
      }
    }
  };

  // -------------------- Notification --------------------
  const notification = reactive({ accountActivity:true, paymentUpdated:true });

  const resetNotification = () => {
    notification.accountActivity = true;
    notification.paymentUpdated = true;
  };

  const saveNotification = async () => {
    const result = await Swal.fire({
      title: '確認更新通知設定？', icon: 'question', showCancelButton: true,
      confirmButtonText: '確定', cancelButtonText: '取消'
    });

    if (result.isConfirmed) {
      try {
        await axios.post('/member/user/saveNotification', notification, { withCredentials: true });
        Swal.fire({ title:'更新成功', text:'通知設定已更新', icon:'success', confirmButtonText:"OK" });
      } catch(err) {
        console.error(err);
        Swal.fire({ title:"更新失敗", icon:"error", confirmButtonText:"請稍後再試" });
      }
    }
  };

  // -------------------- Return --------------------
  return {
    member,
    selectedCity,
    selectedDistrict,
    districts,
    avatarFile,
    avatarPreview,
    loading,
    loadMemberData,
    onAvatarChange,
    submitProfile,
    resetProfile,
    passwordForm,
    resetPasswordForm,
    updatePassword,
    notification,
    resetNotification,
    saveNotification,
    cities
  };
}
