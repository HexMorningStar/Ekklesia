import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se envió ningún archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Directorio de destino en public/uploads/sheet-music
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sheet-music');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Nombre de archivo seguro
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, safeName);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/api/sheet-music/${safeName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      message: 'Partitura subida exitosamente'
    });
  } catch (err: any) {
    console.error('Error en upload:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
