import { startRefreshIndexes, searchWithKeyword } from './_internal/indexer';
import type { Request, Response } from 'express';

function validSignature(src: any) {
  return true;
}

function handleHook(siteName: string, commitId: string, requestSignature: string) {
  console.log('#handleHook', siteName, commitId, requestSignature);
  if (!validSignature(requestSignature)) {
    throw new Error('非法调用');
  }

  startRefreshIndexes(siteName, commitId);
}

export async function handleSyncHook(req: Request<{ site: string }, object & { after: string }>, res: Response) {
  const siteName = req.params.site;

  if (!siteName) {
    throw new Error('require site name');
  }

  const requestSignature = (req.headers['X-Hub-Signature-256'] || req.headers['x-hub-signature-256']) as string;
  const reqBody = req.body;

  handleHook(siteName, reqBody.after, requestSignature);
  res.json({});
}

export async function handleSearch(req: Request, res: Response) {
  const siteName = req.params.site;
  const keyword = req.query.keyword as unknown as string;
  const pageIndex = Number.parseInt(req.query.pageIndex as unknown as string);
  const pageSize = Number.parseInt(req.query.pageSize as unknown as string);

  if (keyword && pageIndex && pageSize) {
    const result = await searchWithKeyword(siteName, keyword, pageIndex, pageSize);
    res.json(result);
  } else {
    res.status(400).json({ message: 'require some parameter' });
  }
}

export function handleStatus(req: Request, res: Response): void {
  res.json({ status: 'ok' });
}
