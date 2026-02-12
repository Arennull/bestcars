import { type Request, type Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendTestDriveEmail } from '../services/emailService.js';

interface TestDriveRequestBody {
  vehicleId?: string;
  vehicleTitle?: string;
  name: string;
  age: string;
  lastVehicle: string;
  interests: string;
  mainUse: string;
}

export const submitTestDrive = async (
  req: Request<{}, {}, TestDriveRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { vehicleId, vehicleTitle, name, age, lastVehicle, interests, mainUse } = req.body;

    if (!name || !age || !lastVehicle || !interests || !mainUse) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const record = await prisma.testDriveSubmission.create({
      data: {
        vehicleId: vehicleId ?? null,
        name,
        age,
        lastVehicle,
        interests,
        mainUse,
      },
    });

    // Increment leads counter if vehicle exists
    if (vehicleId) {
      prisma.vehicle
        .update({ where: { id: vehicleId }, data: { leads: { increment: 1 } } })
        .catch(() => void 0);
    }

    let emailOk = true;
    try {
      await sendTestDriveEmail({ name, age, lastVehicle, interests, mainUse, vehicleId, vehicleTitle });
    } catch (emailError) {
      emailOk = false;
      console.error('Error sending test drive email via SendGrid:', emailError);
    }

    res.status(201).json({ success: true, id: record.id, emailOk });
  } catch (error) {
    console.error('Error submitting test drive form:', error);
    res.status(500).json({ error: 'Failed to submit test drive form' });
  }
};

export const getAllTestDrives = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.testDriveSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true },
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching test drive submissions:', error);
    res.status(500).json({ error: 'Failed to fetch test drive submissions' });
  }
};

interface TestDrivePatchBody {
  status?: string;
  notes?: string | null;
}

export const updateTestDrive = async (
  req: Request<{ id: string }, {}, TestDrivePatchBody>,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }

    const { status, notes } = req.body ?? {};
    const updated = await prisma.testDriveSubmission.update({
      where: { id },
      data: {
        ...(status !== undefined && { status: String(status) }),
        ...(notes !== undefined && { notes: notes === null ? null : String(notes) }),
      },
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating test drive submission:', error);
    res.status(500).json({ error: 'Failed to update test drive submission' });
  }
};
