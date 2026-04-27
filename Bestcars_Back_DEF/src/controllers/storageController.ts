/**
 * Subida de archivos a Supabase Storage (vehículos).
 * POST /api/vehicles/upload-image — requiere auth + multer campo "image".
 */

import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import multer from 'multer';
import { getSupabaseAdmin, getVehicleImagesBucket } from '../config/supabase.js';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const mimeToExt: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

function safeExtFromFile(originalname: string | undefined, mimetype: string): string {
  if (originalname && typeof originalname === 'string') {
    const base = originalname.split(/[/\\]/).pop() || '';
    const match = /^[^.]+\.([a-z0-9]+)$/i.exec(base);
    if (match) {
      const ext = match[1].toLowerCase();
      if (/^[a-z0-9]{1,8}$/.test(ext)) return ext;
    }
  }
  return mimeToExt[mimetype] || 'bin';
}

export const vehicleImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

export async function uploadVehicleImage(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file || !file.buffer) {
    res.status(400).json({
      error: { message: 'Missing image file (field name: image)', code: 'MISSING_FILE' },
    });
    return;
  }

  if (!file.mimetype.startsWith('image/')) {
    res.status(400).json({
      error: { message: 'Only image files are allowed', code: 'INVALID_TYPE' },
    });
    return;
  }

  const year = new Date().getFullYear();
  const ext = safeExtFromFile(file.originalname, file.mimetype);
  const storagePath = `vehicles/${year}/${Date.now()}-${randomUUID()}.${ext}`;

  const supabase = getSupabaseAdmin();
  const bucket = getVehicleImagesBucket();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    console.error('[storageController] Supabase upload error:', uploadError.message);
    res.status(502).json({
      error: {
        message: 'Failed to upload image to storage',
        code: 'STORAGE_UPLOAD_FAILED',
      },
    });
    return;
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  const publicUrl = publicData?.publicUrl;
  if (!publicUrl) {
    res.status(500).json({
      error: { message: 'Could not resolve public URL for uploaded file', code: 'PUBLIC_URL_FAILED' },
    });
    return;
  }

  res.status(201).json({
    url: publicUrl,
    path: storagePath,
  });
}
