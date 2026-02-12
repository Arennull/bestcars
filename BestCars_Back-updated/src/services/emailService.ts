import sgMail from '@sendgrid/mail';
import { Client } from '@sendgrid/client';

// Initialize SendGrid with API key from environment
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'dev@theaibusiness.com';
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'dev@theaibusiness.com';

if (SENDGRID_API_KEY) {
  // Configure EU data residency by creating a client with EU endpoint
  const client = new Client();
  client.setApiKey(SENDGRID_API_KEY);
  sgMail.setClient(client);
}

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  vehicleId?: string;
  vehicleTitle?: string;
}

export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  if (!SENDGRID_API_KEY) {
    throw new Error('SendGrid API key is not configured. Please set SENDGRID_API_KEY environment variable.');
  }

  const vehicleInfo = data.vehicleTitle 
    ? `Vehículo de interés: ${data.vehicleTitle}`
    : 'No se especificó un vehículo';

  const emailContent = `
Nueva solicitud de información desde el formulario de contacto:

Nombre: ${data.name}
Email: ${data.email}
${data.phone ? `Teléfono: ${data.phone}` : ''}

${vehicleInfo}

${data.message ? `Mensaje:\n${data.message}` : ''}
  `.trim();

  const msg = {
    to: RECIPIENT_EMAIL,
    from: FROM_EMAIL,
    subject: `Nueva consulta de contacto - ${data.name}`,
    text: emailContent,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
          Nueva solicitud de información
        </h2>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Nombre:</strong> ${data.name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.phone ? `<p style="margin: 10px 0;"><strong>Teléfono:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
        </div>

        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>${vehicleInfo}</strong></p>
        </div>

        ${data.message ? `
        <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Mensaje:</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
        </div>
        ` : ''}
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent successfully via SendGrid');
  } catch (error) {
    console.error('❌ Error sending email via SendGrid:', error);
    throw error;
  }
}

interface TestDriveEmailData {
  name: string;
  age: string;
  lastVehicle: string;
  interests: string;
  mainUse: string;
  vehicleId?: string;
  vehicleTitle?: string;
}

export async function sendTestDriveEmail(data: TestDriveEmailData): Promise<void> {
  if (!SENDGRID_API_KEY) {
    throw new Error('SendGrid API key is not configured. Please set SENDGRID_API_KEY environment variable.');
  }

  const vehicleInfo = data.vehicleTitle 
    ? `Vehículo de interés: ${data.vehicleTitle}`
    : 'No se especificó un vehículo';

  const emailContent = `
Nueva solicitud de prueba de manejo:

Nombre: ${data.name}
Edad: ${data.age}
Último vehículo: ${data.lastVehicle}
¿Qué quiere saber sobre el coche?: ${data.interests}
¿Qué uso le va a dar?: ${data.mainUse}

${vehicleInfo}
  `.trim();

  const msg = {
    to: RECIPIENT_EMAIL,
    from: FROM_EMAIL,
    subject: `Nueva solicitud de prueba de manejo - ${data.name}`,
    text: emailContent,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
          Nueva solicitud de prueba de manejo
        </h2>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Nombre:</strong> ${data.name}</p>
          <p style="margin: 10px 0;"><strong>Edad:</strong> ${data.age}</p>
          <p style="margin: 10px 0;"><strong>Último vehículo:</strong> ${data.lastVehicle}</p>
          <p style="margin: 10px 0;"><strong>¿Qué quiere saber sobre el coche?:</strong> ${data.interests}</p>
          <p style="margin: 10px 0;"><strong>¿Qué uso le va a dar?:</strong> ${data.mainUse}</p>
        </div>

        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>${vehicleInfo}</strong></p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Test drive email sent successfully via SendGrid');
  } catch (error) {
    console.error('❌ Error sending test drive email via SendGrid:', error);
    throw error;
  }
}
