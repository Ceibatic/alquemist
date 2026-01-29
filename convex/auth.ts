import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { ResendOTP } from "./ResendOTP";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      async profile(params, ctx) {
        const now = Date.now();

        // Buscar rol COMPANY_OWNER (el primer usuario que hace signup será el owner)
        let ownerRole = await ctx.db
          .query("roles")
          .filter((q) => q.eq(q.field("name"), "COMPANY_OWNER"))
          .first();

        // Fallback a cualquier rol si COMPANY_OWNER no existe (no debería pasar)
        if (!ownerRole) {
          const roles = await ctx.db.query("roles").collect();
          ownerRole = roles.sort((a, b) => (a.level || 99) - (b.level || 99))[0];
        }

        if (!ownerRole) {
          throw new ConvexError("Sistema no configurado correctamente. Contacta a soporte.");
        }

        // Seguir el mismo patrón que createUserFromInvitation en invitations.ts
        return {
          // Identidad
          email: (params.email as string).toLowerCase().trim(),
          first_name: (params.firstName as string) || "",
          last_name: (params.lastName as string) || "",
          phone: (params.phone as string) || undefined,

          // Email verification - Convex Auth lo maneja automáticamente
          // NO incluir email_verified ni email_verified_at aquí

          // Onboarding - Se completará después de crear empresa
          onboarding_completed: false,

          // Roles y acceso - REQUERIDOS
          role_id: ownerRole._id, // COMPANY_OWNER desde el inicio
          additional_role_ids: [],
          primary_facility_id: undefined, // Se asigna después de crear facility en onboarding
          accessible_facility_ids: [],
          accessible_area_ids: [],

          // Localización - Valores por defecto
          locale: "es",
          timezone: "America/Bogota",
          preferred_language: "es",

          // Seguridad - Valores por defecto
          mfa_enabled: false,
          failed_login_attempts: 0,

          // Estado - Usuario activo desde signup
          status: "active",

          // Timestamps
          created_at: now,
          updated_at: now,
        };
      },
      verify: ResendOTP,
      reset: ResendOTPPasswordReset,
      validatePasswordRequirements: (password: string) => {
        if (password.length < 8) {
          throw new ConvexError("La contraseña debe tener al menos 8 caracteres");
        }
        if (!/[A-Z]/.test(password)) {
          throw new ConvexError("La contraseña debe incluir al menos una mayúscula");
        }
        if (!/[a-z]/.test(password)) {
          throw new ConvexError("La contraseña debe incluir al menos una minúscula");
        }
        if (!/[0-9]/.test(password)) {
          throw new ConvexError("La contraseña debe incluir al menos un número");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          throw new ConvexError("La contraseña debe incluir al menos un carácter especial");
        }
      },
    }),
  ],
});
