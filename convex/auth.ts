import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { ResendOTP } from "./ResendOTP";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: (params.email as string).toLowerCase().trim(),
          name: `${(params.firstName as string) || ""} ${(params.lastName as string) || ""}`.trim(),
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
