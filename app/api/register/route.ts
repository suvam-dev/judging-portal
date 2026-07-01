import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      username, 
      email, 
      password, 
      role, 
      panelId, 
      track, 
      projectName, 
      pptLink 
    } = body;

    if (!firstName || !lastName || !username || !email || !password || !role) {
      return NextResponse.json(
        { message: "All core fields are required." },
        { status: 400 }
      );
    }

    if (role === "admin") {
      return NextResponse.json(
        { message: "Forbidden: Cannot register as an administrator." },
        { status: 403 }
      );
    }

    if (role !== "participant" && role !== "judge") {
      return NextResponse.json(
        { message: "Invalid role specified." },
        { status: 400 }
      );
    }

    const duplicate = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (duplicate) {
      return NextResponse.json(
        { message: "Username or Email is already registered." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      firstName,
      lastName,
      username,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      role,
      panelId: role === "judge" ? parseInt(panelId, 10) : undefined,
    });

    await newUser.save();

    if (role === "participant" && projectName) {
      const { Team } = await import("@/models/Team");
      try {
        const newTeam = new Team({
          name: projectName,
          track: track,
          members: [{ name: `${firstName} ${lastName}`, email }],
          pitchTitle: projectName,
          summary: "No summary provided",
          pitchLink: pptLink || null,
          ownerUserId: newUser._id
        });
        await newTeam.save();

        newUser.teamId = newTeam._id;
        await newUser.save();
      } catch (teamError: any) {
        await newUser.deleteOne();
        const isDuplicate = teamError.code === 11000;
        return NextResponse.json(
          { message: isDuplicate
              ? `A team named "${projectName}" already exists. Please choose a different project name.`
              : "Failed to create your team. Please try again." },
          { status: 400 }
        );
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/teams");

    return NextResponse.json(
      { message: "Registration successful! Your account is pending approval.", user: { id: newUser._id, username: newUser.username, role: newUser.role } },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal Server Error occurred during registration." },
      { status: 500 }
    );
  }
}
