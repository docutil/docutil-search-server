import { startRefreshIndexes, searchWithKeyword } from './_internal/indexer';
import type { HttpRequest, HttpResponse } from 'uWebSockets.js';

function validSignature(src: any) {
  return true;
}

function parseAsJson(res: HttpResponse): Promise<object & { after: string }> {
  return new Promise<string>(resolve => {
    const buf: Uint8Array[] = [];
    res.onData((chunk, isLast) => {
      buf.push(new Uint8Array(chunk.slice(0, chunk.byteLength)));
      if (isLast) {
        resolve(Buffer.concat(buf).toString());
      }
    });
  }).then(doc => JSON.parse(doc));
}

function handleHook(siteName: string, commitId: string, requestSignature: string) {
  console.log(`#handleHook`, siteName, commitId, requestSignature);
  if (!validSignature(requestSignature)) {
    throw new Error('非法调用');
  }

  startRefreshIndexes(siteName, commitId);
}

export async function handleSyncHook(res: HttpResponse, req: HttpRequest) {
  res.onAborted(() => {
    res.aborted = true;
  });

  const siteName = req.getParameter(0);
  if (!siteName) {
    res.writeStatus('400 ').end(JSON.stringify({ message: 'require some parameter' }));
  }

  const requestSignature = req.getHeader('X-Hub-Signature-256') || req.getHeader('x-hub-signature-256');
  const reqBody = await parseAsJson(res);

  handleHook(siteName, reqBody.after, requestSignature);
  if (!res.aborted) {
    res.end();
  }
}

export async function handleSearch(res: HttpResponse, req: HttpRequest) {
  let aborted = false;
  res.onAborted(() => {
    aborted = true;
  });

  const siteName = req.getParameter(0);
  if (!siteName) {
    res.writeStatus('400 ').end(JSON.stringify({ message: 'require some parameter' }));
  }

  const keyword = req.getQuery('keyword');
  const pageIndex = parseInt(req.getQuery('pageIndex'));
  const pageSize = parseInt(req.getQuery('pageSize'));

  if (keyword && pageIndex && pageSize) {
    const result = await searchWithKeyword(siteName, keyword, pageIndex, pageSize);
    res.write(JSON.stringify(result));
  } else {
    res.writeStatus('400 ').write(JSON.stringify({ message: 'require some parameter' }));
  }

  if (!aborted) {
    res.end();
  }
}

export function handleStatus(res: HttpResponse): void {
  res.writeStatus('200 OK').end(JSON.stringify({ status: 'ok' }));
}
