import { NextRequest, NextResponse } from "next/server";
import supabase from "@/app/lib/supabase";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, student_id, name } = body;

  // Create Supabase auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: student_id,
    email_confirm: true,
  });

  if (error) {
    console.log(error.message);
    return NextResponse.json(
      { message: "Error creating user", isSuccess: false },
      { status: 500 },
    );
  }

  // Send welcome email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Welcome to F1StackMind! 🎉",
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>You have been accepted as a member of F1StackMind!</p>
      <h3>Your Login Credentials:</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${student_id}</p>
      <p><strong>Download the app:</strong> <a href="your-app-link-here">Click here</a></p>
      <br/>
      <p>Please change your password after your first login!</p>
      <p>Welcome aboard! 🚀</p>
    `,
  });

  return NextResponse.json(
    {
      message: "Member created successfully!",
      isSuccess: true,
      userID: data.user.id,
    },
    { status: 200 },
  );
}
