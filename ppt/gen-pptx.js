const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = '健康追踪';

const BLUE = '1A56DB';
const INK = '0A0A0A';
const GRAY = '888888';
const LIGHT = 'F5F5F3';
const WHITE = 'FFFFFF';
const BORDER = 'E2E2E0';

function card(s, x, y, w, h, title, desc, accent) {
  s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill:WHITE, line:{color: accent?BLUE:BORDER, width: accent?1.5:0.5}, rectRadius:0 });
  if (accent) s.addShape(pptx.ShapeType.rect, { x, y, w:0.06, h, fill:BLUE, line:{color:BLUE,width:0} });
  s.addText(title, { x: x+0.2+(accent?0.1:0), y: y+0.15, w: w-0.4, h:0.4, fontSize:14, color:INK, bold:false, fontFace:'Microsoft YaHei' });
  if (desc) s.addText(desc, { x: x+0.2+(accent?0.1:0), y: y+0.55, w: w-0.4, h: h-0.7, fontSize:11, color:GRAY });
}

function kpi(s, x, y, w, num, label) {
  s.addText(num, { x, y, w, h:1.2, fontSize:56, color:INK, bold:false, fontFace:'Microsoft YaHei Light' });
  s.addText(label, { x, y:y+1.3, w, h:0.4, fontSize:13, color:GRAY });
}

function title(s, t) { s.addText(t, { x:1.2, y:0.5, fontSize:12, color:BLUE, fontFace:'Microsoft YaHei', bold:true }); }
function heading(s, t) { s.addText(t, { x:1.2, y:1.2, fontSize:28, color:INK, bold:false, fontFace:'Microsoft YaHei Light' }); }

// ========== S01: COVER ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  s.addText('健康追踪', { x:1.2, y:1.8, w:8, h:1.5, fontSize:58, color:INK, bold:false, fontFace:'Microsoft YaHei Light' });
  s.addText('AI 驱动的饮食健康管理平台\n拍照识别  ·  体检分析  ·  个性化建议', { x:1.2, y:3.5, w:8, fontSize:16, color:GRAY });
  s.addText('商业计划书  ·  2026', { x:1.2, y:5.5, fontSize:11, color:GRAY }); }

// ========== S02: ONE-LINER ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, '一句话介绍');
  s.addText([{text:'不只是记录吃了什么\n而是告诉你',options:{fontSize:30,color:INK,fontFace:'Microsoft YaHei Light'}},{text:' 该不该吃',options:{fontSize:30,color:BLUE,fontFace:'Microsoft YaHei'}}], {x:1.2, y:2, w:8, h:2});
  s.addText('接入 AI 视觉识别  ·  打通体检报告  ·  中西医结合建议', { x:1.2, y:4.8, fontSize:13, color:GRAY }); }

// ========== S03: WHY ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, '为什么做这个产品');
  s.addText([{text:'为',options:{fontSize:30,color:INK,fontFace:'Microsoft YaHei Light'}},{text:'每一个关心健康',options:{fontSize:30,color:BLUE}},{text:'的人',options:{fontSize:30,color:INK,fontFace:'Microsoft YaHei Light'}}], {x:1.2, y:1.3, w:8});
  const items = [
    { t:'保持身材的女性', d:'想知道每餐热量\n不想靠感觉来控制饮食' },
    { t:'关心孩子的家长', d:'了解孩子吃得是否均衡\n营养是否足够' },
    { t:'慢性病风险人群', d:'糖尿病、高血压、高血脂\n高尿酸——需要根据体检调整饮食' }
  ];
  items.forEach((it,i) => card(s, 1.2+i*3, 2.8, 2.7, 2.2, it.t, it.d, true));
  s.addText('不知道吃的东西有多少热量、是否适合自己身体状况', { x:1.2, y:5.5, fontSize:11, color:GRAY }); }

// ========== S04: OVERVIEW ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, '项目概况');
  heading(s, '拍照即所得，AI 全流程');
  const items = [
    { t:'AI 识别', d:'拍照识别食物\n自动匹配营养成分' },
    { t:'体检分析', d:'上传报告图片\nAI 提取指标并解读' },
    { t:'个性建议', d:'结合健康档案\n实时生成饮食指导' },
    { t:'中医食补', d:'四季体质调理\nAI 定制食疗方案' }
  ];
  items.forEach((it,i) => card(s, 1.2+i*2.3, 3, 2.1, 2, it.t, it.d));
  s.addText('Next.js 全栈  ·  MiniMax-M3 多模态 AI  ·  PostgreSQL', { x:1.2, y:5.5, fontSize:10, color:GRAY }); }

