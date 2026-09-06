import { cookies } from "next/headers";
import crypto from "crypto";
import { recordActivityLog } from "@/db/repository";
import { getDb, schema } from "@/db";
import { eq, or } from "drizzle-orm";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  image?: string;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: string;
}

const COOKIE_NAME = "art_gallery_session";
const SECRET_KEY = process.env.BETTER_AUTH_SECRET || "art-gallery-secure-production-secret-2026";

// Built-in verified users for immediate access & demonstration
const DEFAULT_USERS: AuthUser[] = [
  {
    id: "35473d32-66ae-4fdd-9e7a-69680ff1d2f6",
    name: "Vishal (Admin)",
    email: "vishal",
    role: "ADMIN",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "usr-admin-1",
    name: "Elena Vance (Curator)",
    email: "curator@latelier-lumineux.art",
    role: "ADMIN",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "usr-collector-1",
    name: "Henrietta Sterling",
    email: "collector@haute-art.com",
    role: "USER",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  }
];

// Runtime user accounts map (persists during process lifetime)
const runtimeUsers: Map<string, { user: AuthUser; passwordHash: string }> = new Map();

// Initialize default users
function ensureDefaultUsers() {
  if (runtimeUsers.size === 0) {
    const vishalHash = hashPassword("2004");
    runtimeUsers.set("vishal", {
      user: DEFAULT_USERS[0],
      passwordHash: vishalHash,
    });

    const adminHash = hashPassword("Curator2026!");
    runtimeUsers.set("curator@latelier-lumineux.art", {
      user: DEFAULT_USERS[1],
      passwordHash: adminHash,
    });

    const collectorHash = hashPassword("Collector2026!");
    runtimeUsers.set("collector@haute-art.com", {
      user: DEFAULT_USERS[2],
      passwordHash: collectorHash,
    });
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.createHash("sha256").update(SECRET_KEY).digest("hex").substring(0, 16);
  return crypto.scryptSync(password, salt, 32).toString("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  const computed = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

export function signToken(payload: AuthUser): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSig = crypto.createHmac("sha256", SECRET_KEY).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    return parsed as AuthUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const user = verifyToken(token);
    if (!user) return null;

    return {
      user,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }
  return session.user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN: Admin privileges required");
  }
  return session.user;
}

export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = getDb();

  if (db) {
    try {
      let userRows = await db
        .select()
        .from(schema.users)
        .where(
          or(
            eq(schema.users.email, normalizedEmail),
            eq(schema.users.name, normalizedEmail)
          )
        )
        .limit(1);

      if (userRows.length === 0) {
        const matchedAccounts = await db
          .select()
          .from(schema.accounts)
          .where(eq(schema.accounts.accountId, normalizedEmail))
          .limit(1);
        if (matchedAccounts.length > 0) {
          userRows = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, matchedAccounts[0].userId))
            .limit(1);
        }
      }

      if (userRows.length > 0) {
        const u = userRows[0];
        const accountRows = await db
          .select()
          .from(schema.accounts)
          .where(eq(schema.accounts.userId, u.id))
          .limit(1);

        if (accountRows.length > 0 && accountRows[0].passwordHash) {
          if (verifyPassword(password, accountRows[0].passwordHash)) {
            const authUser: AuthUser = {
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role as "USER" | "ADMIN",
              image: u.image || undefined,
            };

            const token = signToken(authUser);
            const cookieStore = await cookies();
            cookieStore.set(COOKIE_NAME, token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 7 * 24 * 3600,
            });

            recordActivityLog(
              "USER_LOGIN",
              "auth",
              `User logged in: ${authUser.email} (${authUser.role})`,
              authUser.id
            );

            return { success: true, user: authUser };
          }
        }
      }
    } catch (e) {
      console.error("Database signIn failed:", e);
    }
  }

  // Fallback
  ensureDefaultUsers();
  const entry = runtimeUsers.get(normalizedEmail);
  if (!entry || !verifyPassword(password, entry.passwordHash)) {
    return { success: false, error: "Invalid ID/email or password" };
  }

  const token = signToken(entry.user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 3600,
  });

  recordActivityLog("USER_LOGIN", "auth", `User logged in: ${entry.user.email} (${entry.user.role})`);
  return { success: true, user: entry.user };
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const db = getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, normalizedEmail))
        .limit(1);

      if (existing.length > 0) {
        return { success: false, error: "An account with this email already exists" };
      }

      const passwordHash = hashPassword(password);
      const inserted = await db
        .insert(schema.users)
        .values({
          name: name.trim(),
          email: normalizedEmail,
          role: "USER",
        })
        .returning();

      const createdUser = inserted[0];
      await db.insert(schema.accounts).values({
        id: `acc-${Date.now()}`,
        userId: createdUser.id,
        accountId: normalizedEmail,
        providerId: "credential",
        passwordHash,
      });

      const authUser: AuthUser = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role as "USER" | "ADMIN",
      };

      const token = signToken(authUser);
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 3600,
      });

      recordActivityLog(
        "USER_REGISTER",
        "auth",
        `New user registered in DB: ${authUser.email}`,
        authUser.id
      );

      return { success: true, user: authUser };
    } catch (e) {
      console.error("Database signUp failed:", e);
    }
  }

  // Fallback
  ensureDefaultUsers();
  if (runtimeUsers.has(normalizedEmail)) {
    return { success: false, error: "An account with this email already exists" };
  }

  const newUser: AuthUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: normalizedEmail,
    role: "USER",
  };

  const passwordHash = hashPassword(password);
  runtimeUsers.set(normalizedEmail, { user: newUser, passwordHash });

  const token = signToken(newUser);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 3600,
  });

  recordActivityLog("USER_REGISTER", "auth", `New user registered: ${newUser.email}`);
  return { success: true, user: newUser };
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
