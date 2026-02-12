import { type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendContactEmail } from '../services/emailService.js';

interface ContactRequestBody {
  vehicleId?: string;
  vehicleTitle?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export const submitContact = async (
  req: Request<{}, {}, ContactRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { vehicleId, vehicleTitle, name, email, phone, message } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (phone && phone.trim() !== '') {
      const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
      if (!/^\+?\d+$/.test(cleaned)) {
        res.status(400).json({ error: 'Invalid phone number format. Use international format (e.g., +34 600 000 000)' });
        return;
      }
      const digitsOnly = cleaned.replace(/^\+/, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        res.status(400).json({ error: 'Phone number must be between 7 and 15 digits' });
        return;
      }
    }

    const record = await prisma.contactSubmission.create({
      data: {
        vehicleId: vehicleId ?? null,
        name,
        email,
        phone: phone ?? null,
        message: message ?? null,
      },
    });

    // Increment leads counter if vehicle exists
    if (vehicleId) {
      prisma.vehicle
        .update({ where: { id: vehicleId }, data: { leads: { increment: 1 } } })
        .catch(() => void 0);
    }

    // Send email best-effort
    let emailOk = true;
    try {
      await sendContactEmail({ name, email, phone, message, vehicleId, vehicleTitle });
    } catch (emailError) {
      emailOk = false;
      console.error('Error sending email via SendGrid:', emailError);
    }

    res.status(201).json({ success: true, id: record.id, emailOk });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
};

export const getAllContacts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const contacts = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true },
    });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({ error: 'Failed to fetch contact submissions' });
  }
};

interface ContactPatchBody {
  status?: string;
  notes?: string | null;
}

export const updateContact = async (req: Request<{ id: string }, {}, ContactPatchBody>, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }

    const { status, notes } = req.body ?? {};
    const updated = await prisma.contactSubmission.update({
      where: { id },
      data: {
        ...(status !== undefined && { status: String(status) }),
        ...(notes !== undefined && { notes: notes === null ? null : String(notes) }),
      },
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating contact submission:', error);
    res.status(500).json({ error: 'Failed to update contact submission' });
  }
};
