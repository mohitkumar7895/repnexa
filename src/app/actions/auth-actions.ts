"use server";

import { db } from "@/lib/db";
import { signToken, clearSession, getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export interface AuthResponse {
  success?: boolean;
  error?: string;
  role?: string;
  redirectTo?: string;
}

export async function loginUser(formData: FormData): Promise<AuthResponse> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const targetPortal = formData.get("portal") as string; // 'super-admin' | 'partner' | optional

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  try {
    const [rows]: any = await db.query(
      `SELECT u.*, r.name as role_name 
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE LOWER(u.email) = ?
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return { error: "No account found with this email address." };
    }

    const user = rows[0];
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return { error: "Incorrect password. Please try again." };
    }

    if (user.status && user.status.toLowerCase() !== "active") {
      return { error: "Your account is inactive or suspended. Please contact platform support." };
    }

    const effectiveRole = (user.role || user.role_name || "").toUpperCase();

    // Determine redirect destination automatically by user's role
    let redirectTo = "/customer/dashboard";
    if (
      effectiveRole === "SUPER_ADMIN" ||
      effectiveRole === "ADMIN" ||
      effectiveRole === "OPERATIONS_MANAGER" ||
      effectiveRole === "VERIFICATION_OFFICER" ||
      effectiveRole === "DISPATCHER" ||
      effectiveRole === "SUPPORT_AGENT" ||
      effectiveRole === "FINANCE_MANAGER"
    ) {
      redirectTo = "/super-admin/dashboard";
    } else if (effectiveRole === "PARTNER") {
      redirectTo = "/partner/dashboard";
    } else {
      redirectTo = "/customer/dashboard";
    }

    // Sign JWT token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: effectiveRole,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return {
      success: true,
      role: effectiveRole,
      redirectTo,
    };
  } catch (error: any) {
    console.error("Login authentication error:", error);
    return { error: error.message || "An unexpected error occurred during login." };
  }
}

export async function logoutUser(redirectTo = "/") {
  await clearSession();
  redirect(redirectTo);
}

export async function registerAdmin(formData: FormData): Promise<AuthResponse> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password) {
    return { error: "Please enter your name, email, and password." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  if (confirmPassword && password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return { error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = `usr_admin_${Date.now()}`;
    const nameParts = name.split(" ");
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(" ") || "";

    const [userRes]: any = await db.query(
      `INSERT INTO users (uid, email, name, first_name, last_name, phone, password, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'SUPER_ADMIN', 'active')`,
      [uid, email, name, firstName, lastName, phone || null, hashedPassword]
    );

    try {
      await db.query(
        "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword]
      );
    } catch (e) {}

    const token = await signToken({
      id: userRes.insertId,
      email,
      role: "SUPER_ADMIN",
      name,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return {
      success: true,
      role: "SUPER_ADMIN",
      redirectTo: "/super-admin/dashboard",
    };
  } catch (error: any) {
    console.error("Admin registration error:", error);
    return { error: error.message || "An unexpected error occurred during registration." };
  }
}

/**
 * Super Admin changes password for any user (Partner, Staff, Customer) by User ID
 */
export async function changeUserPasswordByAdmin(
  targetUserId: number,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const session: any = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return { error: "Access denied: Only Super Admin can change user passwords." };
    }

    if (!newPassword || newPassword.length < 6) {
      return { error: "New password must be at least 6 characters long." };
    }

    const [userRows]: any = await db.query(
      "SELECT id, email, role FROM users WHERE id = ? LIMIT 1",
      [targetUserId]
    );

    if (userRows.length === 0) {
      return { error: "User account not found." };
    }

    const targetUser = userRows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update in users table
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, targetUserId]);

    // Also update admins table if user is an admin
    try {
      await db.query("UPDATE admins SET password = ? WHERE LOWER(email) = ?", [hashedPassword, targetUser.email.toLowerCase()]);
    } catch (e) {}

    revalidatePath("/super-admin/partners");
    revalidatePath("/super-admin/staff");
    revalidatePath("/super-admin/settings");

    return { success: true };
  } catch (error: any) {
    console.error("Super Admin password change error:", error);
    return { error: error.message || "Failed to update password." };
  }
}

/**
 * Super Admin resets password for any user by Email address
 */
export async function resetPasswordByEmailAdmin(
  email: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string; userName?: string }> {
  try {
    const session: any = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return { error: "Access denied: Only Super Admin can reset user passwords." };
    }

    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !newPassword) {
      return { error: "Email address and new password are required." };
    }

    if (newPassword.length < 6) {
      return { error: "New password must be at least 6 characters long." };
    }

    const [userRows]: any = await db.query(
      "SELECT id, email, first_name, last_name, role FROM users WHERE LOWER(email) = ? LIMIT 1",
      [cleanEmail]
    );

    if (userRows.length === 0) {
      return { error: `No user account found matching "${cleanEmail}".` };
    }

    const targetUser = userRows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update in users table
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, targetUser.id]);

    // Also update admins table if present
    try {
      await db.query("UPDATE admins SET password = ? WHERE LOWER(email) = ?", [hashedPassword, cleanEmail]);
    } catch (e) {}

    revalidatePath("/super-admin/partners");
    revalidatePath("/super-admin/staff");
    revalidatePath("/super-admin/settings");

    const userName = `${targetUser.first_name || ""} ${targetUser.last_name || ""}`.trim() || cleanEmail;
    return { success: true, userName };
  } catch (error: any) {
    console.error("Super Admin password reset by email error:", error);
    return { error: error.message || "Failed to reset password." };
  }
}

/**
 * Current Super Admin changes their own password
 */
export async function changeOwnPassword(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const session: any = await getSession();
    if (!session || !session.id) {
      return { error: "Authentication required. Please sign in again." };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!newPassword || newPassword.length < 6) {
      return { error: "New password must be at least 6 characters long." };
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return { error: "New password and confirmation do not match." };
    }

    // Verify user in db
    const [userRows]: any = await db.query(
      "SELECT id, email, password FROM users WHERE id = ? LIMIT 1",
      [session.id]
    );

    if (userRows.length === 0) {
      return { error: "Account not found." };
    }

    const user = userRows[0];

    // If current password provided, verify it
    if (currentPassword) {
      const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentValid) {
        return { error: "Current password is incorrect." };
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, session.id]);

    // Also update admins table if email exists
    try {
      await db.query("UPDATE admins SET password = ? WHERE LOWER(email) = ?", [hashedPassword, user.email.toLowerCase()]);
    } catch (e) {}

    revalidatePath("/super-admin/settings");
    revalidatePath("/super-admin/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("Change own password error:", error);
    return { error: error.message || "Failed to change password." };
  }
}

