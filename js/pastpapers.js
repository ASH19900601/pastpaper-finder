/**
 * pastpapers.js — 真题下载链接聚合
 * 改编自原站 pastpapers.js。改动：
 *  - 数据文件路径改为本项目内的 data/*.json
 *  - 链接可用性探测代理改为从 AppConfig 读取（可由用户配置/留空禁用）
 */
document.addEventListener('DOMContentLoaded', () => {
    AppConfig.initUI();

    const levelSelect = document.getElementById('level');
    const subjectSelect = document.getElementById('subject');
    const yearSelect = document.getElementById('year');
    const seasonSelect = document.getElementById('season');
    const typeSelect = document.getElementById('type');
    const paperSelect = document.getElementById('paper');
    const form = document.getElementById('paperForm');
    const resultsSection = document.getElementById('resultsSection');
    const resultFileName = document.getElementById('resultFileName');
    const mirrorsContainer = document.getElementById('mirrorsContainer');
    const noticeAlert = document.querySelector('.notice-alert');

    let thresholdsData = {};
    let aqaPapersData = {};

    // 纯逻辑统一来自同构核心 PPCore（与 CLI 测试共用同一份实现）
    const TYPE_OPTIONS = PPCore.TYPE_OPTIONS;
    const SEASON_OPTIONS = PPCore.SEASON_OPTIONS;

    const subjectsData = {
        igcse: [
            { code: '0580', name: 'Mathematics', peH: 'mathematics-0580', papers: [1, 2, 3, 4] },
            { code: '0606', name: 'Additional Mathematics', peH: 'mathematics-additional-0606', papers: [1, 2] },
            { code: '0625', name: 'Physics', peH: 'physics-0625', papers: [1, 2, 3, 4, 5, 6] },
            { code: '0620', name: 'Chemistry', peH: 'chemistry-0620', papers: [1, 2, 3, 4, 5, 6] },
            { code: '0610', name: 'Biology', peH: 'biology-0610', papers: [1, 2, 3, 4, 5, 6] },
            { code: '0478', name: 'Computer Science', peH: 'computer-science-0478', papers: [1, 2] },
            { code: '0455', name: 'Economics', peH: 'economics-0455', papers: [1, 2] },
            { code: '0450', name: 'Business Studies', peH: 'business-studies-0450', papers: [1, 2] },
            { code: '0470', name: 'History', peH: 'history-0470', papers: [1, 2, 4] },
            { code: '0500', name: 'First Language English', peH: 'english-first-language-0500', papers: [1, 2] }
        ],
        alevel: [
            { code: '9709', name: 'Mathematics', peH: 'mathematics-9709', papers: [1, 2, 3, 4, 5, 6] },
            { code: '9231', name: 'Further Mathematics', peH: 'mathematics-further-9231', papers: [1, 2, 3, 4] },
            { code: '9702', name: 'Physics', peH: 'physics-9702', papers: [1, 2, 3, 4, 5] },
            { code: '9701', name: 'Chemistry', peH: 'chemistry-9701', papers: [1, 2, 3, 4, 5] },
            { code: '9700', name: 'Biology', peH: 'biology-9700', papers: [1, 2, 3, 4, 5] },
            { code: '9618', name: 'Computer Science', peH: 'computer-science-for-first-examination-in-2021-9618', papers: [1, 2, 3, 4] },
            { code: '9708', name: 'Economics', peH: 'economics-9708', papers: [1, 2, 3, 4] },
            { code: '9609', name: 'Business', peH: 'business-9609', papers: [1, 2, 3, 4] },
            { code: '9093', name: 'English Language', peH: 'english-language-9093', papers: [1, 2, 3, 4] }
        ],
        'aqa-igcse': [
            { code: '9270', name: 'English Language (OxfordAQA International GCSE)', peH: 'english-language-9270', aqaMode: 'manifest', resourceKey: '9270', papers: [{ value: '1', label: 'Paper 1' }, { value: '2', label: 'Paper 2' }] },
            { code: '9275', name: 'English Literature (OxfordAQA International GCSE)', peH: 'english-literature-9275', aqaMode: 'manifest', resourceKey: '9275', papers: [{ value: '1', label: 'Paper 1' }, { value: '2', label: 'Paper 2' }] },
            { code: '8700', name: 'English Language (AQA GCSE UK)', peH: 'english-language-8700', aqaMode: 'filestore', papers: [{ value: '1', label: 'Paper 1' }, { value: '2', label: 'Paper 2' }], allowedSeasons: ['s', 'w'], allowedTypes: ['qp', 'ms', 'in'], mme: 'https://mmerevise.co.uk/gcse-english-language-revision/aqa-gcse-english-language-past-papers/' },
            { code: '8702', name: 'English Literature (AQA GCSE UK)', peH: 'english-literature-8702', aqaMode: 'filestore', papers: [{ value: '1', label: 'Paper 1' }, { value: '2', label: 'Paper 2' }], allowedSeasons: ['s'], allowedTypes: ['qp', 'ms'], mme: 'https://mmerevise.co.uk/gcse-english-literature-revision/aqa-gcse-english-literature-past-papers/' }
        ],
        'aqa-alevel': [
            { code: '9670', name: 'English Language (OxfordAQA International A-Level)', peH: 'english-language-9670', aqaMode: 'manifest', resourceKey: '9670', papers: [{ value: '3', label: 'Unit 3' }, { value: '4', label: 'Unit 4' }] },
            { code: '9675', name: 'English Literature (OxfordAQA International A-Level)', peH: 'english-literature-9675', aqaMode: 'manifest', resourceKey: '9675', papers: [{ value: '3', label: 'Unit 3' }, { value: '4A', label: 'Unit 4A' }] },
            { code: '7702', name: 'English Language (AQA A-Level UK)', peH: 'english-language-7702', aqaMode: 'filestore', papers: [{ value: '1', label: 'Paper 1' }, { value: '2', label: 'Paper 2' }], allowedSeasons: ['s'], allowedTypes: ['qp', 'ms'], mme: 'https://mmerevise.co.uk/a-level-english-language-revision/aqa-a-level-english-language-past-papers/' },
            { code: '7712', name: 'English Literature A (AQA A-Level UK)', peH: 'english-literature-7712', aqaMode: 'filestore', papers: [{ value: '1', label: 'Paper 1' }, { value: '2A', label: 'Paper 2A' }, { value: '2B', label: 'Paper 2B' }], allowedSeasons: ['s'], allowedTypes: ['qp', 'ms'], mme: 'https://mmerevise.co.uk/a-level-english-literature-revision/aqa-a-level-english-literature-past-papers/' }
        ]
    };

    Promise.allSettled([
        fetch('data/thresholds.json?v=' + Date.now()).then(res => res.json()).then(data => { thresholdsData = data; }),
        fetch('data/aqa-papers.json?v=' + Date.now()).then(res => res.json()).then(data => { aqaPapersData = data; })
    ]).then(init);

    function init() {
        levelSelect.addEventListener('change', () => { populateSubjects(); clearResults(); });
        subjectSelect.addEventListener('change', () => { populateYears(); clearResults(); });
        yearSelect.addEventListener('change', () => { populateSeasons(); clearResults(); });
        seasonSelect.addEventListener('change', () => { populatePapers(); clearResults(); });
        paperSelect.addEventListener('change', () => { populateTypes(); clearResults(); });
        populateSubjects();
        form.addEventListener('submit', handleSubmit);
    }

    function clearResults() { resultsSection.style.display = 'none'; mirrorsContainer.innerHTML = ''; }
    function selectedSubjectOption() { return subjectSelect.options[subjectSelect.selectedIndex]; }

    function getSubjectResources(option = selectedSubjectOption()) {
        if (!option || option.dataset.aqaMode !== 'manifest') return [];
        const group = aqaPapersData[option.dataset.resourceKey];
        return group && Array.isArray(group.resources) ? group.resources : [];
    }

    function uniqueOptions(items, valueKey, labelKey) {
        const seen = new Set();
        return items.reduce((out, item) => {
            const value = item[valueKey];
            if (value === undefined || seen.has(value)) return out;
            seen.add(value);
            out.push({ value, label: item[labelKey] || value });
            return out;
        }, []);
    }

    function populateSubjects() {
        const lvl = levelSelect.value;
        const list = subjectsData[lvl] || [];
        subjectSelect.innerHTML = '';
        list.forEach(subj => {
            const opt = document.createElement('option');
            opt.value = subj.code;
            opt.dataset.name = subj.name;
            opt.dataset.peh = subj.peH;
            opt.dataset.papers = JSON.stringify(subj.papers);
            opt.dataset.aqaMode = subj.aqaMode || '';
            opt.dataset.resourceKey = subj.resourceKey || '';
            opt.dataset.allowedSeasons = JSON.stringify(subj.allowedSeasons || []);
            opt.dataset.allowedTypes = JSON.stringify(subj.allowedTypes || []);
            if (subj.mme) opt.dataset.mme = subj.mme;
            opt.textContent = `${subj.name} (${subj.code})`;
            subjectSelect.appendChild(opt);
        });
        populateYears();
    }

    function populateYears() {
        const option = selectedSubjectOption();
        yearSelect.innerHTML = '';
        const resources = getSubjectResources(option);
        if (resources.length) {
            const years = uniqueOptions(resources, 'year', 'year_label').sort((a, b) => {
                if (a.value === 'specimen') return 1;
                if (b.value === 'specimen') return -1;
                return Number(b.value) - Number(a.value);
            });
            addOptions(yearSelect, years);
        } else {
            const isAqaFilestore = option && option.dataset.aqaMode === 'filestore';
            const maxYear = isAqaFilestore ? 2023 : 2025;
            const minYear = isAqaFilestore ? 2017 : 2015;
            for (let y = maxYear; y >= minYear; y--) addOption(yearSelect, y, y);
        }
        populateSeasons();
    }

    function populateSeasons() {
        const option = selectedSubjectOption();
        seasonSelect.innerHTML = '';
        const resources = getSubjectResources(option);
        if (resources.length) {
            const currentYear = yearSelect.value;
            const matchingYear = resources.filter(r => r.year === currentYear);
            const seasons = uniqueOptions(matchingYear.length ? matchingYear : resources, 'season', 'season_label');
            addOptions(seasonSelect, seasons);
        } else if (option && option.dataset.aqaMode === 'filestore') {
            const seasons = JSON.parse(option.dataset.allowedSeasons || '[]');
            addOptions(seasonSelect, seasons.map(value => ({ value, label: SEASON_OPTIONS[value].label })));
        } else {
            addOptions(seasonSelect, [
                { value: 'm', label: SEASON_OPTIONS.m.label },
                { value: 's', label: SEASON_OPTIONS.s.label },
                { value: 'w', label: SEASON_OPTIONS.w.label }
            ]);
            seasonSelect.value = 's';
        }
        populatePapers();
    }

    function populatePapers() {
        const option = selectedSubjectOption();
        paperSelect.innerHTML = '';
        const resources = getSubjectResources(option);
        if (resources.length) {
            const filtered = resources.filter(r => r.year === yearSelect.value && r.season === seasonSelect.value);
            const papers = uniqueOptions(filtered.length ? filtered : resources, 'paper', 'paper_label');
            addOptions(paperSelect, papers);
        } else {
            const papers = JSON.parse(option ? option.dataset.papers : '[]');
            const isAQA = levelSelect.value.startsWith('aqa');
            papers.forEach(p => {
                if (typeof p === 'object') {
                    addOption(paperSelect, p.value, p.label);
                } else if (isAQA) {
                    addOption(paperSelect, `${p}`, `Paper ${p}`);
                } else {
                    for (let v = 1; v <= 3; v++) addOption(paperSelect, `${p}${v}`, `Paper ${p}, Variant ${v}`);
                }
            });
        }
        populateTypes();
    }

    function populateTypes() {
        const option = selectedSubjectOption();
        const previous = typeSelect.value;
        typeSelect.innerHTML = '';
        const resources = getSubjectResources(option);
        if (resources.length) {
            let filtered = resources.filter(r => r.year === yearSelect.value && r.season === seasonSelect.value && r.paper === paperSelect.value);
            if (!filtered.length) filtered = resources.filter(r => r.paper === paperSelect.value);
            const types = uniqueOptions(filtered.length ? filtered : resources, 'type', 'type')
                .map(t => ({ value: t.value, label: TYPE_OPTIONS[t.value]?.label || t.value }));
            addOptions(typeSelect, types);
        } else if (option && option.dataset.aqaMode === 'filestore') {
            const types = JSON.parse(option.dataset.allowedTypes || '[]');
            addOptions(typeSelect, types.map(value => ({ value, label: TYPE_OPTIONS[value].label })));
        } else {
            addOptions(typeSelect, Object.entries(TYPE_OPTIONS).map(([value, meta]) => ({ value, label: meta.label })));
        }
        if ([...typeSelect.options].some(opt => opt.value === previous)) typeSelect.value = previous;
    }

    function addOptions(select, options) { options.forEach(opt => addOption(select, opt.value, opt.label)); }
    function addOption(select, value, label) {
        const opt = document.createElement('option');
        opt.value = String(value);
        opt.textContent = label;
        select.appendChild(opt);
    }

    function handleSubmit(e) {
        e.preventDefault();
        const lvl = levelSelect.value;
        const code = subjectSelect.value;
        const option = selectedSubjectOption();
        const year = yearSelect.value;
        const season = seasonSelect.value;
        const type = typeSelect.value;
        const paper = paperSelect.value;
        const isAQA = lvl.startsWith('aqa');

        if (isAQA && option.dataset.aqaMode === 'manifest') { renderAqaManifestResults(option, { code, year, season, type, paper }); return; }
        if (isAQA) { renderAqaFilestoreResults(option, { code, year, season, type, paper }); return; }
        renderCaieResults(option, { lvl, code, year, season, type, paper });
    }

    function renderAqaManifestResults(option, selected) {
        const resources = getSubjectResources(option);
        const exact = resources.filter(r => r.year === selected.year && r.season === selected.season && r.paper === selected.paper && r.type === selected.type);
        const samePaper = resources.filter(r => r.year === selected.year && r.season === selected.season && r.paper === selected.paper);
        const sameYear = resources.filter(r => r.year === selected.year && r.season === selected.season);
        const shown = exact.length ? exact : (samePaper.length ? samePaper : (sameYear.length ? sameYear : resources));
        const group = aqaPapersData[option.dataset.resourceKey] || {};

        resultFileName.textContent = exact.length ? exact[0].filename : `${selected.code}：未找到完全匹配，显示可下载资源`;

        const mirrors = shown.map(resource => ({
            id: 'oxford', label: resource.label || resource.filename, url: resource.url,
            icon: TYPE_OPTIONS[resource.type]?.icon || 'fa-file-pdf'
        }));
        if (group.resources_page) mirrors.push({ id: 'source', label: '资源页', url: group.resources_page, icon: 'fa-list' });
        mirrors.push({
            id: 'ggl', label: 'Google 补充搜索',
            url: buildGoogleSearch(`${selected.code} ${option.dataset.name} ${selected.year} ${selected.paper} ${TYPE_OPTIONS[selected.type]?.shortLabel || selected.type} pdf`),
            icon: 'fa-google'
        });

        hideThresholdCard();
        renderMirrors(mirrors);
        setNotice(exact.length
            ? '提示：已匹配到 OxfordAQA 官方 PDF 直链，可直接打开或下载。'
            : '提示：OxfordAQA 公开直链覆盖有限。当前组合没有完全匹配，下面列出该科目可真实打开的资源。');
    }

    function renderAqaFilestoreResults(option, selected) {
        const officialResources = PPCore.buildAqaOfficialResources(selected);
        const fileName = officialResources[0].fileName;
        const mmePageUrl = option.dataset.mme || '';

        resultFileName.textContent = fileName;
        const mirrors = officialResources.map((resource, index) => ({
            id: 'official', label: index === 0 ? 'AQA 官方直链' : 'AQA 备用直链', url: resource.url, icon: 'fa-university'
        }));
        if (mmePageUrl) mirrors.push({ id: 'mme', label: 'MME Revise 题库页', url: mmePageUrl, icon: 'fa-download' });
        const qualification = selected.code.startsWith('77') ? 'A-level' : 'GCSE';
        mirrors.push(
            { id: 'ggl', label: 'Google 精确搜索', url: PPCore.buildGoogleSearch(`"${fileName}" filetype:pdf`), icon: 'fa-google' },
            { id: 'source', label: 'AQA Assessment Resources', url: `https://www.aqa.org.uk/find-past-papers-and-mark-schemes?qualification=${qualification}&subject=English`, icon: 'fa-search' }
        );

        hideThresholdCard();
        renderMirrors(mirrors);
        setNotice('提示：UK AQA 优先使用官方 filestore 直链；若官方未公开该年份，请使用 MME 或搜索节点。');
    }

    function renderCaieResults(option, selected) {
        const { fileName, mirrors } = PPCore.caieMirrors(selected, option.dataset.name, option.dataset.peh);
        resultFileName.textContent = fileName;
        renderThresholds(selected);
        renderMirrors(mirrors);
        setNotice('提示：推荐首选 BestExamHelp 节点，连通率较高且无跳转广告。');
    }

    function renderThresholds(selected) {
        const tCard = document.getElementById('thresholdCard');
        const tGrid = document.getElementById('thresholdGrid');
        tCard.style.display = 'none';
        if (selected.type !== 'qp') return;

        const yy = selected.year.slice(2);
        const tKey = `${selected.code}_${selected.season}${yy}_${selected.paper}`;
        const t = PPCore.computeThreshold(thresholdsData[tKey]);
        if (!t) return;

        let html = `<div class="t-box"><div class="t-label">满分 (Max)</div><div class="t-value">${t.max}</div></div>`;
        if (t.aStar) html += `<div class="t-box t-astar"><div class="t-label">A* ${t.predicted ? '(预测)' : ''}</div><div class="t-value">${t.aStar}</div></div>`;
        if (t.a !== undefined) html += `<div class="t-box"><div class="t-label">A</div><div class="t-value">${t.a}</div></div>`;
        if (t.b !== undefined) html += `<div class="t-box"><div class="t-label">B</div><div class="t-value">${t.b}</div></div>`;
        if (t.c !== undefined) html += `<div class="t-box"><div class="t-label">C</div><div class="t-value">${t.c}</div></div>`;

        tGrid.innerHTML = html;
        tCard.style.display = 'block';
        document.getElementById('thresholdDisclaimer').style.display = t.predicted ? 'block' : 'none';
    }

    function hideThresholdCard() { document.getElementById('thresholdCard').style.display = 'none'; }

    function renderMirrors(mirrors) {
        resultsSection.style.display = 'block';
        mirrorsContainer.innerHTML = '';
        const checkProxy = AppConfig.getCheckProxy();

        mirrors.forEach(m => {
            const a = document.createElement('a');
            a.className = `mirror-btn ${m.id || 'official'}`;
            a.href = m.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';

            const icon = document.createElement('i');
            icon.className = `fas ${m.icon || 'fa-file-pdf'}`;
            a.appendChild(icon);
            a.appendChild(document.createTextNode(` ${m.label} `));

            if (m.check && checkProxy) {
                const statusIcon = document.createElement('i');
                statusIcon.className = 'fas fa-spinner fa-spin status-icon';
                statusIcon.style.marginLeft = '8px';
                a.appendChild(statusIcon);
                mirrorsContainer.appendChild(a);
                checkMirror(m.url, a, statusIcon, checkProxy);
            } else {
                mirrorsContainer.appendChild(a);
            }
        });
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function checkMirror(url, anchor, statusIcon, checkProxy) {
        fetch(checkProxy + encodeURIComponent(url))
            .then(r => r.json())
            .then(data => {
                statusIcon.classList.remove('fa-spinner', 'fa-spin');
                if (data && data.status && data.status.http_code >= 200 && data.status.http_code < 400) {
                    statusIcon.className = 'fas fa-check-circle';
                } else {
                    statusIcon.className = 'fas fa-times-circle';
                    anchor.style.opacity = '0.6';
                    anchor.title = '该节点目前可能不可用，请尝试其他节点';
                }
            })
            .catch(() => {
                statusIcon.className = 'fas fa-question-circle';
                statusIcon.classList.remove('fa-spinner', 'fa-spin');
            });
    }

    function buildGoogleSearch(query) { return PPCore.buildGoogleSearch(query); }
    function setNotice(text) { if (noticeAlert) noticeAlert.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`; }
});
