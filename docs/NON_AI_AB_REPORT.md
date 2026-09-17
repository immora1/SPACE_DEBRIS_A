# Non-AI A/B 测试版本改造记录

日期：2026-09-17。修改范围：当前复制项目，未部署或修改原站点。

## 已完成

- 移除全局 AI 故事轨道、弹出故事卡片、历史事件 AI 日志、材料分析生成入口、个性化故事与视频 AI 问答。
- 移除姓名、城市、重要事件表单及其验证、卫星个性化匹配、滚动锁定门槛。
- 移除末尾观测报告输入表单与提交门槛；保留十五组分类练习、固定示例及社区示例内容。
- 材料选择与任务指派保留；材料数值、任务轨道配置使用原有本地规则。任务简介保留固定科普内容。
- 轨道事件按已有选项增减燃料、护甲和任务进度，清理配对按已有正确方法即时评分；不再等待 AI。
- 删除 AI 客户端、队列与恢复服务、服务端生成接口、提示词代码、AI 数据库迁移及专用脚本。仅保留无 AI 依赖的健康检查接口。
- 移除 OpenAI SDK 等已无引用依赖与 D1 绑定，启动和构建不需要 AI Key。
- 本地存储升级至 v5，只迁移和恢复白名单游戏字段；旧个人信息、生成故事及 AI 状态不再恢复或持久化。清除旧故事会话和后台队列。

## 页面流程

原：轨道科普 → 个人信息 / 卫星匹配 / AI 故事 → 材料 AI 分析 → 任务 AI 推进 → 轨道游戏。
现：轨道科普 → 材料选择 → 本地任务指派 → 本地轨道游戏。

原：清理配对 → 等待 AI → 故事结局 → 科普总结 / AI 问答。
现：清理配对即时评分 → 科普资料 → 可选观测教学。

原：分类练习 + 个人观测报告提交 → 完成教学。
现：完成原有分类练习并达到原有正确率 → 完成教学。

## 验证

- `npm run build`：通过；保留 Three.js 相关大分块警告。
- `npm run lint`：通过。
- `npm test`：71 项通过；包含 81 种材料组合、全部任务的六轮本地事件、存储迁移和无 AI 调用源代码检查。
- Typecheck：项目为 JavaScript / JSX，没有独立 typecheck 配置；使用构建和 ESLint 检查。
- 浏览器抽查：中英文导航、四项材料选择、任务指派、轨道游戏首轮反馈与下一轮、回收演示入口、清理配对 3/3 和 100% 效率、进入科普总结和观测教学均可用。
- 已加载页面的文本输入框与 AI 按钮数均为 0。
- 已检查的浏览器请求记录中未发现 AI/API 请求；客户端源代码无 AI 请求调用链。
- Console：未捕获错误；存在原有 `THREE.Clock` 弃用警告。
- 未逐一手动完成全部十五组观测分类；其原有练习逻辑未改动。

## 保留项与边界

普通历史详情、轨道说明、任务资料、法律档案和规则型游戏卡片属于固定科普内容，保留。

`docs/` 中旧 AI 设计文档以及已忽略的 `.tmp-*` 历史构建副本保留作历史资料，不参与当前入口、构建或发布。用户已有环境变量文件未读取或修改。没有保留可被当前站点调用的 AI 服务。

依赖锁文件已在本地同步；项目原有 `.gitignore` 忽略 `package-lock.json`，未改变此仓库约定。

## 运行

- 开发：`npm run dev`
- 构建：`npm run build`
- 预览构建产物：`npm run preview`
- 当前验证预览：http://127.0.0.1:5174/

## 变更文件

新增：`src/data/materials.js`、`src/data/missions.js`、`src/nonAi.test.mjs`、本报告。

状态 M 表示修改，D 表示删除。

