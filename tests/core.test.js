/**
 * CLI 测试（Node 内置 node:test，无需安装依赖）
 * 运行：node --test   （在项目根目录）
 *
 * 这些断言验证的是与 GUI 完全相同的 PPCore 纯逻辑，
 * 因此 CLI 结果即代表 GUI 行为。
 */
const test = require('node:test');
const assert = require('node:assert');
const PPCore = require('../js/core.js');

test('CAIE 文件名拼装', () => {
    const fn = PPCore.caieFileName({ code: '0580', season: 's', year: '2023', type: 'qp', paper: '12' });
    assert.strictEqual(fn, '0580_s23_qp_12.pdf');
});

test('CAIE 镜像链接（IGCSE）', () => {
    const { fileName, mirrors } = PPCore.caieMirrors(
        { lvl: 'igcse', code: '0620', season: 's', year: '2023', type: 'qp', paper: '42' },
        'Chemistry', 'chemistry-0620'
    );
    assert.strictEqual(fileName, '0620_s23_qp_42.pdf');
    const beh = mirrors.find(m => m.id === 'beh');
    assert.strictEqual(beh.url,
        'https://bestexamhelp.com/exam/cambridge-igcse/chemistry-0620/2023/0620_s23_qp_42.pdf');
    const ppc = mirrors.find(m => m.id === 'ppc');
    assert.strictEqual(ppc.url,
        'https://pastpapers.co/cie/IGCSE/Chemistry-0620/2023-May-June/0620_s23_qp_42.pdf');
});

test('CAIE 镜像链接（A-Level + 科目名含空格）', () => {
    const { mirrors } = PPCore.caieMirrors(
        { lvl: 'alevel', code: '9231', season: 'w', year: '2022', type: 'ms', paper: '11' },
        'Further Mathematics', 'mathematics-further-9231'
    );
    const beh = mirrors.find(m => m.id === 'beh');
    assert.ok(beh.url.includes('cambridge-international-a-level/mathematics-further-9231/2022/9231_w22_ms_11.pdf'));
    const ppc = mirrors.find(m => m.id === 'ppc');
    assert.ok(ppc.url.includes('Further%20Mathematics-9231'));
});

test('AQA filestore：QP 默认顺序（标准在前，CR 在后）', () => {
    const res = PPCore.buildAqaOfficialResources({ code: '7702', season: 's', year: '2022', type: 'qp', paper: '1' });
    assert.strictEqual(res.length, 2);
    assert.strictEqual(res[0].fileName, 'AQA-77021-QP-JUN22.PDF');
    assert.strictEqual(res[1].fileName, 'AQA-77021-QP-JUN22-CR.PDF');
    assert.ok(res[0].url.startsWith('https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/'));
});

test('AQA filestore：非 QP 类型只产生单一标准链接', () => {
    const res = PPCore.buildAqaOfficialResources({ code: '7702', season: 's', year: '2022', type: 'ms', paper: '1' });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].fileName, 'AQA-77021-MS-JUN22.PDF');
});

test('AQA filestore：特殊试卷优先 CR 版本', () => {
    assert.strictEqual(PPCore.shouldPreferAqaCopyrightRemoved({ code: '8700', paper: '1' }), true);
    const res = PPCore.buildAqaOfficialResources({ code: '8700', season: 's', year: '2022', type: 'qp', paper: '1' });
    assert.ok(res[0].fileName.endsWith('-CR.PDF'));
});

test('分数线：直接给出 A* 时不预测', () => {
    const t = PPCore.computeThreshold({ max: 80, a_star: 52, a: 41, b: 30 });
    assert.strictEqual(t.aStar, 52);
    assert.strictEqual(t.predicted, false);
});

test('分数线：缺 A* 时用 A*=A+(A-B) 预测', () => {
    const t = PPCore.computeThreshold({ max: 40, a: 27, b: 23 });
    assert.strictEqual(t.aStar, 31); // 27 + (27-23)
    assert.strictEqual(t.predicted, true);
});

test('分数线：预测值超过满分时封顶为 max', () => {
    const t = PPCore.computeThreshold({ max: 40, a: 39, b: 30 });
    assert.strictEqual(t.aStar, 40); // 39+9=48 -> capped 40
    assert.strictEqual(t.predicted, true);
});

test('分数线：空数据返回 null', () => {
    assert.strictEqual(PPCore.computeThreshold(undefined), null);
});
