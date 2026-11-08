# GSET RWA 抽奖网站 PRD

## 原始需求
做一个抽奖手机网站，GSET 机构 RWA 主题，深蓝黑底 #0F1320，蓝金渐变，玻璃拟态，移动端中文界面。

## 已实现功能 (2026-11-08)
1. **抽奖首页** — 顶部导航、1,000,000 USDT 奖池横幅、抽奖码输入+校验、SVG 抽奖转盘（6 档 USDT 奖品）、奖池进度卡、近期中奖滚动名单、快捷入口
2. **中奖弹窗** — 恭喜中奖、金额展示、领取券码、复制券码、联系客服
3. **我的抽奖码** — 统计卡片（可用/已使用/已失效）、抽奖码列表、立即使用跳转
4. **我的领取券** — 统计卡片（全部/待兑换/已兑换/已过期）、券码列表、复制券码、联系客服
5. **邀请页** — 邀请说明、统计、邀请链接复制、排行榜
6. **客服兑换页** — 兑换流程步骤、券码输入、联系客服按钮
7. **活动规则页** — 7 条规则、我已阅读按钮

## 技术架构
- 前端: React 19 + Tailwind + Framer Motion + Lenis 平滑滚动
- 后端: FastAPI + MongoDB (motor)
- 设计: 深蓝黑 #0F1320、蓝金渐变、玻璃拟态、Noto Serif SC 标题 + Bebas Neue 数字
- Logo: 原创 SVG 六边形 + 金色 G 字母，用作 favicon

## 后端 API
- POST /api/draw/validate — 校验抽奖码
- POST /api/draw/spin — 抽奖（加权随机：5000/1000/200/50/10/2 USDT）
- GET /api/codes/my — 我的抽奖码
- GET /api/coupons/my — 我的领取券
- GET /api/winners/recent — 近期中奖名单
- GET /api/pool/stats — 奖池统计
- GET /api/invite/info — 邀请信息
- GET /api/invite/leaderboard — 邀请排行

## 用户画像
- 参与 GSET RWA 活动的移动端用户，持有抽奖码，期望抽奖、领券、联系客服兑换 USDT

## UI 约束（重设计后须保持）
- 转盘为 12 格（每个奖项出现两次），落点逻辑依赖 SEGMENTS/SEG_DEG，改格子列表必须重新验证落点
- spin-btn 现在是转盘中心按钮
- App.js 的 .page-content 必须保持 overflowX: "clip"，改成 overflow-x-hidden 会导致页头吸顶失效
- /public/assets 下的图片（奖杯、金币、六边形徽章、票券、客服）均为透明背景，不可换成带底图
- 奖池进度条显示剩余奖池而非已用

## 待办 (P0/P1/P2)
- P0: 真实客服系统对接（当前为 toast 提示 MOCKED）
- P0: 钱包连接功能（当前为 UI 占位）
- P1: 抽奖码管理后台（商家批量生成/导入）
- P1: 领取券过期自动任务
- P2: 多语言、分享海报、音效
