import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

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

    // Send email using Resend
    try {
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey) {
        console.log('RESEND_API_KEY not found. Email data would be sent:', {
          to: 'csjalade2002@gmail.com',
          subject: subject,
          body: body,
          from: email
        });
        // For local testing without API key, just log the data
        // In production, this should always have an API key
      } else {
        const resend = new Resend(apiKey);
        
        const { data, error } = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: 'csjalade2002@gmail.com',
          subject: subject,
          html: `
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
          `
        });

        if (error) {
          console.error('Resend error:', error);
          // Don't fail the request if email sending fails
          // Just log it for now
        } else {
          console.log('Email sent successfully:', data);
        }
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