- `D — .dev.vars.example`
- `D — functions/_story/anomaly-facts.js`
- `D — functions/_story/cleanup-matching.js`
- `D — functions/_story/cleanup-matching.test.mjs`
- `D — functions/_story/config/cleanup-pairs.js`
- `D — functions/_story/config/game-story-bindings.js`
- `D — functions/_story/config/lookahead-bindings.js`
- `D — functions/_story/config/material-story-bindings.js`
- `D — functions/_story/config/materials.js`
- `D — functions/_story/config/mission-story-bindings.js`
- `D — functions/_story/config/missions.js`
- `D — functions/_story/config/node-interactions.js`
- `D — functions/_story/config/orbital-events.js`
- `D — functions/_story/config/story-options.js`
- `D — functions/_story/config/story-path-options.js`
- `D — functions/_story/constants.js`
- `D — functions/_story/ending-reachability.js`
- `D — functions/_story/ending-selector.js`
- `D — functions/_story/five-stage.test.mjs`
- `D — functions/_story/fixtures.js`
- `D — functions/_story/http.js`
- `D — functions/_story/latency.test.mjs`
- `D — functions/_story/materials.test.mjs`
- `D — functions/_story/mission-site-interactions.test.mjs`
- `D — functions/_story/missions.test.mjs`
- `D — functions/_story/model.js`
- `D — functions/_story/model.test.mjs`
- `D — functions/_story/numeric-story.test.mjs`
- `D — functions/_story/opening-stream.js`
- `D — functions/_story/orbital-story-jobs.test.mjs`
- `D — functions/_story/outline-generation.js`
- `D — functions/_story/performance.test.mjs`
- `D — functions/_story/product-actions.js`
- `D — functions/_story/prompts/continue.js`
- `D — functions/_story/prompts/ending.js`
- `D — functions/_story/prompts/index.js`
- `D — functions/_story/prompts/knowledge-reveal.js`
- `D — functions/_story/prompts/opening.js`
- `D — functions/_story/prompts/outline.js`
- `D — functions/_story/prompts/shared.js`
- `D — functions/_story/prompts/system.js`
- `D — functions/_story/public-dto.js`
- `D — functions/_story/repository.js`
- `D — functions/_story/schema-validators.generated.cjs`
- `D — functions/_story/schemas.js`
- `D — functions/_story/site-interactions.js`
- `D — functions/_story/site-interactions.test.mjs`
- `D — functions/_story/spec-assets.generated.js`
- `D — functions/_story/spec-assets.js`
- `D — functions/_story/spec-assets.test.mjs`
- `D — functions/_story/stage-contract.js`
- `D — functions/_story/state-reducer.js`
- `D — functions/_story/story-context.js`
- `D — functions/_story/story-service.js`
- `D — functions/_story/story-service.test.mjs`
- `D — functions/_story/stream-response.js`
- `D — functions/_story/validators.js`
- `D — functions/_story/validators.test.mjs`
- `D — functions/api/gpt.js`
- `M — functions/api/health.js`
- `D — functions/api/satellite.js`
- `D — functions/api/stories/[storyId].js`
- `D — functions/api/stories/[storyId]/actions.js`
- `D — functions/api/stories/[storyId]/generations/process.js`
- `D — functions/api/stories/index.js`
- `D — functions/api/test-gpt.js`
- `D — migrations/0001_story_system.sql`
- `D — migrations/0002_outline_opening_v04.sql`
- `D — migrations/0003_story_numeric_state_v2.sql`
- `D — migrations/0004_story_pending_ending.sql`
- `D — migrations/0005_story_site_interactions.sql`
- `D — migrations/0006_orbital_story_generation_jobs.sql`
- `D — migrations/0007_m6_cleanup_knowledge.sql`
- `D — migrations/0008_story_artifact_lookahead.sql`
- `M — package.json`
- `D — scripts/generate-story-spec-assets.mjs`
- `D — scripts/story-orbital-real-e2e.mjs`
- `D — server/index.js`
- `D — server/openai-smoke.mjs`
- `M — src/App.jsx`
- `D — src/components/AIStoryRail.css`
- `D — src/components/AIStoryRail.jsx`
- `M — src/moduleIdentity.test.mjs`
- `M — src/modules/LegalTreaties/index.jsx`
- `D — src/modules/M2/IdentityDossier.jsx`
- `D — src/modules/M2/MaterialSelectionLab.jsx`
- `D — src/modules/M2/MissionSelectionDeck.jsx`
- `D — src/modules/M2/identity-dossier.css`
- `M — src/modules/M2/index.css`
- `M — src/modules/M2/index.jsx`
- `D — src/modules/M2/material-selection-lab.css`
- `D — src/modules/M2/mission-selection-deck.css`
- `D — src/modules/M3/IdentityDossier.jsx`
- `M — src/modules/M3/MaterialSelectionLab.jsx`
- `M — src/modules/M3/MissionSelectionDeck.jsx`
- `D — src/modules/M3/identity-dossier.css`
- `M — src/modules/M3/index.jsx`
- `M — src/modules/M3/material-selection-lab.css`
- `M — src/modules/M3/materialSelectionBinding.test.mjs`
- `M — src/modules/M3/mission-selection-deck.css`
- `M — src/modules/M3/missionSelectionBinding.test.mjs`
- `M — src/modules/M4/M4New.jsx`
- `M — src/modules/M4/ReflectionPage.jsx`
- `M — src/modules/M4/gameData.js`
- `M — src/modules/M4/initialGameStatus.test.mjs`
- `M — src/modules/M4/missionEnvironment.test.mjs`
- `M — src/modules/M5/index.jsx`
- `M — src/modules/M6/index.css`
- `M — src/modules/M6/index.jsx`
- `M — src/modules/M7/index.css`
- `M — src/modules/M7/index.jsx`
- `M — src/modules/M8/index.jsx`
- `D — src/services/ai.js`
- `D — src/services/aiSession.test.mjs`
- `D — src/services/aiTimeline.js`
- `D — src/services/aiTimeline.test.mjs`
- `D — src/services/background-story.js`
- `D — src/services/background-story.test.mjs`
- `D — src/services/story-background.integration.test.mjs`
- `D — src/services/story-progress.js`
- `D — src/services/story-resume.integration.test.mjs`
- `D — src/services/story-stream.js`
- `D — src/services/storySessionRecovery.js`
- `D — src/services/storySiteInteractions.js`
- `M — src/store/useAppStore.js`
- `M — vite.config.js`
- `M — wrangler.toml`