// ========== S05: DEMO ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, 'Demo 功能亮点');
  kpi(s, 1.2, 1.5, 4, '5', 'AI 能力全面覆盖');
  s.addText('拍照识别  ·  营养估算  ·  报告 OCR  ·  AI 分析  ·  中医食疗', { x:1.2, y:3.4, fontSize:13, color:BLUE });
  s.addText('全流程 AI 驱动：识别 → 分析 → 建议 → 食补', { x:1.2, y:3.8, fontSize:11, color:GRAY });
  kpi(s, 5.5, 1.5, 4, '255', '内置食物数据库');
  s.addText('覆盖主食、肉类、蔬菜、水果、饮品、菜肴\nAI 识别后智能匹配，未匹配项实时创建', { x:5.5, y:3.4, fontSize:11, color:GRAY });
  s.addText('响应式设计  ·  手机端 + 桌面端  ·  多用户支持', { x:1.2, y:5.5, fontSize:10, color:GRAY }); }

// ========== S06: AI STACK ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, '技术架构');
  s.addText([{text:'全流程 ',options:{fontSize:30,color:INK,fontFace:'Microsoft YaHei Light'}},{text:'AI',options:{fontSize:30,color:BLUE}},{text:' 覆盖',options:{fontSize:30,color:INK,fontFace:'Microsoft YaHei Light'}}], {x:1.2, y:1.3, w:8});
  const items = [
    { t:'视觉识别', d:'MiniMax-M3 多模态模型\n温度 0 确定性输出\n3 次测试一致率 100%' },
    { t:'营养估算', d:'输入食物名 + 克数\nAI 实时返回热量、蛋白\n脂肪、碳水、纤维、糖' },
    { t:'报告分析', d:'上传体检报告图片\nAI 三段式输出\n指标提取 → 风险评估 → 饮食建议' }
  ];
  items.forEach((it,i) => card(s, 1.2+i*3, 2.8, 2.7, 2.2, it.t, it.d, true));
  s.addText('OCR 指标提取  ·  规则引擎 + AI 双通道建议  ·  中医食补 AI', { x:1.2, y:5.5, fontSize:10, color:GRAY }); }

// ========== S07: PAIN POINTS ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, '市场痛点');
  const items = [
    { t:'记录太麻烦', d:'手动查热量表效率极低\nAI 拍照一秒完成' },
    { t:'不知道该吃什么', d:'知道有高血糖\n不知道这盘菜能不能吃' },
    { t:'体检报告看不懂', d:'拿了报告不知指标含义\n不知怎么调整饮食' },
    { t:'缺乏个性化', d:'热量 App 千篇一律\n不根据个人健康状况调整' },
    { t:'中餐识别差', d:'海外竞品西餐为主\n中餐数据匮乏' },
    { t:'缺 AI 深度', d:'现有产品简单数据库查询\n缺乏真正的 AI 分析能力' }
  ];
  items.forEach((it,i) => card(s, 1.2+(i%3)*3, 2.2+Math.floor(i/3)*2, 2.7, 1.6, it.t, it.d)); }

// ========== S08: COMPETITORS ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, '竞品分析');
  const items = [
    { t:'薄荷健康', d:'国内最大食物库，用户量大', x:'无 AI 拍照  ·  无体检关联' },
    { t:'MyFitnessPal', d:'全球最大，数据库最丰富', x:'西餐为主  ·  国内体验差' },
    { t:'Keep 饮食', d:'运动+饮食一体', x:'功能浅  ·  无 AI  ·  无体检' },
    { t:'健康追踪（我们）', d:'AI 全流程  ·  体检联动  ·  中西医结合', x:'无直接竞品做到全链路 AI', accent:true }
  ];
  items.forEach((it,i) => {
    const col = i%2, row = Math.floor(i/2);
    card(s, 1.2+col*4.5, 2.2+row*2, 4.1, 1.7, it.t, it.d, it.accent);
    s.addText(it.x, { x:1.4+col*4.5+(it.accent?0.1:0), y:3.1+row*2, w:3.7, fontSize:11, color:BLUE });
  }); }

// ========== S09: FEATURES ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, '产品功能矩阵');
  const items = ['AI 拍照识别','AI 营养估算','AI 体检 OCR','AI 报告分析','AI 中医食补','热量圆环','营养素进度','动态建议'];
  items.forEach((it,i) => {
    const col = i%4, row = Math.floor(i/4);
    card(s, 1.2+col*2.3, 2.2+row*2.2, 2.1, 1.8, it, '', true);
  });
  s.addText('17 项核心功能全部已实现  ·  响应式适配', { x:1.2, y:5.5, fontSize:10, color:GRAY }); }

