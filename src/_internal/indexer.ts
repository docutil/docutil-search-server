import { MeiliSearch, Index } from 'meilisearch';
import { createSiteIndexRecords } from './md_utils';
import { IndexRecord } from './_common';

function initMeiliSearchClient(): MeiliSearch {
  return new MeiliSearch({
    host: process.env.DSS_SEARCH_ENGINE_HOST || 'http://127.0.0.1:7700',
    apiKey: process.env.DSS_SEARCH_ENGINE_API_KEY || 'xxxxxx',
  });
}

interface Task {
  indexName: string;
  commitId: string;
}

class DocSiteIndex {
  _indexName: string;
  _commitId?: string;
  _searchEngineClient: MeiliSearch;
  _index: Index<IndexRecord>;

  constructor(indexName: string, commitId?: string) {
    this._indexName = indexName;
    this._commitId = commitId;

    this._searchEngineClient = initMeiliSearchClient();
    this._index = this._searchEngineClient.index(indexName);
  }

  async clean(): Promise<void> {
    await this._index.deleteAllDocuments();
  }

  async makeIndex(): Promise<void> {
    const { repoUrl, path, docPath } = getConfig(this._indexName);
    await gitClone(repoUrl, this._commitId || 'master', path);

    const indexRecords = await createSiteIndexRecords(docPath);
    await this._index.addDocumentsInBatches(indexRecords);
  }

  async search(keyword: string, pageIndex: number, pageSize: number): Promise<IndexRecord[]> {
    const result = await this._index.search<IndexRecord>(keyword, {
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize,
    });
    return result.hits;
  }
}

class IndexerTasks {
  _list: Task[] = [];
  _running: boolean = false;

  push(task: Task): void {
    const found = this._list.find(it => it.indexName === task.indexName && it.commitId === it.commitId);
    if (found) {
      return;
    }

    this._list.push(task);
    if (!this._running) {
      this._resolveTask();
    }
  }

  async _upgradeIndex(task: Task): Promise<void> {
    const index = new DocSiteIndex(task.indexName, task.commitId);
    await index.clean();
    await index.makeIndex();
  }

  async _resolveTask(): Promise<void> {
    const task = this._list.pop();
    if (task) {
      this._running = true;
      await this._upgradeIndex(task);
    }

    if (this._list.length === 0) {
      this._running = false;
      return;
    }

    return this._resolveTask();
  }
}

const INDEXER_TASKS = new IndexerTasks();

export function startRefreshIndexes(siteName: string, commitId: string): void {
  INDEXER_TASKS.push({ indexName: siteName, commitId });
}

export function searchWithKeyword(
  indexName: string,
  keyword: string,
  pageIndex: number,
  pageSize: number,
): Promise<IndexRecord[]> {
  const index = new DocSiteIndex(indexName);
  return index.search(keyword, pageIndex, pageSize);
}
