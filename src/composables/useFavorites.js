import Swal from "sweetalert2";
import axios from "axios";
import { useUserStore } from "@/stores/user.js"; // 存會員資料

export const useFavorites = () => {


    const toggleFavorite = async (vendor) => {

        const memberStore = useUserStore(); // 取得會員狀態
        const memberId = memberStore.user?.member?.memberId; // 假設登入後會存 memberId

        // 若未登入
        if (!memberId) {
            await Swal.fire("請先登入會員再使用收藏功能", "", "warning");
            return;
        }

        if (!vendor.isFavorited) {
            // 加入收藏
            const result = await Swal.fire({
                title: `確認將「${vendor.vendorName}」加入收藏？`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "加入收藏",
                cancelButtonText: "取消",
            });
            if (result.isConfirmed) {
                try {
                    await axios.post("/api/favorites/my", {
                        memberId: memberId,
                        vendorID: vendor.vendorId,
                    });
                    vendor.isFavorited = true;
                    await Swal.fire("已加入收藏", "", "success");
                } catch (err) {
                    console.error(err);
                    Swal.fire("加入收藏失敗", "", "error");
                }
            }
        } else {
            // 取消收藏
            const result = await Swal.fire({
                title: `確認取消收藏「${vendor.vendorName}」？`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "是，取消收藏",
                cancelButtonText: "取消",
            });
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/favorites/my/${memberId}/${vendor.vendorId}`);
                    vendor.isFavorited = false;
                    await Swal.fire("已取消收藏", "", "success");
                } catch (err) {
                    console.error(err);
                    Swal.fire("取消收藏失敗", "", "error");
                }
            }
        }
    };

    return { toggleFavorite };
};
