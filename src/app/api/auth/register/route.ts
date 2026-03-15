import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getORM } from "@/db";
import { User } from "@/db/entities/User";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const orm = await getORM();
  const em = orm.em.fork();

  const existing = await em.findOne(User, { email });
  if (existing) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = em.create(User, {
    name,
    email,
    password: hashedPassword,
  });

  await em.persistAndFlush(user);

  return NextResponse.json(
    { data: { id: user.id, name: user.name, email: user.email } },
    { status: 201 }
  );
}
