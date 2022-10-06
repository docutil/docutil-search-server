import { globby } from 'globby';
import { readFile } from 'fs-extra';

import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';
import { checksum, IndexRecord } from './_common';

function readDir(path: string): Promise<string[]> {
  return globby(`${path}/**/*.md`);
}

function filterAstType(type: string): boolean {
  // TODO 只处理部分 AST node
  return true;
}

async function parseMarkdown(path: string): Promise<string[]> {
  const doc = await readFile(path, 'utf8');

  const mdAst = fromMarkdown(doc);
  return mdAst.children
    .filter(it => filterAstType(it.type.toString()))
    .map(node => {
      return toString(node).trim();
    });
}

export async function createSiteIndexRecords(repoDocDir: string): Promise<IndexRecord[]> {
  const markdownFiles = await readDir(repoDocDir);

  const result: IndexRecord[] = [];
  for (const mdFile of markdownFiles) {
    const textBlocks = await parseMarkdown(mdFile);
    textBlocks.forEach(block => {
      result.push({
        path: mdFile,
        block: block,
        id: checksum(block),
      });
    });
  }

  return result;
}
