import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Chat, Type } from "@google/genai";

// --- Types & Data ---

const COMPANY_INFO = {
  name: "苏州锐新视科技有限公司",
  enName: "Suzhou Ruixin Vision Technology Co., Ltd.",
  tagline: "智能制造领域的AI视觉与数据解决方案提供商",
  date: "2026年1月19日",
  location: "苏州市相城区人工智能产业园13楼"
};

const BP_CONTENT = `
公司名称：苏州锐新视科技有限公司
成立时间：2026年1月
总部地址：苏州市相城区人工智能产业园13楼
公司使命：通过人工智能技术赋能制造业，提升生产效率，降低成本，推动行业数字化转型
公司愿景：成为智能制造领域领先的AI视觉与数据解决方案提供商

核心产品：
1. 图像在线质检：基于AI(DINOv2)的在线图像质量检测，检测精度>97%，单张处理4.5秒，适用汽车零部件、电子电器。
2. 2D/3D相机产品（代销）：覆盖高中低端，与自研算法集成。
3. AI做报表/报告：NLP技术自动生成日报、周报、分析报告。
4. 数字员工智能体市场：汇集报关助手、排产优化员、采购数字员工等Agent，按评价排名。

核心技术：AI视觉算法(深度学习)、数据分析、NLP、自动化工作流。拥有6项发明专利，7项软著。
团队背景：核心成员来自海克斯康、先导智能。与复旦、交大有产学研合作。

市场分析：工业视觉检测市场与数字员工市场快速增长。目标客户为制造型企业、物流贸易企业。
商业模式：产品销售、软件订阅(SaaS)、Agent交易佣金、定制开发。
财务规划：寻求融资，用于研发、市场拓展、团队扩充。预计投资回收期合理，IRR高。
`;

const PRODUCT_DETAILS = {
  inspection: {
    id: 'inspection',
    title: '图像在线质检系统',
    subtitle: '基于 DINOv2 引擎的新一代工业视觉检测',
    description: '锐新视图像在线质检系统利用最先进的计算机视觉技术，特别是 DINOv2 自监督学习模型，实现了对复杂工业零部件表面缺陷的超高精度检测。',
    fullDescription: `
      在现代制造业中，产品质量是企业的生命线。传统的机器视觉检测往往依赖于复杂的规则编程，对于不规则缺陷、低对比度缺陷以及复杂背景下的缺陷检测能力有限。
      
      锐新视 AI 图像在线质检系统基于深度学习技术，特别是采用了先进的 DINOv2 视觉大模型作为特征提取引擎。它不需要大量的标注样本即可进行少样本学习（Few-shot Learning），快速适应新的产品型号。系统支持实时在线检测，能够无缝集成到现有的自动化生产线中，实现 7x24 小时不间断的高精度质量把控。
    `,
    benefits: [
      { title: "零漏检追求", desc: "深度神经网络对微小瑕疵的捕捉能力远超人眼，确保不合格品不流出。", icon: "🎯" },
      { title: "快速换型", desc: "仅需少量良品与不良品样本训练，新产品导入周期从周缩短至小时。", icon: "⚡" },
      { title: "降低成本", desc: "一台设备可替代 3-5 名质检工人，显著降低人力成本与管理成本。", icon: "📉" },
      { title: "数据闭环", desc: "所有检测数据自动上传云端，形成质量报表，辅助工艺持续改进。", icon: "🔄" }
    ],
    features: [
      { title: '高精度检测', desc: '微小划痕、锈迹、凹坑识别率 >97%' },
      { title: '极速响应', desc: '单张图像推理处理时间仅需 4.5秒' },
      { title: '小样本学习', desc: '仅需少量良品与不良品样本即可完成模型训练' },
      { title: '柔性适配', desc: '快速切换不同产线与产品型号，无需重新编程' }
    ],
    techSpecs: [
      { label: '核心算法', value: 'DINOv2 + Vision Transformer' },
      { label: '支持分辨率', value: '高达 50MP' },
      { label: '通讯协议', value: 'Modbus / TCP/IP / PLC IO' },
      { label: '部署方式', value: '边缘计算盒子 / 私有云' },
      { label: '检测速度', value: '< 50ms / image (High Speed Mode)'},
      { label: '光源控制', value: '多通道频闪控制器集成'}
    ],
    useCases: [
      '汽车发动机缸体表面砂眼检测',
      '精密电子连接器针脚歪斜检测',
      '注塑件飞边与缺料检测',
      '金属冲压件油污与划痕检测'
    ],
    caseStudy: {
        title: "汽车零部件巨头的智能化升级",
        desc: "某全球Top 10汽车零部件供应商引入锐新视质检系统后，其发动机缸盖产线的质检人员减少了80%，同时漏检率从0.5%降低至0.02%。",
        metrics: ["人力节省 80%", "漏检率 < 0.02%", "ROI < 12个月"]
    }
  },
  camera: {
    id: 'camera',
    title: '2D/3D 工业相机系列',
    subtitle: '高精度成像，为AI之眼赋能',
    description: '我们代理并深度集成的工业相机系列，覆盖了从基础2D面阵/线阵相机到高端结构光/线激光3D相机。',
    fullDescription: `
      高质量的成像是 AI 视觉算法成功的前提。锐新视不仅提供先进的算法软件，更精选全球顶尖光学硬件，提供"光机电算"一体化解决方案。
      
      我们的 3D 相机系列采用先进的结构光与线激光技术，能够在微米级精度下还原物体三维形貌，有效解决传统 2D 相机无法处理的高度、平整度及体积测量问题。所有相机均内置锐新视边缘计算 SDK，支持即插即用，让 AI 落地更简单。
    `,
    benefits: [
      { title: "工业级可靠性", desc: "IP67 防护等级，抗震防摔，适应高温、高湿、粉尘等恶劣工业环境。", icon: "🛡️" },
      { title: "真3D感知", desc: "不仅仅是平面图像，更能获取深度信息，让机器人拥有真正的空间视觉。", icon: "🧊" },
      { title: "无缝集成", desc: "硬件与锐新视 AI 平台深度绑定，无需繁琐的驱动配置与参数调试。", icon: "🔌" },
      { title: "全场景覆盖", desc: "从静态高精度检测到动态高速流水线扫描，提供全系列选型支持。", icon: "🌐" }
    ],
    features: [
      { title: '多模态成像', desc: '支持可见光、红外、3D点云多种数据采集' },
      { title: '工业级防护', desc: 'IP67 防护等级，适应油污粉尘环境' },
      { title: '高帧率传输', desc: '万兆网口/CoaXPress 接口，低延迟传输' },
      { title: '软件生态', desc: 'SDK深度适配 Halcon, OpenCV 及自家AI平台' }
    ],
    techSpecs: [
      { label: '3D精度', value: 'Z轴重复精度达 0.5μm' },
      { label: '扫描速度', value: '全画幅点云生成 < 0.3s' },
      { label: '2D分辨率', value: '5MP - 150MP 可选' },
      { label: '接口', value: 'GigE / USB3.0 / CameraLink' },
      { label: '工作距离', value: '100mm - 2000mm 可调' },
      { label: '激光等级', value: 'Class 2M 安全激光' }
    ],
    useCases: [
      '机器人3D无序抓取 (Bin Picking)',
      'PCB 电路板元器件高度检测',
      '物流包裹体积测量',
      '高反光金属件表面缺陷成像'
    ],
    caseStudy: {
        title: "物流中心的自动化体积测量",
        desc: "通过部署锐新视 3D 工业相机，某大型物流分拣中心实现了包裹体积的毫秒级测量，自动计算运费并优化装车方案。",
        metrics: ["测量效率 +400%", "空间利用率 +15%", "人工干预 0"]
    }
  },
  reporting: {
    id: 'reporting',
    title: 'AI 智能报表生成器',
    subtitle: '让数据开口说话，自动化生产洞察',
    description: '基于大语言模型（LLM）与自然语言处理（NLP）技术，AI 智能报表系统能够自动连接企业的 ERP、MES、WMS 等数据源。',
    fullDescription: `
      在数字化转型的过程中，企业积累了海量数据，但往往面临“数据孤岛”和“分析门槛高”的痛点。业务人员需要依赖 IT 部门提取数据，管理层无法实时获取决策依据。
      
      锐新视 AI 智能报表打破了这一僵局。它利用生成式 AI 技术，允许用户使用自然语言与数据对话。无论是生成复杂的透视表，还是分析生产异常的根因，只需一句话，系统即可自动编写 SQL、查询数据库并生成可视化的交互式报表，让数据分析像聊天一样简单。
    `,
    benefits: [
      { title: "零门槛分析", desc: "无需学习 SQL 或 Python，人人都是数据分析师。", icon: "🗣️" },
      { title: "实时洞察", desc: "告别 T+1 报表，生产现场数据秒级直达管理驾驶舱。", icon: "⏱️" },
      { title: "智能归因", desc: "不仅仅呈现数据，AI 还能自动分析波动原因，提供行动建议。", icon: "🧠" },
      { title: "多端触达", desc: "报表自动推送到手机、邮件、钉钉/企业微信，随时随地掌握经营状况。", icon: "📱" }
    ],
    features: [
      { title: '对话式分析', desc: '“上周良率下降的主要原因是什么？” 直接提问即得答案' },
      { title: '多格式输出', desc: '一键生成 PDF, Excel, PPT 演示文稿' },
      { title: '实时监控', desc: '数据看板秒级刷新，异常情况自动预警' },
      { title: '根因分析', desc: '自动关联多维数据，辅助定位问题根源' }
    ],
    techSpecs: [
      { label: '底层模型', value: 'Gemini 3 Pro / 自研微调模型' },
      { label: '数据源支持', value: 'SQL, NoSQL, Excel, API' },
      { label: '安全性', value: '私有化部署，数据不出内网' },
      { label: '图表库', value: 'ECharts / D3.js 深度集成' },
      { label: '响应时间', value: '复杂查询 < 3s' },
      { label: '部署环境', value: 'Linux / Windows Server' }
    ],
    useCases: [
      '每日生产良率早报自动推送',
      '供应链库存周转分析月报',
      '设备OEE（综合效率）实时监控看板',
      '质量事故根因分析专项报告'
    ],
    caseStudy: {
        title: "电子厂的数字化管理变革",
        desc: "某电子代工厂引入 AI 报表后，生产主管每天早会不再需要花费1小时整理 Excel，AI 自动生成的良率分析报告帮助他们快速定位了两处工艺瓶颈。",
        metrics: ["报表工时 -90%", "问题响应速度 +50%", "良率提升 2%"]
    }
  },
  agents: {
    id: 'agents',
    title: '数字员工智能体市场',
    subtitle: '按需雇佣 AI 专家，构建您的超级团队',
    description: '锐新视打造的国内首个工业垂直领域 Agent 市场，汇聚了经过严格验证的数百个数字员工。',
    fullDescription: `
      未来的企业组织形式将是“人类员工 + 数字员工”的混合体。数字员工（AI Agent）不仅仅是自动化脚本，它们具备感知、记忆、规划和行动的能力，能够独立完成复杂的业务流程。
      
      锐新视数字员工市场提供了丰富的预训练 Agent 角色。企业可以像在人才市场招聘一样，浏览 Agent 的技能、评价和薪资（算力消耗），一键“入职”到企业的业务系统中。它们不知疲倦、永不离职，是企业降本增效的最佳伙伴。
    `,
    benefits: [
      { title: "7x24小时待命", desc: "数字员工不需要休息，随时响应业务需求，处理突发状况。", icon: "🌙" },
      { title: "弹性扩容", desc: "业务高峰期一键增加数字员工数量，低谷期释放资源，成本最优。", icon: "📈" },
      { title: "经验沉淀", desc: "优秀员工的经验被固化为 Agent 的知识库，避免因人员流动导致的能力流失。", icon: "📚" },
      { title: "合规安全", desc: "所有操作留痕可追溯，严格遵循设定的业务规则，降低人为违规风险。", icon: "🔒" }
    ],
    features: [
      { title: '角色丰富', desc: '覆盖采购、物流、财务、生产、营销等全链条' },
      { title: '优胜劣汰', desc: '基于真实用户评价的排名机制，保证 Agent 质量' },
      { title: '无缝协作', desc: 'Agent 之间可互相调用，组建自动化工作流' },
      { title: '持续进化', desc: 'Agent 会根据反馈数据不断自我学习优化' }
    ],
    techSpecs: [
      { label: '平台架构', value: 'Multi-Agent System (MAS)' },
      { label: '交互方式', value: 'API / 聊天窗口 / ERP插件' },
      { label: '计费模式', value: '按调用次数 / 包年包月 / 效果付费' },
      { label: '安全性', value: 'RBAC 权限控制，操作留痕' },
      { label: '开发框架', value: 'LangChain / AutoGPT 深度优化' },
      { label: '支持语言', value: '中文 / 英文 / 日文' }
    ],
    useCases: [
      '报关助手：自动识别单据对接单一窗口',
      '排产优化员：基于订单与产能智能排程',
      '采购比价：全网抓取数据推荐最优供应商',
      '合同审核：法务助手自动审查风险条款'
    ],
    caseStudy: {
        title: "外贸企业的自动化通关之路",
        desc: "一家进出口贸易公司雇佣了‘报关助手’数字员工，自动处理每月的上千份报关单据。识别、填单、申报全流程自动化，仅需人工复核异常件。",
        metrics: ["单据处理效率 +500%", "人工成本 -60%", "申报零差错"]
    }
  }
};

