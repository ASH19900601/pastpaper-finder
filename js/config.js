/**
 * config.js — Past Paper Finder 设置管理
 * 本工具无需任何密钥；唯一可配置项是「链接可用性探测代理」。
 * 设置保存在浏览器 localStorage。
 */
const AppConfig = (() => {
    const STORAGE_KEY = 'pastpaper_finder_config_v1';
    // 默认使用公开 CORS 服务（无需密钥）。用户可改成自己的代理或留空禁用。
    const DEFAULT_CHECK_PROXY = 'https://api.allorigins.win/get?url=';

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { checkProxy: DEFAULT_CHECK_PROXY };
            const parsed = JSON.parse(raw);
            return { checkProxy: parsed.checkProxy ?? DEFAULT_CHECK_PROXY };
        } catch (e) {
            return { checkProxy: DEFAULT_CHECK_PROXY };
        }
    }

    function save(cfg) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    }

    function getCheckProxy() {
        return load().checkProxy || '';
    }

    function openModal() {
        const modal = document.getElementById('settingsModal');
        if (!modal) return;
        const input = document.getElementById('cfg-checkProxy');
        if (input) input.value = load().checkProxy || '';
        modal.style.display = 'flex';
    }

    function closeModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) modal.style.display = 'none';
    }

    function initUI() {
        const settingsBtn = document.getElementById('settingsBtn');
        const saveBtn = document.getElementById('cfgSaveBtn');
        const cancelBtn = document.getElementById('cfgCancelBtn');
        if (settingsBtn) settingsBtn.addEventListener('click', openModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (saveBtn) saveBtn.addEventListener('click', () => {
            const input = document.getElementById('cfg-checkProxy');
            save({ checkProxy: input ? input.value.trim() : DEFAULT_CHECK_PROXY });
            closeModal();
        });
        const modal = document.getElementById('settingsModal');
        if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    }

    return { load, save, getCheckProxy, openModal, closeModal, initUI };
})();
