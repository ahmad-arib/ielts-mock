import path from 'node:path';
import { promises as fs } from 'node:fs';

const TESTS_ROOT = path.join(process.cwd(), 'tests');

function isSafeTestId(testId: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(testId);
}

function getMimeType(ext: string): string {
  switch (ext) {
    case '.mp3':
      return 'audio/mpeg';
    case '.wav':
      return 'audio/wav';
    case '.m4a':
      return 'audio/mp4';
    case '.ogg':
      return 'audio/ogg';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ testId: string; assetPath: string[] }> }
): Promise<Response> {
  const { testId, assetPath } = await context.params;
  if (!isSafeTestId(testId) || !Array.isArray(assetPath) || assetPath.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  const assetsRoot = path.join(TESTS_ROOT, testId, 'assets');
  const requestedPath = path.join(assetsRoot, ...assetPath);
  const resolvedPath = path.resolve(requestedPath);
  if (!resolvedPath.startsWith(path.resolve(assetsRoot))) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const file = await fs.readFile(resolvedPath);
    const contentType = getMimeType(path.extname(resolvedPath).toLowerCase());
    return new Response(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
