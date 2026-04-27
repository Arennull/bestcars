/**
 * Subida de archivos a Supabase Storage (vehículos y fondos de escena).
 * - POST /api/vehicles/upload-image
 * - POST /api/scenes/upload-background
 */

import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import multer from 'multer';
import { getSupabaseAdmin, getVehicleImagesBucket } from '../config/supabase.js';

const MAX_VEHICLE_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_SCENE_BACKGROUND_BYTES = 15 * 1024 * 1024; // 15 MB

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

type UploadOk = { ok: true; url: string; path: string };
type UploadErr = { ok: false; status: number; message: string; code: string };
type UploadResult = UploadOk | UploadErr;

async function uploadImageBufferToBucket(
  buffer: Buffer,
  contentType: string,
  storagePath: string
): Promise<UploadResult> {
  const supabase = getSupabaseAdmin();
  const bucket = getVehicleImagesBucket();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    console.error('[storageController] Supabase upload error:', uploadError.message);
    return {
      ok: false,
      status: 502,
      message: 'Failed to upload image to storage',
      code: 'STORAGE_UPLOAD_FAILED',
    };
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  const publicUrl = publicData?.publicUrl;
  if (!publicUrl) {
    return {
      ok: false,
      status: 500,
      message: 'Could not resolve public URL for uploaded file',
      code: 'PUBLIC_URL_FAILED',
    };
  }

  return { ok: true, url: publicUrl, path: storagePath };
}

function sendUploadResult(res: Response, result: UploadResult): void {
  if (!result.ok) {
    res.status(result.status).json({
      error: { message: result.message, code: result.code },
    });
    return;
  }
  res.status(201).json({
    url: result.url,
    path: result.path,
  });
}

export const vehicleImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VEHICLE_IMAGE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

export const sceneBackgroundUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SCENE_BACKGROUND_BYTES },
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

  const result = await uploadImageBufferToBucket(file.buffer, file.mimetype, storagePath);
  sendUploadResult(res, result);
}

export async function uploadSceneBackground(req: Request, res: Response): Promise<void> {
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
  const storagePath = `scenes/${year}/${Date.now()}-${randomUUID()}.${ext}`;

  const result = await uploadImageBufferToBucket(file.buffer, file.mimetype, storagePath);
  sendUploadResult(res, result);
}
