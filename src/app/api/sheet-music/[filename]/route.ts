import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export function generateStaticParams() {
  return [];
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    // Prevenir directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'sheet-music', safeFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Archivo no encontrado', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    let contentType = 'application/octet-stream';

    if (safeFilename.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (safeFilename.endsWith('.png')) {
      contentType = 'image/png';
    } else if (safeFilename.endsWith('.jpg') || safeFilename.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (safeFilename.endsWith('.webp')) {
      contentType = 'image/webp';
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (err: any) {
    return new NextResponse(err.message, { status: 500 });
  }
}
