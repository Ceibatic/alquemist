import { z } from 'zod';

// Password validation schema (reusable)
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos 1 letra mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos 1 número')
  .regex(
    /[^A-Za-z0-9]/,
    'Debe contener al menos 1 carácter especial (!@#$%^&*)'
  );

// Email validation schema (reusable)
const emailSchema = z
  .string()
  .email('Correo electrónico inválido')
  .toLowerCase()
  .trim();

// Phone validation schema (optional Colombian format)
const phoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos')
  .optional()
  .or(z.literal(''));

// Signup Form Validation
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede exceder 50 caracteres')
      .trim(),
    lastName: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede exceder 50 caracteres')
      .trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: phoneSchema,
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

// Email Verification Form Validation
// Note: Backend generates 6-digit tokens
export const emailVerificationSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^[0-9]{6}$/, 'El código debe contener solo números'),
});

export type EmailVerificationFormValues = z.infer<
  typeof emailVerificationSchema
>;

// Company Setup Form Validation
export const companySetupSchema = z.object({
  name: z
    .string()
    .min(2, 'Nombre de empresa muy corto')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  businessType: z.enum(['SAS', 'SA', 'LTDA', 'EU', 'PersonaNatural'], {
    errorMap: () => ({ message: 'Debes seleccionar un tipo de negocio' }),
  }),
  industry: z.enum(['Cannabis', 'Cafe', 'Cacao', 'Flores', 'Mixto'], {
    errorMap: () => ({ message: 'Debes seleccionar una industria' }),
  }),
  departmentCode: z
    .string()
    .min(1, 'Debes seleccionar un departamento')
    .trim(),
  municipalityCode: z
    .string()
    .min(1, 'Debes seleccionar un municipio')
    .trim(),
});

export type CompanySetupFormValues = z.infer<typeof companySetupSchema>;

// Facility Basic Info Form Validation
export const facilityBasicInfoSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  licenseNumber: z
    .string()
    .min(1, 'El número de licencia es requerido')
    .max(50, 'El número de licencia no puede exceder 50 caracteres')
    .trim(),
  licenseType: z.enum(
    ['CultivoComercial', 'Investigacion', 'Procesamiento', 'Otro'],
    {
      errorMap: () => ({ message: 'Debes seleccionar un tipo de licencia' }),
    }
  ),
  licensedArea: z
    .number()
    .positive('El área debe ser un número positivo')
    .max(1000000, 'El área no puede exceder 1,000,000 m²'),
  primaryCrops: z
    .array(z.enum(['Cannabis', 'Cafe', 'Cacao', 'Flores']))
    .min(1, 'Debes seleccionar al menos un cultivo principal')
    .max(4, 'No puedes seleccionar más de 4 cultivos'),
});

export type FacilityBasicInfoFormValues = z.infer<
  typeof facilityBasicInfoSchema
>;

// Facility Location Form Validation
export const facilityLocationSchema = z.object({
  departmentCode: z
    .string()
    .min(1, 'Debes seleccionar un departamento')
    .trim(),
  municipalityCode: z
    .string()
    .min(1, 'Debes seleccionar un municipio')
    .trim(),
  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .trim(),
  latitude: z
    .number()
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida'),
  longitude: z
    .number()
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida'),
  climateZone: z.enum(['Tropical', 'Subtropical', 'Templado'], {
    errorMap: () => ({ message: 'Debes seleccionar una zona climática' }),
  }),
});

export type FacilityLocationFormValues = z.infer<
  typeof facilityLocationSchema
>;

// Combined Facility Form (Basic Info + Location)
export const facilityCompleteSchema = facilityBasicInfoSchema.merge(
  facilityLocationSchema
);

export type FacilityCompleteFormValues = z.infer<
  typeof facilityCompleteSchema
>;

// Login Form Validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Invitation Accept Form Validation
export const invitationAcceptSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: phoneSchema,
    language: z.enum(['es', 'en']).default('es'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type InvitationAcceptFormValues = z.infer<
  typeof invitationAcceptSchema
>;

// Password Requirements Checker (for UI)
export interface PasswordRequirement {
  regex: RegExp;
  label: string;
  met: boolean;
}

export const checkPasswordRequirements = (
  password: string
): PasswordRequirement[] => {
  return [
    {
      regex: /.{8,}/,
      label: 'Mínimo 8 caracteres',
      met: /.{8,}/.test(password),
    },
    {
      regex: /[A-Z]/,
      label: '1 letra mayúscula',
      met: /[A-Z]/.test(password),
    },
    {
      regex: /[0-9]/,
      label: '1 número',
      met: /[0-9]/.test(password),
    },
    {
      regex: /[^A-Za-z0-9]/,
      label: '1 carácter especial',
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
};

// Helper: Check if all password requirements are met
export const allPasswordRequirementsMet = (password: string): boolean => {
  return checkPasswordRequirements(password).every((req) => req.met);
};
