$(document).ready(function () {

    // ---------- 側邊欄開啟 ----------
    $(document).on('click', '#openSetting', function (e) {
        e.preventDefault();
        $.get('/member/setting')
            .done(function (data) {
                $('#settingContent').html(data);
                $('#memberSetting').addClass('show');
            })
            .fail(function () {
                alert("Failed to load member settings");
            });
    });

    // ---------- 側邊欄關閉 ----------
    $(document).on('click', '#memberSetting .close-btn', function () {
        $('#memberSetting').removeClass('show');
    });

	// ---------- 即時頭像預覽 ----------
	$(document).on('change', '#avatarFileInput', function () {
	    var file = this.files[0];
	    if (file) {
	        var reader = new FileReader();
	        reader.onload = function (e) {
	            // 同步更新首頁和設定表單的頭像
	            $('#avatarPreviewHome').attr('src', e.target.result);
	            $('#avatarPreviewForm').attr('src', e.target.result);
	        }
	        reader.readAsDataURL(file);
	    }
	});


    // ---------- 表單提交 AJAX ----------
    $(document).on('submit', '#memberSettingsForm', function (e) {
        e.preventDefault();

        var formData = new FormData(this); // 支援檔案上傳

        $.ajax({
            url: '/member/setting/update',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (resp) {
                if (resp.status === "success") {
                    var $form = $('#memberSettingsForm');

                    // 同步文字欄位
                    $('#displayUserName').text($form.find('#userName').val());
                    $('#displayPhone').text($form.find('#phone').val());
                    $('#displayBirthdate').text($form.find('#birthdate').val());
                    $('#displayCity').text($form.find('#city').val());
                    $('#displayDistrict').text($form.find('#district').val());

                    // 如果有新頭像更新顯示
                    if (resp.avatar) {
                        var newUrl = "/uploads/avatars/" + resp.avatar + "?t=" + new Date().getTime();
                        $('#avatarPreview').attr('src', newUrl);
                        $('#displayAvatar').attr('src', newUrl);
                    }

                    // SweetAlert 成功提示
                    Swal.fire({
                        title: '更新成功！',
                        text: resp.message || '你的會員設定已經更新完成!',
                        icon: 'success',
                        confirmButtonText: '確定'
                    }).then(() => {
                        $('#memberSetting').removeClass('show'); // 關閉側邊欄
                    });

                } else {
                    Swal.fire('錯誤', resp.message || '更新失敗', 'error');
                }
            },
            error: function () {
                Swal.fire({
                    title: '更新失敗',
                    text: '請稍後再試。',
                    icon: 'error',
                    confirmButtonText: '確認'
                });
            }
        });
    });

});
