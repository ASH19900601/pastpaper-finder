/**
 * core.js — 纯逻辑核心（同构：浏览器 / Node 共用同一份实现）
 *
 * 这里只放与 DOM、网络无关的纯函数，保证：
 *   GUI（浏览器）与 CLI（Node 测试）调用完全相同的实现，结果一致。
 *
 * 浏览器：通过全局 window.PPCore 访问。
 * Node ：通过 require('./core.js') 访问。
 */
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.PPCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // 文件类型元数据（含 AQA 文件名后缀与图标）
    const TYPE_OPTIONS = {
        qp: { label: '试卷 (Question Paper)', shortLabel: 'Question Paper', suffix: 'QP', icon: 'fa-file-pdf' },
        ms: { label: '答案 (Mark Scheme)', shortLabel: 'Mark Scheme', suffix: 'MS', icon: 'fa-check-circle' },
        in: { label: '插页 (Insert)', shortLabel: 'Insert', suffix: 'INS', icon: 'fa-file-alt' },
        er: { label: '考官报告 (Examiner Report)', shortLabel: 'Examiner Report', suffix: 'ER', icon: 'fa-chart-line' }
    };

    const SEASON_OPTIONS = {
        j: { label: 'January' },
        m: { label: 'March (Spring)' },
        s: { label: 'May/June (Summer)' },
        w: { label: 'Oct/Nov (Winter)' },
        specimen: { label: 'Specimen' }
    };

    function buildGoogleSearch(query) {
        return 'https://www.google.com/search?q=' + encodeURIComponent(query);
    }

    // CAIE 文件名： {code}_{season}{yy}_{type}_{paper}.pdf
    function caieFileName(selected) {
        const yy = String(selected.year).slice(2);
        return `${selected.code}_${selected.season}${yy}_${selected.type}_${selected.paper}.pdf`;
    }

    // 生成 CAIE 各镜像链接
    function caieMirrors(selected, subjectName, peh) {
        const fileName = caieFileName(selected);
        const ppcSeason = { m: 'Feb-March', s: 'May-June', w: 'Oct-Nov' }[selected.season] || '';
        const ppcLvl = selected.lvl === 'igcse' ? 'IGCSE' : 'A-Level';
        const ppcUrl = `https://pastpapers.co/cie/${ppcLvl}/${subjectName.replace(/ /g, '%20')}-${selected.code}/${selected.year}-${ppcSeason}/${fileName}`;
        const behLvl = selected.lvl === 'igcse' ? 'cambridge-igcse' : 'cambridge-international-a-level';
        const behUrl = `https://bestexamhelp.com/exam/${behLvl}/${peh}/${selected.year}/${fileName}`;
        const googleUrl = buildGoogleSearch(`ext:pdf "${fileName}"`);
        return {
            fileName,
            mirrors: [
                { id: 'beh', label: 'BestExamHelp', url: behUrl, icon: 'fa-rocket', check: true },
                { id: 'ppc', label: 'PastPapers.co', url: ppcUrl, icon: 'fa-server', check: true },
                { id: 'ggl', label: 'Google 节点', url: googleUrl, icon: 'fa-google' }
            ]
        };
    }

    // AQA UK：是否应优先使用去版权(-CR)版本
    function shouldPreferAqaCopyrightRemoved(selected) {
        if (selected.code === '8700' && selected.paper === '1') return true;
        if (selected.code === '8702' && selected.paper === '2' && selected.year === '2023' && selected.season === 's') return true;
        if (selected.code === '7712' && selected.paper === '1' && selected.year === '2023' && selected.season === 's') return true;
        return false;
    }

    // AQA UK filestore 官方资源（含 -CR 变体排序）
    function buildAqaOfficialResources(selected) {
        const yy = String(selected.year).slice(2);
        const typeMeta = TYPE_OPTIONS[selected.type];
        const seasonSuffix = { j: 'JAN', m: 'MAR', s: 'JUN', w: 'NOV' }[selected.season];
        const seasonPath = { j: 'january', m: 'march', s: 'june', w: 'november' }[selected.season];

        const standardFileName = `AQA-${selected.code}${selected.paper}-${typeMeta.suffix}-${seasonSuffix}${yy}.PDF`;
        const standardUrl = `https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/${selected.year}/${seasonPath}/${standardFileName}`;
        if (selected.type !== 'qp') return [{ fileName: standardFileName, url: standardUrl }];

        const crFileName = `AQA-${selected.code}${selected.paper}-${typeMeta.suffix}-${seasonSuffix}${yy}-CR.PDF`;
        const crUrl = `https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/${selected.year}/${seasonPath}/${crFileName}`;
        const ordered = shouldPreferAqaCopyrightRemoved(selected)
            ? [{ fileName: crFileName, url: crUrl }, { fileName: standardFileName, url: standardUrl }]
            : [{ fileName: standardFileName, url: standardUrl }, { fileName: crFileName, url: crUrl }];
        return ordered.filter((item, i, all) => all.findIndex(x => x.url === item.url) === i);
    }

    /**
     * 计算分数线，A* 缺失时用 A* = A + (A - B) 预估（上限为 max）
     * @returns {object|null} { max, aStar, a, b, c, predicted }
     */
    function computeThreshold(t) {
        if (!t) return null;
        let aStar = t.a_star;
        let predicted = false;
        if (!aStar && t.a !== undefined && t.b !== undefined) {
            aStar = t.a + (t.a - t.b);
            if (aStar > t.max) aStar = t.max;
            predicted = true;
        }
        return { max: t.max, aStar, a: t.a, b: t.b, c: t.c, predicted };
    }

    return {
        TYPE_OPTIONS, SEASON_OPTIONS,
        buildGoogleSearch, caieFileName, caieMirrors,
        shouldPreferAqaCopyrightRemoved, buildAqaOfficialResources, computeThreshold
    };
});
