"module.exports = {extends: ['@commitlint/config-conventional']}"

/**
#其中 type 的值可以有
#    .feat :新功能 
#    .fix :修复bug
#    .docs :文档改变
#    .style :代码格式改变
#    .refactor :某个已有功能重构
#    .perf :性能优化
#    .test :增加测试
#    .build :改变了build工具 如 grunt换成了 npm
#    .revert :撤销上一次的 commit 
#
#scope :用来说明此次修改的影响范围
#     .all :表示影响面大 ，如修改了网络框架  会对真个程序产生影响
#     .loation :表示影响小，某个小小的功能
#     .module :表示会影响某个模块 如登录模块、首页模块 、用户管理模块等等
#
#subject: 用来简要描述本次改动，概述就好了
# 
#body :具体的修改信息 应该尽量详细
# 
#footer :放置写备注啥的，如果是 bug ，可以把bug id放入
#
*/
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'revert']],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never']
  }
}