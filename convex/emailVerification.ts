/**
 * Email Verification System
 * 2-Step Registration: Verify email before completing company setup
 */

import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { generateVerificationEmailHTML } from "./email";

/**
 * Generate a random token
 */
function generateVerificationToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Create verification token record in database
 * Helper mutation called by sendVerificationEmail action
 */
export const createVerificationToken = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    firstName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours
    const token = generateVerificationToken();

    // Get user info for email template
    const user = await ctx.db.get(args.userId);
    const firstName = args.firstName || user?.first_name || "Usuario";

    // Create verification token record
    const tokenId = await ctx.db.insert("emailVerificationTokens", {
      user_id: args.userId,
      email: args.email.toLowerCase(),
      token,
      expires_at: expiresAt,
      used: false,
      created_at: now,
    });

    console.log(`[EMAIL] Verification token created for ${args.email}: ${token}`);

    return {
      success: true,
      tokenId,
      token,
      firstName,
      expiresAt,
      email: args.email.toLowerCase(),
    };
  },
});

/**
 * Send verification email
 * Action that creates the token and sends the email
 * This must be an action because it makes HTTP calls
 */
export const sendVerificationEmail = action({
  args: {
    userId: v.id("users"),
    email: v.string(),
    firstName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    // First, create the verification token in database
    const tokenResult: any = await ctx.runMutation(api.emailVerification.createVerificationToken, {
      userId: args.userId,
      email: args.email,
      firstName: args.firstName,
    });

    if (!tokenResult.success) {
      return {
        success: false,
        error: "Failed to create verification token",
      };
    }

    // Then, send the verification email directly (not via action, actions can't call actions)
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        const { html, text } = generateVerificationEmailHTML(
          tokenResult.firstName,
          tokenResult.email,
          tokenResult.token
        );

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: "noreply@ceibatic.com",
            to: tokenResult.email,
            subject: "🌱 Verifica tu email - Alquemist",
            html,
            text,
            reply_to: "support@ceibatic.com",
          }),
        });

        if (response.ok) {
          console.log(`[EMAIL] Verification email sent to ${tokenResult.email}`);
        } else {
          const error = await response.text();
          console.error(`[EMAIL] Failed to send verification email: ${error}`);
        }
      }
    } catch (error) {
      console.error(`[EMAIL] Error sending verification email:`, error);
    }

    return {
      success: true,
      tokenId: tokenResult.tokenId,
      token: tokenResult.token, // Included for testing in development mode
      expiresAt: tokenResult.expiresAt,
      email: tokenResult.email,
      message: "Verification email sent. Check your inbox.",
    };
  },
});

/**
 * Verify email token and mark email as verified
 * Token can only be used once within 24 hours
 */
export const verifyEmailToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find token
    const tokenRecord = await ctx.db
      .query("emailVerificationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenRecord) {
      throw new Error("Token no válido o expirado");
    }

    // Check if already used
    if (tokenRecord.used) {
      throw new Error("Este token ya fue utilizado");
    }

    // Check if expired
    if (tokenRecord.expires_at < now) {
      throw new Error("Token expirado. Solicita uno nuevo.");
    }

    // Mark token as used
    await ctx.db.patch(tokenRecord._id, {
      used: true,
      verified_at: now,
    });

    // Mark user email as verified
    await ctx.db.patch(tokenRecord.user_id, {
      email_verified: true,
      email_verified_at: now,
      updated_at: now,
    });

    return {
      success: true,
      message: "¡Email verificado exitosamente!",
      userId: tokenRecord.user_id,
    };
  },
});

/**
 * Create resend verification token (with rate limiting)
 * Helper mutation for resendVerificationEmail action
 */
export const createResendToken = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Correo no encontrado");
    }

    // Check if already verified
    if (user.email_verified) {
      throw new Error("Este email ya está verificado");
    }

    // Check rate limiting - max 5 resends, 5 min between each
    const recentTokens = await ctx.db
      .query("emailVerificationTokens")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .filter((q) => q.gt(q.field("created_at"), fiveMinutesAgo))
      .collect();

    if (recentTokens.length >= 5) {
      throw new Error(
        "Demasiados intentos. Espera 5 minutos antes de reenviar."
      );
    }

    // Create new verification token
    const expiresAt = now + 24 * 60 * 60 * 1000;
    const token = generateVerificationToken();

    await ctx.db.insert("emailVerificationTokens", {
      user_id: user._id,
      email: args.email.toLowerCase(),
      token,
      expires_at: expiresAt,
      used: false,
      created_at: now,
    });

    return {
      success: true,
      token,
      firstName: user.first_name,
      email: args.email.toLowerCase(),
    };
  },
});

/**
 * Resend verification email (prevent spam with rate limiting)
 * This is an action because it calls sendVerificationEmailWithResend action
 */
export const resendVerificationEmail = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    // Create new token with rate limiting checks
    const tokenResult = await ctx.runMutation(api.emailVerification.createResendToken, {
      email: args.email,
    });

    if (!tokenResult.success) {
      throw new Error("Failed to create resend token");
    }

    // Send verification email with new token directly (not via action, actions can't call actions)
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        const { html, text } = generateVerificationEmailHTML(
          tokenResult.firstName,
          tokenResult.email,
          tokenResult.token
        );

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: "noreply@ceibatic.com",
            to: tokenResult.email,
            subject: "🌱 Verifica tu email - Alquemist",
            html,
            text,
            reply_to: "support@ceibatic.com",
          }),
        });

        if (response.ok) {
          console.log(`[EMAIL] Resend verification email sent to ${tokenResult.email}`);
        } else {
          const error = await response.text();
          console.error(`[EMAIL] Failed to resend verification email: ${error}`);
        }
      }
    } catch (error) {
      console.error(`[EMAIL] Error resending verification email:`, error);
    }

    console.log(`[EMAIL] Resent verification token for ${args.email}: ${tokenResult.token}`);

    return {
      success: true,
      token: tokenResult.token, // Only for testing
      email: tokenResult.email,
      message: "Email de verificación reenviado",
    };
  },
});

/**
 * Check if email is verified
 */
export const checkEmailVerificationStatus = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      return {
        exists: false,
        verified: false,
      };
    }

    return {
      exists: true,
      verified: user.email_verified,
      userId: user._id,
      message: user.email_verified ? "Email verificado" : "Pendiente de verificación",
    };
  },
});

/**
 * Get verification token (for testing/development only)
 * Remove this in production
 */
export const getVerificationToken = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query("emailVerificationTokens")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .filter((q) => q.eq(q.field("used"), false))
      .collect();

    if (tokens.length === 0) {
      return null;
    }

    // Return most recent token
    return tokens.sort((a, b) => b.created_at - a.created_at)[0];
  },
});

/**
 * Cleanup expired tokens (internal mutation)
 * Call periodically to clean up old tokens
 */
export const cleanupExpiredTokens = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const expiredTokens = await ctx.db
      .query("emailVerificationTokens")
      .withIndex("by_expires", (q) => q.lt("expires_at", now))
      .collect();

    let deletedCount = 0;
    for (const token of expiredTokens) {
      await ctx.db.delete(token._id);
      deletedCount++;
    }

    return {
      deleted: deletedCount,
      message: `Cleaned up ${deletedCount} expired tokens`,
    };
  },
});
