/**
 * Email Verification System (Simplified)
 * 2-Step Registration: Verify email before completing company setup
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { generateVerificationEmailHTML } from "./email";

/**
 * Verify email token and mark email as verified (Simplified)
 * Token validation: only checks expiration
 */
export const verifyEmailToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find user by token (no separate table)
    const user = await ctx.db
      .query("users")
      .withIndex("by_email_verification_token", (q) =>
        q.eq("email_verification_token", args.token)
      )
      .first();

    if (!user) {
      throw new Error("Token no válido");
    }

    // Check if expired (simplified - no "used" check)
    if (user.token_expires_at && user.token_expires_at < now) {
      throw new Error("Token expirado. Solicita uno nuevo.");
    }

    // Mark user email as verified and clear token
    await ctx.db.patch(user._id, {
      email_verified: true,
      email_verified_at: now,
      email_verification_token: undefined, // Clear token
      token_expires_at: undefined,
      updated_at: now,
    });

    return {
      success: true,
      message: "¡Email verificado exitosamente!",
      userId: user._id,
    };
  },
});

/**
 * Resend verification email (Simplified - no rate limiting)
 * Returns email HTML for Bubble to send
 */
export const resendVerificationEmail = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    // Find user
    const user = await ctx.runQuery(api.registration.getUserByEmail, {
      email: args.email,
    });

    if (!user) {
      throw new Error("Correo no encontrado");
    }

    if (user.email_verified) {
      throw new Error("Este email ya está verificado");
    }

    // Generate new simple token (6 digits)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Update user directly
    await ctx.runMutation(api.registration.updateUserVerificationToken, {
      userId: user._id,
      token: verificationToken,
      expiresAt: expiresAt,
    });

    // Generate email HTML for Bubble to send
    const { html: emailHtml, text: emailText } = generateVerificationEmailHTML(
      user.first_name || "Usuario",
      user.email,
      verificationToken
    );

    console.log(`[EMAIL] Resent verification token for ${args.email}: ${verificationToken}`);

    return {
      success: true,
      token: verificationToken, // For testing
      email: user.email,
      emailHtml,
      emailText,
      emailSubject: "🌱 Verifica tu email - Alquemist (Reenvío)",
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
