import axios from "axios";
import Swal from "sweetalert2";
import vSelect from "vue-select";
import cities from "@/assets/TwCities.json";

export default {
  components: { vSelect },
  props: {
    member: { type: Object, required: true }
  },
  data() {
    return {
      localMember: {
        userName: "",
        gender: "男",
        birthdate: "",
        phone: "",
        city: "",
        district: "",
        avatarFile: null,
        avatarURL: null
      },
      avatarPreview: null,
      defaultAvatar: '/images/default-avatar.png',
      cities: cities,
      selectedCity: null,
      selectedDistrict: null,
      districts: []
    };
  },
  watch: {
    member: {
      immediate: true,
      handler() {
        this.initForm();
      }
    },
    selectedCity(newCity) {
      if (newCity) {
        this.districts = newCity.districts || [];
        this.localMember.city = newCity.city;
      } else {
        this.districts = [];
        this.localMember.city = "";
      }
    },
    selectedDistrict(newDistrict) {
      this.localMember.district = newDistrict ? newDistrict.name : "";
    }
  },
  methods: {
    initForm() {
      if (!this.member) return;

      this.localMember = { ...this.member, avatarFile: null };

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      this.avatarPreview = this.localMember.avatarURL
        ? `${baseUrl}/uploads/avatars/${this.localMember.avatarURL}`
        : this.defaultAvatar;

      if (this.localMember.city) {
        const cityObj = this.cities.find(c => c.city === this.localMember.city);
        this.selectedCity = cityObj || null;
        this.districts = cityObj?.districts || [];
        if (this.localMember.district) {
          const districtObj = this.districts.find(d => d.name === this.localMember.district);
          this.selectedDistrict = districtObj || null;
        }
      }
    },
    previewImage(event) {
      const file = event.target.files[0];
      if (file) {
        this.localMember.avatarFile = file;
        const reader = new FileReader();
        reader.onload = e => {
          this.avatarPreview = e.target.result;
          this.$emit("avatar-preview", e.target.result);
        };
        reader.readAsDataURL(file);
      }
    },
    async submitForm() {
      try {
        const formData = new FormData();
        for (const key in this.localMember) {
          if (this.localMember[key] !== null && this.localMember[key] !== undefined) {
            formData.append(key, this.localMember[key]);
          }
        }

        const res = await axios.post("/api/member/setting", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        });

        const updatedAvatar = res.data.avatarURL || this.avatarPreview;
        this.avatarPreview = updatedAvatar;
        this.localMember.avatarURL = updatedAvatar;

        this.$emit("updated", { ...this.localMember });

        await Swal.fire({
          icon: "success",
          title: "更新成功！",
          confirmButtonText: "OK"
        });

        this.$emit("close");
      } catch (err) {
        console.error("更新失敗:", err);
        Swal.fire({
          icon: "error",
          title: "更新失敗",
          confirmButtonText: "請稍後再試"
        });
      }
    },
    resetForm() {
      this.initForm();
    }
  }
};