const DEFECT_STYLES: Record<string, { color: string, bg: string, border: string, icon: string }> = {
  "Rust": { color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-500/50', icon: '🟤' },
  "Crack": { color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-500/50', icon: '⚡' },
  "Deformation": { color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-500/50', icon: '〰️' },
  "Scratch": { color: 'text-cyan-200', bg: 'bg-cyan-900/30', border: 'border-cyan-500/50', icon: '🔪' },
  "Dent": { color: 'text-gray-300', bg: 'bg-gray-700/50', border: 'border-gray-500/50', icon: '🔨' },
  "Discoloration": { color: 'text-yellow-300', bg: 'bg-yellow-900/30', border: 'border-yellow-500/50', icon: '🎨' },
  "Other": { color: 'text-blue-300', bg: 'bg-blue-900/30', border: 'border-blue-500/50', icon: '❓' }
};

// --- Helpers ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      }
    };
    reader.onerror = error => reject(error);
  });
};

const SimpleBarChart = ({ data, onSelect, selectedIndex }: any) => {
  if (!data || data.length === 0) return null;
  const maxValue = Math.max(...data.map((d: any) => d.value));
  return (
    <div className="flex items-end gap-2 md:gap-4 h-64 w-full bg-slate-800/30 p-6 rounded-xl border border-slate-700 relative mt-4 overflow-hidden">
      {/* Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-20 z-0">
         <div className="border-t border-slate-400 w-full h-0"></div>
         <div className="border-t border-slate-400 w-full h-0"></div>
         <div className="border-t border-slate-400 w-full h-0"></div>
         <div className="border-t border-slate-400 w-full h-0"></div>
         <div className="border-t border-slate-400 w-full h-0"></div>
      </div>
      
      {data.map((item: any, idx: number) => {
        const heightPercent = (item.value / maxValue) * 100;
        const isSelected = selectedIndex === idx;
        return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer z-10 h-full justify-end" onClick={() => onSelect(item, idx)}>
               <div className="relative w-full flex justify-center items-end h-full">
                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ease-out relative group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] ${isSelected ? 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] scale-y-105' : 'bg-slate-700 hover:bg-cyan-600'}`}
                    style={{ height: `${heightPercent}%` }}
                  >
                     {/* Gloss effect on bar */}
                     <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30"></div>
                  </div>
                  
                  {/* Tooltip Value */}
                  <div className={`absolute -top-8 transition-all duration-300 transform ${isSelected ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}>
                      <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-800 border border-slate-600 shadow-xl ${isSelected ? 'text-cyan-400 border-cyan-500' : 'text-slate-300'}`}>
                          {item.value}
                      </span>
                  </div>
               </div>
               
               {/* Label */}
               <span className={`text-[10px] md:text-xs text-center truncate w-full px-1 transition-colors ${isSelected ? 'text-cyan-400 font-bold' : 'text-slate-400 group-hover:text-white'}`}>
                   {item.label}
               </span>
               
               {/* Selection Indicator */}
               {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>}
            </div>
        );
      })}
    </div>
  );
};

const INITIAL_AGENTS = [
  {
    id: 'customs',
    name: '报关助手',
    icon: '🚢',
    role: '物流与贸易',
    description: '自动处理报关单据，智能识别报关信息，对接单一窗口，降低报关错误率。',
    baseRating: 4.8,
    reviews: [
      { id: 1, user: '王经理', rating: 5, comment: '大大提高了报关效率，错误率几乎为零！', date: '2025-12-10' },
      { id: 2, user: '李专员', rating: 4, comment: '识别准确，但在复杂单据处理上还有提升空间。', date: '2026-01-05' }
    ]
  },
  {
    id: 'production',
    name: '排产优化员',
    icon: '🏭',
    role: '生产制造',
    description: '基于实时订单与设备状态智能排产，最大化生产线利用率，减少停机时间。',
    baseRating: 4.5,
    reviews: [
      { id: 1, user: '张厂长', rating: 5, comment: '排产计划非常合理，插单响应速度快。', date: '2025-11-20' }
    ]
  },
  {
    id: 'procurement',
    name: '采购数字员工',
    icon: '🛒',
    role: '供应链',
    description: '智能分析历史采购数据，预测需求，推荐最优供应商组合，降低采购成本。',
    baseRating: 4.2,
    reviews: []
  },
  {
    id: 'marketing',
    name: '营销专家',
    icon: '📈',
    role: '市场营销',
    description: '分析市场趋势，自动生成社媒营销文案与活动策划草案，提升品牌影响力。',
    baseRating: 4.6,
    reviews: [
       { id: 1, user: '赵总监', rating: 5, comment: '文案很有创意，省去了大量头脑风暴时间。', date: '2026-01-15' }
    ]
  },
  {
    id: 'finance',
    name: '财务会计',
    icon: '💰',
    role: '财务管理',
    description: '自动化发票验真、费用报销审核及税务申报准备，减轻财务人员负担。',
    baseRating: 4.9,
    reviews: []
  },
  {
    id: 'qa',
    name: '质检专家',
    icon: '🔬',
    role: '质量控制',
    description: '配合视觉设备进行缺陷分类统计与质量根因分析，提升产品良率。',
    baseRating: 4.7,
    reviews: [
        { id: 1, user: '刘工', rating: 5, comment: '配合在线质检系统使用，效果拔群。', date: '2026-01-10' }
    ]
  }
];

