import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    // Get form data from request
    const formData = await request.json();
    const { name, email, message } = formData;

    // Validate form data
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Construct email content
    const emailContent = `
      New message from contact form:
      
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `;

    // Construct auto-reply content
    const autoReplyContent = `
Thank you for reaching out to QuantHive!

We've received your message and our team will get back to you as soon as possible.

This is an automated confirmation – please do not reply to this email.

We appreciate your interest in transparent, AI-driven investment strategies.

Warm regards,
The QuantHive Team
www.quanthive.in
    `;

    // HTML version of the auto-reply email
    const autoReplyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Thank you for contacting QuantHive</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .container {
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 5px;
    }
    .header {
      border-bottom: 2px solid #f5f5f5;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #f5f5f5;
      color: #777;
      font-size: 0.9em;
    }
    h1 {
      color: #000;
      font-size: 1.5em;
    }
    a {
      color: #000;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Contacting QuantHive</h1>
    </div>
    
    <p>Dear ${name},</p>
    
    <p>Thank you for reaching out to QuantHive!</p>
    
    <p>We've received your message and our team will get back to you as soon as possible.</p>
    
    <p><em>This is an automated confirmation – please do not reply to this email.</em></p>
    
    <p>We appreciate your interest in transparent, AI-driven investment strategies.</p>
    
    <p>
      Warm regards,<br>
      The QuantHive Team<br>
      <a href="https://www.quanthive.in">www.quanthive.in</a>
    </p>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} QuantHive. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Log the email content for development purposes
    console.log('Email that would be sent to mail@quanthive.in:');
    console.log(emailContent);

    try {
      // Create transporter with email configuration
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // True for port 465, false for other ports
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      // Send the notification email to QuantHive
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"QuantHive Website" <noreply@quanthive.in>',
        to: 'mail@quanthive.in',
        subject: `New Contact Form Submission from ${name}`,
        text: emailContent,
        replyTo: email,
      });

      // Send auto-reply email to the user
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"QuantHive" <noreply@quanthive.in>',
        to: email,
        subject: 'Thank you for contacting QuantHive',
        text: autoReplyContent,
        html: autoReplyHtml,
      });

      console.log(`Auto-reply email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // For development environments, we'll allow the submission to succeed
      // even if email sending fails, but log the error
      if (process.env.NODE_ENV === 'production') {
        throw emailError;
      }
    }

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
} 