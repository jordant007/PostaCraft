// src/app/api/upload/route.js
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('image');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure the uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Generate a unique filename
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(uploadDir, filename);

    // Save the file
    await writeFile(filepath, buffer);

    // Return the URL to access the file
    const fileUrl = `/uploads/${filename}`;
    return new Response(JSON.stringify({ url: fileUrl }), { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload file' }), { status: 500 });
  }
}