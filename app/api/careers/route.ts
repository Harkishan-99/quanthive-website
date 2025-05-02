import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    // Get form data from request
    const formData = await request.json();
    const { 
      fullName, 
      email, 
      contact, 
      interestedRole, 
      linkedinProfile, 
      whyBestFit, 
      cvBase64, 
      cvFileName,
      cvFileType,
      heardFrom 
    } = formData;

    // Validate form data
    if (!fullName || !email || !contact || !interestedRole || !linkedinProfile || !whyBestFit || !heardFrom) {
      return NextResponse.json(
        { error: 'All fields are required except CV upload' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate phone format (country code + 10 digits)
    const phoneRegex = /^\+\d{1,4}\d{10}$/;
    if (!phoneRegex.test(contact)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number with country code (e.g., +911234567890)' },
        { status: 400 }
      );
    }

    // Construct email content
    const emailContent = `
      New job application:
      
      Name: ${fullName}
      Email: ${email}
      Contact: ${contact}
      Interested Role: ${interestedRole}
      LinkedIn Profile: ${linkedinProfile}
      Why Best Fit: ${whyBestFit}
      Heard From: ${heardFrom}
    `;

    // HTML version of the email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Job Application - QuantHive</title>
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
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          th {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Job Application - ${interestedRole}</h1>
          </div>
          
          <table>
            <tr>
              <th>Full Name:</th>
              <td>${fullName}</td>
            </tr>
            <tr>
              <th>Email:</th>
              <td><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <th>Contact:</th>
              <td>${contact}</td>
            </tr>
            <tr>
              <th>Interested Role:</th>
              <td>${interestedRole}</td>
            </tr>
            <tr>
              <th>LinkedIn Profile:</th>
              <td><a href="${linkedinProfile}" target="_blank">${linkedinProfile}</a></td>
            </tr>
            <tr>
              <th>Why Best Fit:</th>
              <td>${whyBestFit}</td>
            </tr>
            <tr>
              <th>Heard From:</th>
              <td>${heardFrom}</td>
            </tr>
          </table>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} QuantHive. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Auto-reply content
    const autoReplyContent = `
Thank you for applying to QuantHive!

We've received your application for the ${interestedRole} position. Our team will review your application and get back to you if your profile matches our requirements.

This is an automated confirmation – please do not reply to this email.

We wish you the best of luck with your application.

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
  <title>Thank you for applying to QuantHive</title>
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
      <h1>Thank You for Applying to QuantHive</h1>
    </div>
    
    <p>Dear ${fullName},</p>
    
    <p>Thank you for applying to QuantHive!</p>
    
    <p>We've received your application for the <strong>${interestedRole}</strong> position. Our team will review your application and get back to you if your profile matches our requirements.</p>
    
    <p><em>This is an automated confirmation – please do not reply to this email.</em></p>
    
    <p>We wish you the best of luck with your application.</p>
    
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

      // Prepare attachments if CV is uploaded
      const attachments = [];
      if (cvBase64 && cvFileName && cvFileType) {
        attachments.push({
          filename: cvFileName,
          content: Buffer.from(cvBase64.split(',')[1], 'base64'),
          contentType: cvFileType,
        });
      }

      // Send the notification email to QuantHive careers
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"QuantHive Careers" <noreply@quanthive.in>',
        to: 'careers@quanthive.in',
        subject: `New Job Application: ${interestedRole} - ${fullName}`,
        text: emailContent,
        html: emailHtml,
        replyTo: email,
        attachments: attachments,
      });

      // Send auto-reply email to the applicant
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"QuantHive Careers" <noreply@quanthive.in>',
        to: email,
        subject: `Thank you for applying to QuantHive - ${interestedRole}`,
        text: autoReplyContent,
        html: autoReplyHtml,
      });

      console.log(`Application email sent to careers@quanthive.in from ${fullName}`);
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
    console.error('Job application submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again later.' },
      { status: 500 }
    );
  }
} 