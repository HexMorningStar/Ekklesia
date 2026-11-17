import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const apkPath = path.join(process.cwd(), 'public', 'EKKLESIA.apk');

  if (!fs.existsSync(apkPath)) {
    return NextResponse.json({ error: 'Archivo APK no encontrado' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(apkPath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="EKKLESIA.apk"',
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'no-cache'
    }
  });
}
