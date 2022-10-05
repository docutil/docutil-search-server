export function startRefreshIndexes(siteName: string, commitId: string): void {
  // 上锁
  // 使用指定 commitId 下载 site 代码
  // 清理旧索引
  // 重建索引
}

export function searchWithKeyword(indexName: string, keyword: string, pageIndex: number, pageSize: number): object[] {
  return [];
}