const SUCCESS_STORIES = [
  {
    client: "某知名新能源汽车零部件厂商",
    industry: "汽车制造",
    product: "图像在线质检",
    challenge: "传统人工质检漏检率高，效率低，无法满足产能扩充需求。",
    solution: "部署锐新视AI在线质检系统，通过DINOv2深度学习模型进行全自动表面缺陷检测。",
    result: "质检效率提升300%，漏检率降至0.1%以下，年节省人力成本200万。",
    quote: "锐新视的AI技术真正帮我们实现了产线的智能化升级，不仅降本增效，更提升了客户对我们品质的信任。"
  },
  {
    client: "大型跨境物流企业",
    industry: "物流贸易",
    product: "数字员工-报关助手",
    challenge: "每日报关单据量巨大，人工录入出错率高，通关速度受限。",
    solution: "引入智能报关助手Agent，自动识别单据并对接单一窗口。",
    result: "单据处理时间从20分钟缩短至3分钟，通关效率提升50%。",
    quote: "不仅准确率高，而且7x24小时工作，极大缓解了业务高峰期的压力，是我们的得力助手。"
  },
  {
    client: "精密电子元器件制造商",
    industry: "电子制造",
    product: "AI做报表/报告 + 2D/3D相机",
    challenge: "生产数据分散，良率分析滞后，导致工艺改进困难。",
    solution: "集成高精度3D相机采集数据，配合AI自动生成每日良率分析报告。",
    result: "工艺问题发现周期从3天缩短至实时，良品率提升5个百分点。",
    quote: "数据可视化的能力让我们对生产状况了如指掌，决策更加科学和敏捷。"
  }
];

// --- Icons & Graphics ---

// New Modern Hexagonal Eye Logo
const Logo = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Outer Hexagon Frame */}
    <path d="M50 5 L93 28 V72 L50 95 L7 72 V28 Z" stroke="url(#logoGradient)" strokeWidth="3" fill="none" opacity="0.6"/>
    
    {/* Tech Nodes on Corners */}
    <circle cx="50" cy="5" r="2" fill="#fff" />
    <circle cx="93" cy="28" r="2" fill="#fff" />
    <circle cx="93" cy="72" r="2" fill="#fff" />
    <circle cx="50" cy="95" r="2" fill="#fff" />
    <circle cx="7" cy="72" r="2" fill="#fff" />
    <circle cx="7" cy="28" r="2" fill="#fff" />

    {/* Inner Iris / Aperture */}
    <path d="M50 25 C65 25 80 35 85 50 C80 65 65 75 50 75 C35 75 20 65 15 50 C20 35 35 25 50 25 Z" stroke="white" strokeWidth="2" fill="url(#logoGradient)" opacity="0.2"/>
    <circle cx="50" cy="50" r="10" fill="#38bdf8" filter="url(#glow)" />
    
    {/* Scan Line effect */}
    <path d="M20 50 H80" stroke="white" strokeWidth="1" strokeOpacity="0.5">
        <animate attributeName="d" values="M20 30 H80; M20 70 H80; M20 30 H80" dur="3s" repeatCount="indefinite" />
    </path>
  </svg>
);

// --- Product Textures ---

// Inspection Texture: Laser Scan Grid
const InspectionTexture = () => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
            <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.1)"/>
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0)"/>
            </linearGradient>
            <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34, 211, 238, 0.1)" strokeWidth="0.5"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#smallGrid)" />
        <rect width="100%" height="100%" fill="url(#grid-fade)" />
        {/* Scanning Line */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#22d3ee" strokeWidth="2" className="animate-pulse">
            <animate attributeName="y1" values="10%; 90%; 10%" dur="4s" repeatCount="indefinite" />
            <animate attributeName="y2" values="10%; 90%; 10%" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2; 1; 0.2" dur="4s" repeatCount="indefinite" />
        </line>
        {/* Defect Highlight Circles */}
        <circle cx="70%" cy="30%" r="5" stroke="#f87171" strokeWidth="1" fill="none" opacity="0">
             <animate attributeName="r" values="5; 15" dur="1s" begin="1s" repeatCount="indefinite" />
             <animate attributeName="opacity" values="1; 0" dur="1s" begin="1s" repeatCount="indefinite" />
        </circle>
    </svg>
);

// Agent Texture: Network Nodes
const AgentTexture = () => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
             <filter id="glow-agent">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g stroke="rgba(167, 139, 250, 0.3)" strokeWidth="1">
            <line x1="20%" y1="20%" x2="50%" y2="50%" />
            <line x1="80%" y1="30%" x2="50%" y2="50%" />
            <line x1="30%" y1="80%" x2="50%" y2="50%" />
            <line x1="70%" y1="70%" x2="50%" y2="50%" />
        </g>
        <circle cx="50%" cy="50%" r="6" fill="#8b5cf6" filter="url(#glow-agent)" />
        <circle cx="20%" cy="20%" r="4" fill="#a78bfa" opacity="0.6" />
        <circle cx="80%" cy="30%" r="4" fill="#a78bfa" opacity="0.6" />
        <circle cx="30%" cy="80%" r="4" fill="#a78bfa" opacity="0.6" />
        <circle cx="70%" cy="70%" r="4" fill="#a78bfa" opacity="0.6" />
        {/* Floating particles */}
        <circle cx="40%" cy="40%" r="1" fill="#fff" opacity="0.5">
            <animate attributeName="cy" values="40%; 35%; 40%" dur="3s" repeatCount="indefinite" />
        </circle>
    </svg>
);

// Camera Texture: Detailed Industrial 3D Camera Illustration
const CameraTexture = () => (
    <svg width="100%" height="100%" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
            <linearGradient id="camBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="beamGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.4)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
            </linearGradient>
            <filter id="glow-cam">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Background Grid */}
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
             <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <g transform="translate(50, 40) scale(0.9)">
             {/* Mounting Bracket */}
             <path d="M130 10 H230 L220 40 H140 Z" fill="#475569" />
             <rect x="175" y="0" width="10" height="20" fill="#64748b" />

             {/* Main Body Housing (Wide Industrial Style) */}
             <path d="M40 50 L20 70 V160 L40 180 H320 L340 160 V70 L320 50 H40 Z" fill="url(#camBodyGrad)" stroke="#475569" strokeWidth="2" />
             
             {/* Front Face Panel */}
             <rect x="50" y="70" width="260" height="90" rx="4" fill="#020617" stroke="#1e293b" strokeWidth="1" />

             {/* Left Camera Lens (Receiver) */}
             <g transform="translate(90, 115)">
                <circle r="30" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                <circle r="20" fill="url(#lensGrad)" />
                <circle r="8" fill="#000" opacity="0.8" />
                <circle r="3" cx="-5" cy="-5" fill="rgba(255,255,255,0.2)" />
             </g>

             {/* Right Camera Lens (Receiver) */}
             <g transform="translate(270, 115)">
                <circle r="30" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                <circle r="20" fill="url(#lensGrad)" />
                <circle r="8" fill="#000" opacity="0.8" />
                <circle r="3" cx="-5" cy="-5" fill="rgba(255,255,255,0.2)" />
             </g>

             {/* Center Projector (Structured Light Source) */}
             <g transform="translate(180, 115)">
                <rect x="-35" y="-35" width="70" height="70" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <circle r="22" fill="#000" stroke="#334155" strokeWidth="1" />
                <circle r="12" fill="#22d3ee" filter="url(#glow-cam)" opacity="0.9">
                     <animate attributeName="opacity" values="0.8; 1; 0.8" dur="3s" repeatCount="indefinite" />
                </circle>
             </g>

             {/* Branding Label */}
             <rect x="150" y="165" width="60" height="8" rx="2" fill="#334155" />
             <text x="180" y="172" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="sans-serif" fontWeight="bold" letterSpacing="1">3D SENSOR</text>

             {/* Cooling Fins (Top) */}
             <path d="M50 50 V45 H310 V50" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5 5" />
             
             {/* Projection Beams (Structured Light Effect) */}
             <g opacity="0.4" style={{ mixBlendMode: 'screen' }}>
                 <path d="M180 115 L60 350 H300 Z" fill="url(#beamGrad)" />
                 {/* Grid Lines in Beam */}
                 <line x1="180" y1="115" x2="60" y2="350" stroke="rgba(34,211,238,0.5)" strokeWidth="0.5" />
                 <line x1="180" y1="115" x2="300" y2="350" stroke="rgba(34,211,238,0.5)" strokeWidth="0.5" />
                 <line x1="180" y1="115" x2="180" y2="350" stroke="rgba(34,211,238,0.5)" strokeWidth="0.5" />
                 <line x1="120" y1="230" x2="240" y2="230" stroke="rgba(34,211,238,0.3)" strokeWidth="0.5" />
                 <line x1="90" y1="290" x2="270" y2="290" stroke="rgba(34,211,238,0.3)" strokeWidth="0.5" />
             </g>
        </g>
    </svg>
);

