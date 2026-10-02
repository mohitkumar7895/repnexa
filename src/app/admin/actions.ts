"use server";

import { db, initDb } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

// Initialize database schema when this is first called
initDb().catch(console.error);

export async function registerAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result]: any = await db.execute(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );
    
    // Assign default role (e.g., ADMIN) to newly registered users
    const userId = result.insertId;
    const [roleRows]: any = await db.execute("SELECT id FROM roles WHERE name = 'ADMIN'");
    if (roleRows.length > 0) {
      await db.execute("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [userId, roleRows[0].id]);
    }

    return { success: true, message: "Admin registered successfully!" };
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return { error: "Email already exists" };
    }
    return { error: "Failed to register" };
  }
}

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const [rows]: any = await db.execute(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = ?
    `, [email]);

    if (rows.length === 0) {
      return { error: "Invalid email or password" };
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return { error: "Invalid email or password" };
    }

    if (user.status !== 'active') {
      return { error: "Your account is not active" };
    }

    // Generate JWT Token
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role_name
    };
    const token = await signToken(payload);

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return { success: true, message: "Logged in successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred during login" };
  }
}