// ========== S10: BUSINESS MODEL ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, '商业模式');
  const items = [
    { t:'初期  ·  免费', d:'积累用户和数据\n验证 PMF' },
    { t:'成长期  ·  Freemium', d:'免费版每日 5 次 AI\n付费 ¥19/月 无限使用' },
    { t:'成熟期  ·  B2B', d:'企业健康管理\n¥5-10/人/月' }
  ];
  items.forEach((it,i) => card(s, 1.2+i*3, 2.5, 2.7, 2.2, it.t, it.d));
  s.addText('增值服务：营养师咨询平台抽佣 15-20%  ·  健康食品电商引流', { x:1.2, y:5.5, fontSize:10, color:GRAY }); }

// ========== S11: FINANCIAL ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, '财务预测（第一年）');
  const items = [
    { n:'¥5 万', l:'保守', d:'1 万人  ·  3% 付费' },
    { n:'¥42 万', l:'中等', d:'5 万人  ·  5% 付费' },
    { n:'¥269 万', l:'乐观', d:'20 万人  ·  8% 付费' }
  ];
  items.forEach((it,i) => {
    s.addShape(pptx.ShapeType.rect, { x:1.2+i*3, y:2, w:2.7, h:2.8, fill:WHITE, line:{color:BLUE,width:1} });
    s.addText(it.n, { x:1.2+i*3, y:2.2, w:2.7, h:1, fontSize:38, color:INK, align:'center', fontFace:'Microsoft YaHei Light' });
    s.addText(it.l, { x:1.2+i*3, y:3.3, w:2.7, h:0.5, fontSize:16, color:INK, align:'center' });
    s.addText(it.d, { x:1.2+i*3, y:3.8, w:2.7, h:0.5, fontSize:11, color:GRAY, align:'center' });
  });
  s.addText('年运营成本 ¥4,320 - ¥10,320  ·  AI API + 服务器 + 域名', { x:1.2, y:5.5, fontSize:10, color:GRAY }); }

// ========== S12: RISKS ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, '风险与应对');
  const items = [
    { t:'AI 准确率不足', d:'支持手动修正\n持续优化 prompt' },
    { t:'用户留存低', d:'体检→分析闭环\n饮食打卡 + 成就系统' },
    { t:'竞品跟进', d:'聚焦全流程 AI\n+ 体检联动差异化' },
    { t:'健康建议合规', d:'免责声明\n医学顾问审核' },
    { t:'盈利不清晰', d:'先免费验证 PMF\n1 万 MAU 再订阅' },
    { t:'数据隐私', d:'行业标准加密\n用户数据不出境' }
  ];
  items.forEach((it,i) => card(s, 1.2+(i%3)*3, 2.2+Math.floor(i/3)*2, 2.7, 1.7, it.t, it.d, true)); }

// ========== S14: NEXT STEPS ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  title(s, '下一步');
  const items = [
    '找到 10-20 个真实用户，进行为期 2 周的测试',
    '收集 AI 识别准确率和用户满意度数据',
    '验证体检报告 → AI 分析 → 饮食建议需求强度',
    '确定国内部署方案，迭代产品'
  ];
  items.forEach((st,i) => {
    s.addShape(pptx.ShapeType.rect, { x:1.2, y:2+i*1.1, w:0.5, h:0.5, fill:BLUE });
    s.addText(String(i+1), { x:1.2, y:2.05+i*1.1, w:0.5, h:0.5, fontSize:14, color:WHITE, align:'center' });
    s.addText(st, { x:2, y:2+i*1.1, fontSize:15, color:INK });
  }); }

// ========== S15: CLOSING ==========
{ const s = pptx.addSlide(); s.background = { fill:LIGHT };
  s.addText([{text:'每一次技术的进步\n都应该让',options:{fontSize:26,color:INK,fontFace:'Microsoft YaHei Light'}},{text:'普通人',options:{fontSize:26,color:BLUE}},{text:'的生活\n变得更好一些',options:{fontSize:26,color:INK,fontFace:'Microsoft YaHei Light'}}], {x:1.5, y:1.5, w:7, h:3, align:'center'});
  s.addText('健康追踪  ·  2026', { x:1, y:5.1, w:8, fontSize:12, color:GRAY, align:'center' });
s.addText('丁玥文  ·  王琰若  ·  方雅琪', { x:1, y:5.5, w:8, fontSize:11, color:GRAY, align:'center' }); }

pptx.writeFile({ fileName: 'C:/Users/sarah/projects/health-track/ppt/健康追踪-商业计划书.pptx' }).then(() => console.log('OK'));
