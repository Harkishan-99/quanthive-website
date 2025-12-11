import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, organisation, email, phone } = await req.json();

    // Validate required fields
    if (!name || !organisation || !email || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create email content
    const subject = 'Flash Waitlist - New Registration';
    const body = `
Name: ${name}
Organisation: ${organisation}
Email: ${email}
Phone: ${phone}

This registration was submitted from the Flash website.
    `.trim();

    // Send email using SMTP via Nodemailer
    try {
      const env = process.env;
      // Support both current SMTP_* and legacy EMAIL_SERVER_* / MAIL_SERVER_* env names
      const host = env.SMTP_HOST || env.MAIL_SERVER_HOST || env.EMAIL_SERVER_HOST;
      const port = env.SMTP_PORT || env.EMAIL_SERVER_PORT;
      const user = env.SMTP_USER || env.EMAIL_SERVER_USER;
      const pass = env.SMTP_PASS || env.EMAIL_SERVER_PASSWORD;
      const to = env.SMTP_TO || env.EMAIL_TO || 'harkishansinghbaniya@gmail.com';
      // For deliverability, default from to the authenticated user if not provided
      const from = (env.SMTP_FROM || env.EMAIL_FROM || user || '').trim();
      const plainOnly = env.SMTP_PLAIN_ONLY === 'true';

      const missingVars = [];
      if (!host) missingVars.push('SMTP_HOST/MAIL_SERVER_HOST/EMAIL_SERVER_HOST');
      if (!port) missingVars.push('SMTP_PORT/EMAIL_SERVER_PORT');
      if (!user) missingVars.push('SMTP_USER/EMAIL_SERVER_USER');
      if (!pass) missingVars.push('SMTP_PASS/EMAIL_SERVER_PASSWORD');
      if (!from) missingVars.push('SMTP_FROM/EMAIL_FROM (or SMTP_USER fallback)');
      if (!to) missingVars.push('SMTP_TO/EMAIL_TO');

      if (missingVars.length > 0) {
        console.log('SMTP config missing. Email data would be sent:', {
          host,
          port,
          to,
          from,
          subject,
          body,
          replyTo: email,
          missingVars,
        });
      } else {
        const transporter = nodemailer.createTransport({
          host,
          port: Number(port),
          secure: Number(port) === 465, // true for SMTPS
          auth: {
            user,
            pass,
          },
        });

        const info = await transporter.sendMail({
          from,
          to,
          replyTo: `${name} <${email}>`,
          subject,
          text: body,
          html: plainOnly ? undefined : `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
                New Flash Waitlist Registration
              </h2>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Organisation:</strong> ${organisation}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
              </div>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                <em>This registration was submitted from the Flash website.</em>
              </p>
            </div>
          `,
        });

        console.log('SMTP email sent:', info.messageId);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email sending fails
      // Just log it for now
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration submitted successfully! We\'ll contact you soon.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing waitlist registration:', error);
    return NextResponse.json(
      { error: 'Failed to process registration. Please try again.' },
      { status: 500 }
    );
  }
}