// Reporting Texture: Data Bars
const ReportingTexture = () => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <g transform="translate(0, 10)">
            <rect x="20%" y="60%" width="10%" height="40%" fill="rgba(34, 211, 238, 0.3)" />
            <rect x="35%" y="40%" width="10%" height="60%" fill="rgba(59, 130, 246, 0.4)" />
            <rect x="50%" y="20%" width="10%" height="80%" fill="rgba(139, 92, 246, 0.5)" />
            <rect x="65%" y="50%" width="10%" height="50%" fill="rgba(34, 211, 238, 0.3)" />
        </g>
        <polyline points="10%,70% 30%,50% 50%,30% 70%,40% 90%,20%" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50%" cy="30%" r="2" fill="#fff" />
        <circle cx="90%" cy="20%" r="2" fill="#fff" />
    </svg>
);


// --- Components ---

const Navigation = ({ activeSection, scrollTo, onBack, isProductPage }: { activeSection: string, scrollTo: (id: string) => void, onBack?: () => void, isProductPage?: boolean }) => {
  const links = [
    { id: 'overview', label: '概述' },
    { id: 'products', label: '产品' },
    { id: 'success', label: '案例' }, // Added
    { id: 'experience', label: '体验中心' }, 
    { id: 'tech', label: '技术' },
    { id: 'market', label: '市场' },
    { id: 'team', label: '团队' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass px-6 py-4 flex justify-between items-center shadow-lg shadow-cyan-900/10 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onBack ? onBack() : scrollTo('hero')}>
        <Logo className="w-10 h-10 group-hover:rotate-180 transition-transform duration-700 ease-in-out" />
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-wide text-white leading-none">锐新视科技</span>
          <span className="text-cyan-400 text-[10px] font-normal tracking-wider uppercase">Ruixin Vision</span>
        </div>
      </div>
      
      {!isProductPage ? (
        <div className="hidden md:flex gap-8">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`text-sm font-medium transition-all duration-300 relative py-1 ${activeSection === link.id ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              {link.label}
              {activeSection === link.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-full"></span>
              )}
            </button>
          ))}
        </div>
      ) : (
          <div className="flex-1 flex justify-end md:justify-center">
            <button onClick={onBack} className="text-white flex items-center gap-2 hover:text-cyan-400 transition-colors group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> 返回首页
            </button>
          </div>
      )}

      <button onClick={() => scrollTo('contact')} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">
        联系我们
      </button>
    </nav>
  );
};

const ProductDetail = ({ detail }: { detail: any }) => {
  if (!detail) return null;

  // Use the new texture components for backgrounds
  const getTexture = (id: string) => {
      switch(id) {
          case 'inspection': return <InspectionTexture />;
          case 'camera': return <CameraTexture />;
          case 'reporting': return <ReportingTexture />;
          case 'agents': return <AgentTexture />;
          default: return null;
      }
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-900 animate-fade-in-up">
       {/* Hero Section */}
       <div className="relative h-[400px] w-full bg-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10"></div>
          {/* Animated Background Texture */}
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-30 mask-image-gradient">
              {getTexture(detail.id)}
          </div>
          
          <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
             <div className="inline-block px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-bold w-fit mb-4">
                 PRODUCT SERIES
             </div>
             <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">{detail.title}</h1>
             <p className="text-xl md:text-2xl text-cyan-400/80 font-light">{detail.subtitle}</p>
          </div>
       </div>

       {/* Main Content Layout */}
       <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Introduction & Overview */}
          <div className="grid md:grid-cols-3 gap-12 mb-20">
             <div className="md:col-span-2 space-y-8">
                 <h2 className="text-2xl font-bold text-white flex items-center gap-2 border-l-4 border-cyan-500 pl-4">
                     产品简介
                 </h2>
                 <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-line text-justify">
                     {detail.fullDescription}
                 </p>
                 
                 {/* Inspection Specific Placeholder */}
                 {detail.id === 'inspection' && (
                     <div className="mt-8 bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-inner relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 z-10">
                            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30 animate-pulse">Live Simulation</span>
                         </div>
                         <div className="flex flex-col items-center justify-center min-h-[300px] gap-6">
                             <div className="w-64 h-64 bg-slate-900 rounded-lg relative overflow-hidden border border-slate-700 flex items-center justify-center">
                                 {/* Scanning Effect */}
                                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent h-2 animate-scan w-full"></div>
                                 <span className="text-6xl grayscale opacity-20">⚙️</span>
                                 {/* Defect Markers */}
                                 <div className="absolute top-1/4 left-1/3 w-4 h-4 border-2 border-red-500 rounded-full animate-ping opacity-75"></div>
                                 <div className="absolute bottom-1/3 right-1/4 w-3 h-3 border-2 border-yellow-500 rounded-full animate-ping delay-700 opacity-75"></div>
                             </div>
                             <div className="text-center">
                                 <h4 className="text-white font-bold mb-1">实时缺陷捕捉演示</h4>
                                 <p className="text-slate-400 text-sm">AI 系统正在以 50ms/帧 的速度扫描工件表面</p>
                             </div>
                         </div>
                     </div>
                 )}
             </div>

             {/* Sidebar: Technical Specs */}
             <div className="md:col-span-1">
                  <div className="bg-slate-800/40 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm sticky top-24">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <span>🛠️</span> 技术规格
                      </h3>
                      <div className="space-y-4">
                          {detail.techSpecs.map((spec: any, idx: number) => (
                              <div key={idx} className="flex flex-col border-b border-slate-700/50 pb-3 last:border-0 last:pb-0">
                                  <span className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">{spec.label}</span>
                                  <span className="text-slate-200 font-mono text-sm">{spec.value}</span>
                              </div>
                          ))}
                      </div>
                      <div className="mt-8 space-y-3">
                        <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20">
                            获取详细参数表
                        </button>
                      </div>
                  </div>
             </div>
          </div>

          {/* Key Benefits Grid */}
          <div className="mb-20">
             <h2 className="text-3xl font-bold text-white mb-10 text-center">核心价值与优势</h2>
             <div className="grid md:grid-cols-4 gap-6">
                 {detail.benefits && detail.benefits.map((benefit: any, idx: number) => (
                     <div key={idx} className="bg-slate-800/20 p-6 rounded-2xl border border-slate-700 hover:bg-slate-800/50 transition-all hover:-translate-y-1">
                         <div className="text-4xl mb-4">{benefit.icon}</div>
                         <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                         <p className="text-slate-400 text-sm leading-relaxed">{benefit.desc}</p>
                     </div>
                 ))}
             </div>
          </div>

          {/* Features List */}
           <div className="mb-20">
              <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-purple-500 pl-4">功能特性</h2>
              <div className="grid md:grid-cols-2 gap-6">
                  {detail.features.map((feature: any, idx: number) => (
                      <div key={idx} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center shrink-0 mt-1">✓</div>
                          <div>
                              <h3 className="font-bold text-slate-200 mb-1">{feature.title}</h3>
                              <p className="text-slate-400 text-sm">{feature.desc}</p>
                          </div>
                      </div>
                  ))}
              </div>
           </div>

          {/* Use Cases Scenarios */}
          <div className="mb-20">
              <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-blue-500 pl-4">应用场景</h2>
              <div className="grid md:grid-cols-4 gap-4">
                  {detail.useCases.map((useCase: string, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 text-sm font-medium hover:border-blue-500/50 hover:text-white transition-colors flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {useCase}
                      </div>
                  ))}
              </div>
          </div>

          {/* Case Study Highlight */}
          {detail.caseStudy && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 border border-slate-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  
                  <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                      <div>
                          <div className="inline-block px-3 py-1 rounded bg-emerald-900/30 text-emerald-400 text-xs font-bold mb-4 border border-emerald-500/20">
                             客户成功案例
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4">{detail.caseStudy.title}</h3>
                          <p className="text-slate-400 mb-6 leading-relaxed">
                              {detail.caseStudy.desc}
                          </p>
                          <button className="text-cyan-400 font-bold hover:text-white transition-colors flex items-center gap-2">
                              阅读完整案例报告 →
                          </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                          {detail.caseStudy.metrics.map((metric: string, idx: number) => (
                              <div key={idx} className="bg-slate-950/50 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xl">
                                      {idx + 1}
                                  </div>
                                  <span className="text-white font-bold">{metric}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}
       </div>
    </div>
  );
};

const Hero = () => (
  <section id="hero" className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-slate-950 pt-20">
    {/* Dynamic Background */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-950 to-slate-950 pointer-events-none"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
    
    {/* Grid Overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

    <div className="z-10 text-center max-w-5xl px-4 animate-fade-in-up flex flex-col items-center">
      <div className="relative group cursor-default">
         <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
         <div className="w-24 h-24 mb-10 p-1 rounded-full bg-slate-900 relative flex items-center justify-center border border-slate-700 shadow-2xl">
             <Logo className="w-16 h-16 animate-pulse-slow" />
         </div>
      </div>

      <div className="mb-8 inline-flex items-center gap-3 px-6 py-2 rounded-full border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 text-sm font-medium backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.1)]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        {COMPANY_INFO.date} • 商业路演发布
      </div>
      
      <h1 className="text-6xl md:text-8xl font-bold mb-8 text-white leading-tight tracking-tight">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400">AI 视觉</span><br />
        <span className="text-slate-100">重塑工业未来</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
        {COMPANY_INFO.tagline}
      </p>
      
      <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
        <a href="#experience" className="group relative bg-white text-slate-900 px-10 py-4 rounded-full font-bold hover:bg-cyan-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 text-lg">
          <span className="relative z-10">体验 AI 引擎</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
        <a href="#products" className="group px-10 py-4 rounded-full font-bold text-white border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition-all backdrop-blur-sm flex items-center justify-center gap-3 text-lg">
          <span>探索产品矩阵</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">↓</span>
        </a>
      </div>
    </div>
    
    {/* Background Glows */}
    <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
    <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
  </section>
);

const Section = ({ id, title, subtitle, children, className = "" }: { id: string, title: string, subtitle?: string, children?: React.ReactNode, className?: string }) => (
  <section id={id} className={`py-32 px-4 md:px-10 max-w-7xl mx-auto relative ${className}`}>
    <div className="mb-24 text-center relative z-10">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight relative inline-block">
        {title}
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-cyan-500 rounded-full"></span>
      </h2>
      {subtitle && <p className="text-slate-400 max-w-2xl mx-auto text-lg mt-8">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const Card = ({ title, icon, children, highlight = false, visual, onClick }: any) => (
  <div onClick={onClick} className={`relative rounded-3xl overflow-hidden flex flex-col h-full cursor-pointer transition-all duration-500 group border ${highlight ? 'border-cyan-500/30 bg-slate-800/40 shadow-[0_0_40px_rgba(34,211,238,0.05)]' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800'}`}>
    
    {/* Visual Image Area with Tech Texture */}
    {visual && (
      <div className="w-full h-56 relative overflow-hidden bg-slate-900 border-b border-slate-800 group-hover:border-cyan-500/20 transition-colors">
        {/* Render the abstract tech texture */}
        <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700">
             {visual}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

        {/* Floating Tag */}
        <div className="absolute top-4 right-4 bg-slate-950/50 backdrop-blur-md border border-slate-700 px-3 py-1 rounded-full text-xs text-slate-300">
             详情 →
        </div>
      </div>
    )}

    <div className="relative z-10 p-8 flex-1 flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner border border-white/5 ${highlight ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white' : 'bg-slate-800 text-slate-300'}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{title}</h3>
      </div>
      <div className="text-slate-400 leading-relaxed text-sm flex-1">
        {children}
      </div>
    </div>
  </div>
);

// ... (Rest of components: AgentMarketModal, StarRating, etc. stay largely same logic, visually tweaked inside Section) ...

// --- Implemented Missing Components with Refined UI ---

const Overview = () => (
  <Section id="overview" title="公司概况" subtitle="苏州锐新视科技有限公司">
    <div className="grid md:grid-cols-2 gap-16 items-center">
      <div className="space-y-8 text-slate-300 leading-relaxed">
        <div className="p-6 rounded-2xl bg-slate-800/30 border-l-4 border-cyan-500">
          <strong className="text-white text-lg block mb-2">我们的使命</strong>
          通过人工智能技术赋能制造业，提升生产效率，降低成本，推动行业数字化转型。
        </div>
        <div className="p-6 rounded-2xl bg-slate-800/30 border-l-4 border-blue-500">
          <strong className="text-white text-lg block mb-2">我们的愿景</strong>
          成为智能制造领域领先的AI视觉与数据解决方案提供商。
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">97%+</div>
            <div className="text-sm text-slate-400 font-medium">检测精度</div>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">4.5s</div>
            <div className="text-sm text-slate-400 font-medium">单张处理速度</div>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center">
             <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">6+</div>
             <div className="text-sm text-slate-400 font-medium">发明专利</div>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-center">
             <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-2">2026</div>
             <div className="text-sm text-slate-400 font-medium">成立时间</div>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-3xl blur-3xl transform rotate-3"></div>
        <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-10 shadow-2xl">
           <h3 className="text-2xl font-bold text-white mb-8 border-b border-slate-800 pb-4">核心价值主张</h3>
           <ul className="space-y-6">
             {[
               "AI 深度学习算法替代传统机器视觉",
               "SaaS化数字员工降低运营成本",
               "软硬件一体化解决方案",
               "实时数据分析辅助科学决策"
             ].map((item, i) => (
               <li key={i} className="flex items-center gap-4 group">
                 <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm group-hover:bg-cyan-500 group-hover:text-white transition-colors">✓</div>
                 <span className="text-slate-300 group-hover:text-white transition-colors font-medium">{item}</span>
               </li>
             ))}
           </ul>
        </div>
      </div>
    </div>
  </Section>
);

const Products = ({ onViewProduct }: { onViewProduct: (id: string) => void }) => {
  return (
    <Section id="products" title="核心产品矩阵" subtitle="全栈式智能制造解决方案">
      <div className="grid md:grid-cols-2 gap-8">
        <Card 
            title="图像在线质检" 
            icon="👁️" 
            highlight 
            visual={<InspectionTexture />}
            onClick={() => onViewProduct('inspection')}
        >
          <p>基于AI (DINOv2) 的在线图像质量检测系统。</p>
          <ul className="mt-4 space-y-2 text-slate-400 text-sm">
            <li>• 检测精度 &gt; 97%</li>
            <li>• 单张处理时间 4.5秒</li>
            <li>• 适用：汽车零部件、电子电器外观检测</li>
          </ul>
        </Card>
        
        <Card 
            title="数字员工智能体市场" 
            icon="🤖" 
            highlight 
            visual={<AgentTexture />}
            onClick={() => onViewProduct('agents')}
        >
            <p>汇集各类专业领域的AI Agent，按需雇佣，降本增效。</p>
            <ul className="mt-4 space-y-2 text-slate-400 text-sm">
            <li>• 报关助手：自动处理单据</li>
            <li>• 排产优化员：智能生产排程</li>
            <li>• 采购/营销/财务等多角色支持</li>
            </ul>
        </Card>

        <Card 
            title="2D/3D 工业相机" 
            icon="📷" 
            visual={<CameraTexture />}
            onClick={() => onViewProduct('camera')}
        >
          <p>覆盖高中低端全系列工业相机产品。</p>
           <ul className="mt-4 space-y-2 text-slate-400 text-sm">
            <li>• 与自研AI算法深度集成</li>
            <li>• 高精度结构光/线激光3D相机</li>
            <li>• 灵活适配各类工业场景</li>
          </ul>
        </Card>

        <Card 
            title="AI 智能报表" 
            icon="📊" 
            visual={<ReportingTexture />}
            onClick={() => onViewProduct('reporting')}
        >
          <p>基于NLP技术的自动化报表生成系统。</p>
           <ul className="mt-4 space-y-2 text-slate-400 text-sm">
            <li>• 自动生成日报、周报、分析报告</li>
            <li>• 自然语言交互查询数据</li>
            <li>• 实时监控生产经营指标</li>
          </ul>
        </Card>
      </div>
    </Section>
  );
};

const CustomerSuccess = () => (
  <Section id="success" title="客户成功案例" subtitle="我们也为他们创造了价值" className="bg-slate-900/30">
    <div className="grid md:grid-cols-3 gap-8">
      {SUCCESS_STORIES.map((story, idx) => (
        <div key={idx} className="bg-slate-800/20 border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/40 transition-all hover:-translate-y-1">
          <div className="inline-block px-3 py-1 rounded bg-cyan-900/30 text-cyan-400 text-xs font-bold mb-4 border border-cyan-500/20">
             {story.industry}
          </div>
          <h3 className="text-xl font-bold text-white mb-4 min-h-[3.5rem]">{story.client}</h3>
          <div className="space-y-4 mb-8">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">挑战</span>
              <p className="text-sm text-slate-300 mt-1">{story.challenge}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">成果</span>
              <p className="text-sm text-emerald-400 font-medium mt-1">{story.result}</p>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-700/50 relative">
             <span className="absolute top-4 left-0 text-4xl text-slate-700 font-serif opacity-30">"</span>
            <p className="text-sm text-slate-400 italic pl-4">
               {story.quote}
            </p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

const AIExperienceCenter = () => {
  const [activeTab, setActiveTab] = useState<'visual' | 'report'>('visual');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [reportPrompt, setReportPrompt] = useState("");
  const [reportResult, setReportResult] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [selectedChartIndex, setSelectedChartIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Gemini API setup for visual inspection
  const analyzeImage = async () => {
    if (!inputImage) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Use gemini-3-flash-preview for structured output
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: inputImage } },
            { text: "Analyze this industrial image for quality control. Detect and categorize defects into one of the following types: Rust, Crack, Deformation, Scratch, Dent, Discoloration, or Other. Return a JSON object with overall status (PASS/FAIL/WARNING), confidence score (0-100), and a list of defects found." }
          ]
        },
        config: {
           responseMimeType: 'application/json',
           responseSchema: {
             type: Type.OBJECT,
             properties: {
               status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARNING"] },
               confidence: { type: Type.NUMBER },
               defects: {
                 type: Type.ARRAY,
                 items: {
                   type: Type.OBJECT,
                   properties: {
                     type: { type: Type.STRING, enum: ["Rust", "Crack", "Deformation", "Scratch", "Dent", "Discoloration", "Other"] },
                     severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                     description: { type: Type.STRING },
                     location: { type: Type.STRING, description: "Approximate location of the defect" }
                   }
                 }
               }
             }
           }
        }
      });
      if (response.text) {
          setAnalysisResult(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("Analysis failed", error);
      // setAnalysisResult("Error analyzing image. Please check API Key or try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setInputImage(base64);
      setAnalysisResult(null);
    }
  };

  const generateReport = async () => {
    if (!reportPrompt) return;
    setIsGenerating(true);
    setReportResult("");
    setReportData(null);
    setSelectedChartIndex(null);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are an advanced industrial AI reporting assistant. 
            User Request: ${reportPrompt}
            
            Generate a structured report with a title, executive summary, key performance indicators (KPIs), and a dataset for a chart that visualizes the most important aspect of the request. 
            Crucially, for each data point in the chart, generate a list of "drill-down" raw data entries that would explain that data point (e.g., specific defect logs, production timestamps, or order IDs).
            
            Ensure the "drillDown" data is detailed and includes varied statuses like 'Normal', 'Warning', or 'Critical' to make the drill-down view interesting.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reportTitle: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        metrics: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    value: { type: Type.STRING },
                                    trend: { type: Type.STRING, enum: ["up", "down", "stable"] }
                                }
                            }
                        },
                        chartData: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                segments: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            label: { type: Type.STRING },
                                            value: { type: Type.NUMBER },
                                            analysis: { type: Type.STRING },
                                            drillDown: {
                                                type: Type.ARRAY,
                                                items: {
                                                    type: Type.OBJECT,
                                                    properties: {
                                                        id: { type: Type.STRING },
                                                        date: { type: Type.STRING },
                                                        status: { type: Type.STRING },
                                                        details: { type: Type.STRING }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        if (response.text) {
             setReportData(JSON.parse(response.text));
        }
    } catch (error) {
        setReportResult("Error generating report. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const selectedSegment = (reportData && selectedChartIndex !== null) ? reportData.chartData.segments[selectedChartIndex] : null;

  useEffect(() => {
    if (selectedSegment) {
        const element = document.getElementById('drill-down-panel');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
  }, [selectedSegment]);

  return (
    <Section id="experience" title="AI 体验中心" subtitle="亲身体验锐新视的核心技术">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] shadow-2xl">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-72 bg-slate-950 border-r border-slate-800 p-6 flex md:flex-col gap-4">
           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 hidden md:block">Select Tool</div>
           <button 
             onClick={() => setActiveTab('visual')}
             className={`flex-1 md:flex-none text-left px-6 py-4 rounded-xl transition-all border flex items-center gap-3 ${activeTab === 'visual' ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}
           >
             <span className="text-xl">👁️</span> 
             <div>
                <div className="font-bold">视觉质检</div>
                <div className="text-xs opacity-70 mt-1">缺陷识别 & 分类</div>
             </div>
           </button>
           <button 
             onClick={() => setActiveTab('report')}
             className={`flex-1 md:flex-none text-left px-6 py-4 rounded-xl transition-all border flex items-center gap-3 ${activeTab === 'report' ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-transparent text-slate-400 hover:bg-slate-800'}`}
           >
             <span className="text-xl">📊</span>
             <div>
                <div className="font-bold">智能报表</div>
                <div className="text-xs opacity-70 mt-1">数据分析 & 生成</div>
             </div>
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
          {activeTab === 'visual' ? (
            <div className="h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">在线图像缺陷检测 Demo</h3>
                <p className="text-slate-400">上传一张工业零件或产品图片，AI 将自动分析其质量状态。</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 flex-1">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center p-6 hover:border-cyan-500/50 transition-colors relative bg-slate-800/20 group">
                  {inputImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img src={`data:image/jpeg;base64,${inputImage}`} alt="Uploaded" className="max-h-64 object-contain rounded-lg shadow-2xl" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                            <span className="text-white text-sm">点击更换图片</span>
                        </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-700">
                         <span className="text-3xl">📷</span>
                      </div>
                      <p className="font-medium text-slate-300">点击或拖拽上传图片</p>
                      <p className="text-xs mt-2">支持 JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>

                {/* Result Area */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col min-h-[400px] shadow-inner">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                    <span className="text-slate-300 font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                        分析结果
                    </span>
                    <button 
                      onClick={analyzeImage} 
                      disabled={!inputImage || isAnalyzing}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all shadow-lg ${!inputImage || isAnalyzing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-500/20'}`}
                    >
                      {isAnalyzing ? '深度分析中...' : '开始检测'}
                    </button>
                  </div>
                  
                  {analysisResult ? (
                        <div className="flex flex-col h-full overflow-hidden animate-fade-in-up">
                            <div className="flex items-center justify-between mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
                                <div>
                                     <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Status</span>
                                     <div className={`text-3xl font-bold mt-1 ${analysisResult.status === 'PASS' ? 'text-emerald-400' : analysisResult.status === 'FAIL' ? 'text-red-400' : 'text-yellow-400'}`}>
                                         {analysisResult.status}
                                     </div>
                                </div>
                                 <div className="text-right">
                                     <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Confidence</span>
                                     <div className="text-3xl font-mono text-white mt-1">{analysisResult.confidence}%</div>
                                </div>
                            </div>

                            {/* Defect Summary Counts */}
                            {analysisResult.defects && analysisResult.defects.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-3">
                                        {Object.entries(analysisResult.defects.reduce((acc: any, curr: any) => {
                                            acc[curr.type] = (acc[curr.type] || 0) + 1;
                                            return acc;
                                        }, {})).map(([type, count]: any) => {
                                            const style = DEFECT_STYLES[type as string] || DEFECT_STYLES["Other"];
                                            return (
                                                <div key={type} className={`flex items-center gap-3 px-4 py-2 rounded-lg border bg-opacity-20 ${style.bg} ${style.border}`}>
                                                    <span className="text-xl">{style.icon}</span>
                                                    <div className="flex flex-col leading-none">
                                                        <span className={`text-xs font-bold ${style.color}`}>{type}</span>
                                                        <span className="text-[10px] text-slate-400 mt-1">{count} detected</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Detailed List */}
                             <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {analysisResult.defects && analysisResult.defects.map((defect: any, idx: number) => {
                                    const style = DEFECT_STYLES[defect.type] || DEFECT_STYLES["Other"];
                                    return (
                                        <div key={idx} className={`p-4 rounded-xl border bg-opacity-10 ${style.bg} border-slate-800 hover:border-slate-600 transition-colors`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span>{style.icon}</span>
                                                    <span className={`font-bold text-sm ${style.color}`}>{defect.type}</span>
                                                </div>
                                                <span className={`text-[10px] px-2 py-1 rounded-full border border-white/5 font-bold ${defect.severity === 'High' ? 'bg-red-500/20 text-red-400' : defect.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                                                    {defect.severity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-300">{defect.description}</p>
                                            {defect.location && <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">📍 {defect.location}</p>}
                                        </div>
                                    );
                                })}
                                {(!analysisResult.defects || analysisResult.defects.length === 0) && (
                                    <div className="text-slate-500 text-center py-12 text-sm bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                                        <span className="text-2xl block mb-2">✨</span>
                                        No defects detected.
                                    </div>
                                )}
                             </div>
                        </div>
                    ) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-600">
                          {isAnalyzing ? (
                             <div className="flex flex-col items-center gap-4">
                                 <div className="w-12 h-12 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
                                 <span className="text-sm text-cyan-400 animate-pulse font-medium">AI 正在深度分析图像特征...</span>
                             </div>
                          ) : (
                             <>
                                <div className="text-5xl mb-4 opacity-10">📊</div>
                                <span className="text-sm font-medium">等待图像上传与分析...</span>
                             </>
                          )}
                       </div>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-6">
                 <h3 className="text-2xl font-bold text-white mb-2">自然语言报表生成 Demo</h3>
                 <p className="text-slate-400">输入您的数据分析需求，AI 自动生成包含可视化图表的结构化报告。</p>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                    <textarea 
                    value={reportPrompt}
                    onChange={(e) => setReportPrompt(e.target.value)}
                    placeholder="例如：请分析上个月的产线良率数据，主要问题集中在焊接工艺，良率下降了2个点，请生成一份周报摘要..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none min-h-[120px] resize-none shadow-inner"
                    />
                    <div className="absolute bottom-4 right-4">
                        <button 
                            onClick={generateReport}
                            disabled={!reportPrompt || isGenerating}
                            className={`bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg shadow-cyan-500/20 ${(!reportPrompt || isGenerating) && 'opacity-50 cursor-not-allowed'}`}
                        >
                            {isGenerating ? '生成中...' : '生成报告'}
                        </button>
                    </div>
                </div>
              </div>

              <div className="mt-8 flex-1 bg-slate-950 rounded-2xl p-8 border border-slate-800 overflow-y-auto min-h-[400px] shadow-inner relative">
                 {reportData ? (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="border-b border-slate-800 pb-6">
                            <h2 className="text-3xl font-bold text-white mb-3">{reportData.reportTitle}</h2>
                            <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">{reportData.summary}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {reportData.metrics.map((m: any, idx: number) => (
                                <div key={idx} className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                                    <div className="text-slate-500 text-xs mb-2 uppercase tracking-wider font-bold">{m.label}</div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-bold text-white">{m.value}</span>
                                        {m.trend === 'up' && <span className="text-emerald-400 text-sm font-bold bg-emerald-900/20 px-1 rounded">↑</span>}
                                        {m.trend === 'down' && <span className="text-red-400 text-sm font-bold bg-red-900/20 px-1 rounded">↓</span>}
                                        {m.trend === 'stable' && <span className="text-slate-400 text-sm font-bold bg-slate-800 px-1 rounded">-</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {reportData.chartData && (
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-white font-bold text-lg">{reportData.chartData.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">Click bars to drill-down</span>
                                        <span className="text-xs text-cyan-400 bg-cyan-900/20 px-3 py-1 rounded-full border border-cyan-500/20 animate-pulse">
                                            Interactive
                                        </span>
                                    </div>
                                </div>
                                <SimpleBarChart 
                                    data={reportData.chartData.segments} 
                                    onSelect={(item: any, idx: number) => setSelectedChartIndex(idx)}
                                    selectedIndex={selectedChartIndex}
                                />
                            </div>
                        )}

                        {selectedSegment && (
                            <div id="drill-down-panel" className="mt-6 bg-slate-950 border border-slate-700 rounded-xl p-0 animate-fade-in-up relative overflow-hidden shadow-2xl">
                                {/* Header */}
                                <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-8 bg-cyan-500 rounded-sm"></div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{selectedSegment.label}</h4>
                                            <div className="text-xs text-slate-400 uppercase tracking-widest">Data Segment Analysis</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                         <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors" title="Download CSV">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                         </button>
                                         <button onClick={() => setSelectedChartIndex(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                         </button>
                                    </div>
                                </div>
                                
                                <div className="p-6 grid md:grid-cols-3 gap-6">
                                    {/* Analysis Box */}
                                    <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-900/50 p-5 rounded-xl border border-slate-800">
                                        <h5 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                                            <span>💡</span> AI Insight
                                        </h5>
                                        <p className="text-slate-300 text-sm leading-relaxed">{selectedSegment.analysis}</p>
                                        
                                        <div className="mt-6">
                                            <div className="text-xs text-slate-500 uppercase mb-2">Key Metric</div>
                                            <div className="text-3xl font-bold text-white">{selectedSegment.value}</div>
                                        </div>
                                    </div>

                                    {/* Data Table */}
                                    <div className="md:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
                                        <div className="bg-slate-950/50 p-3 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                                            <span>Raw Data Logs</span>
                                            <span>{selectedSegment.drillDown?.length || 0} Entries</span>
                                        </div>
                                        <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
                                            <table className="w-full text-sm text-left text-slate-400">
                                                <thead className="text-xs text-slate-500 uppercase bg-slate-950 font-bold sticky top-0 z-10">
                                                    <tr>
                                                        <th className="px-4 py-3 bg-slate-950">ID</th>
                                                        <th className="px-4 py-3 bg-slate-950">Timestamp</th>
                                                        <th className="px-4 py-3 bg-slate-950">Status</th>
                                                        <th className="px-4 py-3 bg-slate-950">Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800">
                                                    {selectedSegment.drillDown && selectedSegment.drillDown.map((row: any, rIdx: number) => (
                                                        <tr key={rIdx} className="hover:bg-cyan-900/10 transition-colors">
                                                            <td className="px-4 py-3 font-mono text-xs text-cyan-500/70">{row.id}</td>
                                                            <td className="px-4 py-3 text-xs">{row.date}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                    row.status === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                                    row.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                }`}>
                                                                    {row.status === 'Critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1 animate-pulse"></span>}
                                                                    {row.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-300 truncate max-w-[200px]" title={row.details}>{row.details}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                 ) : reportResult ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-400 gap-2">
                        <span className="text-3xl">⚠️</span>
                        {reportResult}
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        {isGenerating ? (
                             <div className="flex flex-col items-center gap-4">
                                 <div className="w-12 h-12 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
                                 <span className="text-sm text-cyan-400 animate-pulse font-medium">AI 正在生成数据报告...</span>
                             </div>
                        ) : (
                            <>
                                <div className="text-5xl mb-4 opacity-10">📄</div>
                                <span className="text-sm font-medium">报告将在此处生成...</span>
                            </>
                        )}
                    </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

const TechAndMarket = () => (
    <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 md:px-10 py-12">
        <div id="tech" className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="text-cyan-400">⚙️</span>
                核心技术壁垒
            </h2>
            <ul className="space-y-6">
                {[
                    { title: "AI 视觉算法", desc: "自研轻量化深度学习模型，边缘端部署，高精度低延迟。" },
                    { title: "多模态数据融合", desc: "结合2D/3D图像与时序数据，实现全方位工业场景感知。" },
                    { title: "自动化工作流", desc: "低代码/无代码流程编排，快速适应柔性生产需求。" },
                    { title: "知识产权", desc: "拥有6项发明专利，7项软著，构建技术护城河。" }
                ].map((item, i) => (
                    <li key={i} className="flex gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-500 font-bold shrink-0 text-xl group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-inner border border-slate-700">0{i+1}</div>
                        <div>
                            <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                            <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        <div id="market" className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
             <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="text-purple-400">🚀</span>
                千亿级市场机遇
             </h2>
             <div className="space-y-10">
                 <div>
                     <div className="flex justify-between text-sm mb-3 text-slate-300 font-bold">
                         <span>工业机器视觉市场</span>
                         <span className="text-cyan-400">CAGR 15% 📈</span>
                     </div>
                     <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 w-[75%] shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                     </div>
                     <p className="text-xs text-slate-500 mt-3 leading-relaxed">预计2028年达到数百亿规模，国产替代空间巨大。</p>
                 </div>
                 <div>
                     <div className="flex justify-between text-sm mb-3 text-slate-300 font-bold">
                         <span>数字员工/RPA市场</span>
                         <span className="text-purple-400">CAGR 30% 🚀</span>
                     </div>
                     <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-[60%] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                     </div>
                     <p className="text-xs text-slate-500 mt-3 leading-relaxed">企业数字化转型刚需，SaaS模式渗透率快速提升。</p>
                 </div>
                 
                 <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                     <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wider text-slate-500">目标客户画像</h4>
                     <div className="flex flex-wrap gap-2">
                         {["汽车零部件", "3C电子", "物流仓储", "跨境贸易"].map((tag, i) => (
                             <span key={i} className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold text-slate-300 border border-slate-700 hover:border-cyan-500/50 hover:text-white transition-colors cursor-default">{tag}</span>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    </div>
);

const BusinessModel = () => (
    <Section id="business" title="商业模式" className="pb-12">
        <div className="grid md:grid-cols-4 gap-6">
            {[
                { title: "产品销售", desc: "软硬件一体机销售 (相机+算法盒子)", icon: "📦", color: "from-blue-500 to-cyan-500" },
                { title: "SaaS 订阅", desc: "数字员工Agent按年/月订阅服务", icon: "🔄", color: "from-purple-500 to-pink-500" },
                { title: "交易佣金", desc: "智能体市场平台交易抽成", icon: "💸", color: "from-emerald-500 to-teal-500" },
                { title: "定制开发", desc: "针对头部大客户的定制化解决方案", icon: "🛠️", color: "from-orange-500 to-amber-500" }
            ].map((model, i) => (
                <div key={i} className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 text-center hover:bg-slate-800 transition-all group hover:-translate-y-2 duration-300 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${model.color}`}></div>
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">{model.icon}</div>
                    <h3 className="text-white font-bold mb-3 text-lg">{model.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{model.desc}</p>
                </div>
            ))}
        </div>
    </Section>
);

const Team = () => (
    <Section id="team" title="核心团队" subtitle="来自海克斯康、先导智能的行业专家" className="bg-slate-900/30">
        <div className="grid md:grid-cols-3 gap-10 text-center">
             <div className="p-8 rounded-3xl bg-slate-800/20 hover:bg-slate-800/40 transition-colors border border-slate-700/50">
                 <div className="w-28 h-28 mx-auto bg-gradient-to-br from-cyan-900 to-slate-900 rounded-full mb-6 overflow-hidden border-2 border-cyan-500/50 p-1">
                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-5xl">👨‍💻</div>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-1">创始人 / CEO</h3>
                 <p className="text-cyan-400 text-sm mb-4 font-medium uppercase tracking-wider">Visionary</p>
                 <p className="text-slate-400 text-sm leading-relaxed">15年机器视觉行业经验<br/>曾任职于海克斯康，主导过多项国家级智能制造项目。</p>
             </div>
             <div className="p-8 rounded-3xl bg-slate-800/20 hover:bg-slate-800/40 transition-colors border border-slate-700/50">
                 <div className="w-28 h-28 mx-auto bg-gradient-to-br from-blue-900 to-slate-900 rounded-full mb-6 overflow-hidden border-2 border-blue-500/50 p-1">
                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-5xl">👩‍🔬</div>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-1">CTO</h3>
                 <p className="text-blue-400 text-sm mb-4 font-medium uppercase tracking-wider">Architect</p>
                 <p className="text-slate-400 text-sm leading-relaxed">AI算法专家 / 博士<br/>毕业于上海交通大学，专攻深度学习与3D视觉重建。</p>
             </div>
             <div className="p-8 rounded-3xl bg-slate-800/20 hover:bg-slate-800/40 transition-colors border border-slate-700/50">
                 <div className="w-28 h-28 mx-auto bg-gradient-to-br from-purple-900 to-slate-900 rounded-full mb-6 overflow-hidden border-2 border-purple-500/50 p-1">
                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-5xl">👨‍💼</div>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-1">市场总监</h3>
                 <p className="text-purple-400 text-sm mb-4 font-medium uppercase tracking-wider">Strategist</p>
                 <p className="text-slate-400 text-sm leading-relaxed">前先导智能销售总监<br/>拥有丰富的工业大客户资源与渠道拓展经验。</p>
             </div>
        </div>
    </Section>
);

const Future = () => (
    <Section id="future" title="未来规划" subtitle="融资与发展路线图">
        <div className="relative border-l-2 border-slate-800 ml-4 md:ml-0 md:pl-0 space-y-12 md:space-y-0 md:flex md:justify-between md:border-l-0 md:border-t-2 md:pt-16 max-w-5xl mx-auto">
            {[
                { time: "2026 Q1-Q2", title: "产品打磨", desc: "完善在线质检系统，推出首批数字员工Agent。" },
                { time: "2026 Q3-Q4", title: "市场验证", desc: "落地10+标杆客户，完成天使轮融资。" },
                { time: "2027", title: "规模复制", desc: "拓展长三角市场，建立渠道体系，营收破千万。" },
                { time: "2028+", title: "行业领军", desc: "成为细分领域独角兽，启动IPO计划。" }
            ].map((plan, i) => (
                <div key={i} className="relative pl-8 md:pl-0 md:w-1/4 md:text-center group">
                    <div className="absolute -left-[9px] top-0 md:left-1/2 md:-top-[33px] md:-translate-x-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-cyan-500 group-hover:scale-150 group-hover:border-white transition-all duration-300 z-10 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                    <div className="text-cyan-400 font-bold mb-2 text-sm uppercase tracking-widest">{plan.time}</div>
                    <h4 className="text-white font-bold text-xl mb-3">{plan.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed px-2">{plan.desc}</p>
                </div>
            ))}
        </div>
    </Section>
);

const Footer = () => (
  <footer id="contact" className="bg-slate-950 py-16 px-6 border-t border-slate-900 relative overflow-hidden mt-20">
     <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-12">
            <div className="flex items-center gap-4">
                <Logo className="w-12 h-12" />
                <div>
                    <span className="font-bold text-2xl text-white tracking-wide block">锐新视科技</span>
                    <span className="text-slate-500 text-xs uppercase tracking-widest">Ruixin Vision Tech</span>
                </div>
            </div>
            <div className="flex gap-8">
                <a href="#overview" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium">关于我们</a>
                <a href="#products" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium">产品服务</a>
                <a href="#contact" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium">联系方式</a>
            </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-sm text-slate-500 border-t border-slate-900 pt-10">
            <div>
                <div className="font-bold text-slate-300 mb-3 uppercase tracking-wider text-xs">Contact</div>
                <p className="mb-1">电话：0512-66889999</p>
                <p>邮箱：contact@ruixinvision.com</p>
            </div>
            <div>
                <div className="font-bold text-slate-300 mb-3 uppercase tracking-wider text-xs">Location</div>
                <p>{COMPANY_INFO.location}</p>
            </div>
            <div className="md:text-right flex flex-col justify-end">
                 <p>© 2026 Suzhou Ruixin Vision Technology Co., Ltd.</p>
                 <p className="mt-1">All rights reserved.</p>
            </div>
        </div>
     </div>
     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-cyan-950/20 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
  </footer>
);

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
        {role: 'model', text: '您好！我是锐新视科技的AI助手。关于我们的产品、技术或商业计划书，您有什么想了解的吗？'}
    ]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: `You are the AI assistant for "Suzhou Ruixin Vision Technology Co., Ltd." (苏州锐新视科技有限公司). 
                    Your goal is to answer questions about the company, its products, and its business plan based on the provided context.
                    
                    Context (Business Plan):
                    ${BP_CONTENT}
                    
                    Guidelines:
                    - Be professional, enthusiastic, and concise.
                    - If the user asks about something not in the context, politely say you don't have that information but can refer them to the founders.
                    - Emphasize the "AI + Manufacturing" and "Digital Employee" aspects.
                    - Always reply in Chinese unless the user asks in English.`,
            }
        });
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || isSending || !chatRef.current) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
        setIsSending(true);

        try {
            const response = await chatRef.current.sendMessage({ message: userMsg });
            setMessages(prev => [...prev, {role: 'model', text: response.text || "Thinking..."}]);
        } catch (error) {
             setMessages(prev => [...prev, {role: 'model', text: "抱歉，出错了。"}]);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up h-[500px]">
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <span>🤖</span> 锐新视 AI 助手
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/90">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                        <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="输入问题..."
                            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={isSending}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30 hover:scale-110 transition-transform"
            >
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};

const App = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [view, setView] = useState<'home' | string>('home'); // 'home' or product ID

  const scrollTo = (id: string) => {
    // If not on home view, go home first, then scroll
    if (view !== 'home') {
        setView('home');
        // Use timeout to allow render to complete
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    }
  };

  useEffect(() => {
    if (view !== 'home') return; // Don't track scroll on detail pages
    
    const handleScroll = () => {
      const sections = ['hero', 'overview', 'products', 'success', 'experience', 'tech', 'market', 'team', 'future'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= -100 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view]);

  return (
    <div className="min-h-screen">
      <Navigation 
        activeSection={activeSection} 
        scrollTo={scrollTo} 
        onBack={() => { setView('home'); window.scrollTo(0, 0); }}
        isProductPage={view !== 'home'}
      />
      
      {view === 'home' ? (
        <>
            <Hero />
            <div className="relative z-10 space-y-12 pb-24">
                <Overview />
                <Products onViewProduct={(id) => { setView(id); window.scrollTo(0, 0); }} />
                <CustomerSuccess />
                <AIExperienceCenter />
                <TechAndMarket />
                <BusinessModel />
                <Team />
                <Future />
            </div>
        </>
      ) : (
        <ProductDetail detail={PRODUCT_DETAILS[view as keyof typeof PRODUCT_DETAILS]} />
      )}

      <Footer />
      <Chatbot />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);