# Mono Repository

当前项目包括两个不同类型的项目，
1. 一个是根目录下的
2. 一个是superlinear-academy


## Task 1: Mono Repo this repo
当前项目期望做的事情是：
1. 把当前项目变成一个Mono Repository
2. 抽取出ui和一些公用的代码放到pacakges/ui 里面中，目前应该是完全的shadcn-ui作为基础的
3. 两个项目同时依赖这个packages 把整个项目变成一个Mono Repository，有两个web项目在apps目录中
4. 启动这两个项目，如果以运行并且页面有内容给，那么可以任务完成

## Task 2:  完全Mono Repo

1. 当前项目有个问题就是Apps目录和packages目录没有在一个workspace里面
2. 期望在一个workspace里面
3. 然后两个apps目录下的内容的ui都依赖到pakckages/ui目录中
4. 消除apps目录下公用的代码