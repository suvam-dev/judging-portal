import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "All login credentials are required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    }).select("+passwordHash");

    if (!user) {
      return NextResponse.json(
        { message: `Account not found.` },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        { message: `Your account is currently ${user.status}. Please contact an admin.` },
        { status: 403 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { message: "Invalid credentials. Password match failed." },
        { status: 401 }
      );
    }

    user.lastLoginAt = new Date();
    await user.save();

    await createSession(user);

    return NextResponse.json(
      { 
        message: "Login successful!", 
        user: { 
          id: user._id, 
          username: user.username, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role 
        } 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal Server Error occurred during login." },
      { status: 500 }
    );
  }
}
