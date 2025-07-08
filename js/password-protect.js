/**
 * 文章栏目密码保护逻辑
 * 功能：
 * 1. 点击文章链接弹出密码输入框
 * 2. 验证通过后存储 sessionStorage 令牌
 * 3. 3次错误尝试后锁定
 */

document.addEventListener("DOMContentLoaded", function() {
    // ============= 配置项 =============
    const config = {
        // Base64 编码后的密码（真实密码是 "mySecret123"）
        correctPassword: btoa("mySecret123"), 
        maxAttempts: 3,                      // 最大尝试次数
        redirectUrl: "articles.html",        // 跳转目标
        tokenKey: "article_access_token",    // SessionStorage 密钥
        swalOptions: {                       // SweetAlert2 配置
            title: "🔒 文章栏目已加密",
            input: "password",
            inputPlaceholder: "请输入访问密码",
            showCancelButton: true,
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            allowOutsideClick: false,        // 禁止点击外部关闭
            inputValidator: (value) => !value && "密码不能为空！"
        }
    };

    // ============= 初始化 =============
    let attempts = 0; // 当前尝试次数

    // ============= 绑定文章链接点击事件 =============
    const articleLink = document.querySelector('a[href*="articles.html"]');
    if (articleLink) {
        articleLink.addEventListener("click", function(e) {
            e.preventDefault(); // 阻止默认跳转
            checkPassword();
        });
    }

    // ============= 密码验证函数 =============
    async function checkPassword() {
        // 检查是否已锁定
        if (attempts >= config.maxAttempts) {
            await Swal.fire({
                icon: "error",
                title: "已锁定",
                text: "尝试次数过多，请稍后再试！",
                timer: 2000, // 2秒后自动关闭
                showConfirmButton: false
            });
            return;
        }

        // 弹出密码输入框
        const { value: inputPassword } = await Swal.fire(config.swalOptions);

        // 用户点击取消
        if (inputPassword === undefined) return;

        // 验证密码（对比 Base64 编码值）
        if (btoa(inputPassword) === config.correctPassword) {
            // 1. 存储访问令牌
            sessionStorage.setItem(config.tokenKey, "true");
            
            // 2. 显示成功提示
            await Swal.fire({
                icon: "success",
                title: "验证通过",
                text: "正在跳转...",
                timer: 1500,
                showConfirmButton: false
            });

            // 3. 跳转到目标页
            window.location.href = config.redirectUrl;
        } else {
            // 密码错误处理
            attempts++;
            const remaining = config.maxAttempts - attempts;

            await Swal.fire({
                icon: "error",
                title: "密码错误",
                text: remaining > 0 ? `剩余尝试次数: ${remaining}` : "已锁定",
                timer: 2000,
                showConfirmButton: false
            });
        }
    }
});