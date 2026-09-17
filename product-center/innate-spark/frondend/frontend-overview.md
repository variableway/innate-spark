# Frontend Overview

当前Frontend 开发主要是基于基础库:
1. [innate-base](/Users/patrick/workspace/variableway/innate-spark/base/innate-fe-base)

这个基础库主要包含了不同的前端组件库，以及一些基础的工具函数：
1. UI： shadcn-ui
2. 不同的工具和场景库


这个这个Frontend 开发想法如下:
1. 基于基础库的项目结构，进行开发
2. apps中放置独立的项目，可以进行打包部署
3. domain中也放置独立的项目，可以作为一种类似插件的实现进行直接在一个webshell中启动

当前有两个不同的项目在做这个类似的插件方式:
1.  [innate-wip](/Users/patrick/workspace/variableway/innate-workspace/innate-apps/content/innate-wip)
2. [cycle](/Users/patrick/workspace/cycle-all/cyacle)

最终期望的目的是:
1.  基于基础项目库进行开发不如在domain里面开发，或者在另外目录中直接这些基础库
2. 最后如果是domain内容，打包的时候可以直接导包进入apps里面的web项目中
3. 如果apps内容不是web，就是单独想项目，可以独立打包出来
4. 如果这个独立打包出来的进行一定配置也可以plugin到web项目中就最好
5. 整个打包过程可以通过脚本化内容，实现自动打包
5. 这个脚本化内容可以基于bun，deno，ts等实现，可以直接在base-fe中实现

请分析当前三个项目: innate-base-fe/innate-wip/cycle ，分析它们之间的关系和差异, 同时确认哪些是可以进行借鉴和使用，目前自己的一些倾向是:
1.  主要的web 这个可以使用tanstack这块做基础框架先尝试
2. domain内容就按照tanstack这个基础来做
3. 但是这个基础框架可以支持nextjs apps plugin 进去

请对这个进行一次分析，最终把分析可行性，计划task文档分开下如到当前这个frontend这个目录中, 主要目录结构变成:
1.  overview.md: 这个用来放目的，目标
2. analysis.md： 这个用来放分析过程和结果，比较不同项目的差异和可行性
3. plan.md： 这个用来放计划和任务，包括开发计划，测试计划，部署计划等
4. tasks目录:  把每一件需要做的事情都变成一个文档，变成一个任务，最后是独立的，不依赖其他任务的，每一个任务需要有： 目的，context，实现方式，verify的点