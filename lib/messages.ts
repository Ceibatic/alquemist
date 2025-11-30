/**
 * Centralized Spanish messages for Alquemist
 *
 * This file contains all Spanish text used throughout the application.
 * When multi-language support is needed, this can be converted to:
 * - lib/messages/es.ts
 * - lib/messages/en.ts
 * And integrated with next-intl or similar i18n library
 */

export const messages = {
  common: {
    continue: 'Continuar',
    back: 'Volver',
    save: 'Guardar',
    cancel: 'Cancelar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    required: 'Campo requerido',
  },

  brand: {
    name: 'ALQUEMIST',
    tagline: 'Trazabilidad Agrícola',
  },

  auth: {
    login: {
      title: 'Iniciar Sesión',
      subtitle: 'Accede a tu cuenta de Alquemist',
      email: 'Correo Electrónico',
      emailPlaceholder: 'tu@email.com',
      password: 'Contraseña',
      rememberMe: 'Mantener sesión iniciada',
      forgotPassword: '¿Olvidaste tu contraseña?',
      submit: 'Iniciar Sesión',
      submitting: 'Iniciando sesión...',
      noAccount: '¿No tienes una cuenta?',
      signupLink: 'Regístrate',
      errors: {
        invalidCredentials: 'Credenciales inválidas',
        serverError: 'Error al iniciar sesión. Por favor intenta de nuevo.',
      },
    },

    signup: {
      title: 'Crear Cuenta',
      subtitle: 'Regístrate en Alquemist',
      firstName: 'Nombre',
      firstNamePlaceholder: 'Juan',
      lastName: 'Apellido',
      lastNamePlaceholder: 'Pérez',
      email: 'Correo Electrónico',
      emailPlaceholder: 'tu@email.com',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      phone: 'Teléfono (Opcional)',
      phonePlaceholder: '3001234567',
      terms: 'Acepto los términos y condiciones',
      submit: 'Crear Cuenta',
      submitting: 'Creando cuenta...',
      hasAccount: '¿Ya tienes una cuenta?',
      loginLink: 'Inicia sesión',
      checkingEmail: 'Verificando disponibilidad...',
      emailAvailable: 'Correo disponible',
      emailTaken: 'Este correo ya está registrado',
    },

    verifyEmail: {
      title: 'Verificar Correo',
      subtitle: 'Ingresa el código de verificación',
      sentTo: 'Enviamos un código de 6 dígitos a',
      codeLabel: 'Código de Verificación',
      codePlaceholder: 'Código de 6 dígitos',
      verify: 'Verificar',
      verifying: 'Verificando...',
      resend: 'Reenviar código',
      resending: 'Reenviando...',
      codeResent: '¡Código reenviado!',
      errors: {
        invalidCode: 'Código inválido',
        expiredCode: 'El código ha expirado',
      },
    },

    forgotPassword: {
      title: 'Recuperar Contraseña',
      subtitle: 'Funcionalidad en desarrollo',
      backToLogin: 'Volver a Iniciar Sesión',
    },
  },

  onboarding: {
    progress: {
      step: 'Paso',
      of: 'de',
    },

    companySetup: {
      title: 'Información de la Empresa',
      subtitle: 'Configura los datos de tu empresa para continuar',
      stepLabel: 'Paso 2 de 4 - Información de la Empresa',
      name: 'Nombre de la Empresa',
      namePlaceholder: 'Ej: Agroindustrias del Cauca S.A.S',
      businessType: 'Tipo de Negocio',
      businessTypePlaceholder: 'Selecciona el tipo de negocio',
      industry: 'Industria Principal',
      industryPlaceholder: 'Selecciona la industria',
      department: 'Departamento',
      municipality: 'Municipio',
      submit: 'Continuar',
      submitting: 'Guardando...',
    },

    facilityBasic: {
      title: 'Información Básica de la Instalación',
      subtitle: 'Configura los datos básicos de tu instalación agrícola',
      stepLabel: 'Paso 3 de 4 - Información de la Instalación (1/2)',
      name: 'Nombre de la Instalación',
      namePlaceholder: 'Ej: Finca La Esperanza',
      licenseNumber: 'Número de Licencia',
      licenseNumberPlaceholder: 'Ej: LIC-2024-001234',
      licenseType: 'Tipo de Licencia',
      licenseTypePlaceholder: 'Selecciona el tipo de licencia',
      licensedArea: 'Área Licenciada (m²)',
      licensedAreaPlaceholder: 'Ej: 5000',
      licensedAreaHelp: 'Área total autorizada para cultivo en metros cuadrados',
      primaryCrops: 'Cultivos Principales',
      submit: 'Continuar a Ubicación',
      submitting: 'Guardando...',
    },

    facilityLocation: {
      title: 'Ubicación de la Instalación',
      subtitle: 'Configura la ubicación geográfica de tu instalación',
      stepLabel: 'Paso 3 de 4 - Ubicación de la Instalación (2/2)',
      department: 'Departamento',
      municipality: 'Municipio',
      address: 'Dirección',
      addressPlaceholder: 'Ej: Vereda El Placer, Km 5 Vía Popayán',
      gpsCoordinates: 'Coordenadas GPS',
      latitude: 'Latitud',
      longitude: 'Longitud',
      climateZone: 'Zona Climática',
      climateZonePlaceholder: 'Selecciona la zona climática',
      submit: 'Completar Configuración',
      submitting: 'Creando instalación...',
      back: 'Volver a Información Básica',
    },

    setupComplete: {
      title: '¡Configuración Completa!',
      subtitle: 'Has completado exitosamente la configuración inicial de tu cuenta en Alquemist. Ya puedes comenzar a gestionar tu operación agrícola.',
      stepLabel: 'Paso 4 de 4 - Configuración Completa',
      companyRegistered: 'Empresa Registrada',
      companyRegisteredDesc: 'Tu empresa ha sido creada y configurada exitosamente',
      facilityConfigured: 'Instalación Configurada',
      facilityConfiguredDesc: 'Tu primera instalación agrícola está lista para operar',
      nextSteps: 'Próximos Pasos',
      nextStep1: 'Invita a miembros de tu equipo para colaborar',
      nextStep2: 'Registra tu primer lote de producción',
      nextStep3: 'Configura tus productos y variedades',
      nextStep4: 'Explora el panel de trazabilidad',
      goToDashboard: 'Ir al Dashboard',
      needHelp: '¿Necesitas ayuda?',
      visitHelp: 'Visita nuestro centro de ayuda',
    },
  },

  components: {
    passwordRequirements: {
      title: 'La contraseña debe contener:',
      minLength: 'Mínimo 8 caracteres',
      uppercase: '1 letra mayúscula',
      number: '1 número',
      special: '1 carácter especial',
    },

    countdown: {
      expiresIn: 'Expira en',
      expired: 'Expirado',
    },

    geolocation: {
      getLocation: 'Obtener Ubicación GPS',
      updateLocation: 'Actualizar Ubicación',
      gettingLocation: 'Obteniendo ubicación...',
      capturedCoordinates: 'Coordenadas GPS Capturadas:',
      latitude: 'Latitud',
      longitude: 'Longitud',
      accuracy: 'Precisión',
      errors: {
        notSupported: 'Tu navegador no soporta geolocalización',
        permissionDenied: 'Permiso denegado. Por favor habilita la ubicación.',
        unavailable: 'Ubicación no disponible. Intenta de nuevo.',
        timeout: 'Tiempo de espera agotado. Intenta de nuevo.',
        unknown: 'Error desconocido al obtener ubicación.',
      },
    },

    cascadingSelect: {
      selectDepartment: 'Selecciona un departamento',
      selectMunicipality: 'Selecciona un municipio',
      selectDepartmentFirst: 'Primero selecciona un departamento',
      noMunicipalities: 'No hay municipios disponibles',
    },

    checkboxGroup: {
      selected: 'seleccionada',
      selectedPlural: 'seleccionadas',
      option: 'opción',
      optionPlural: 'opciones',
      selectMinMax: 'Selecciona {min}-{max} opciones',
      selectMin: 'Mínimo {min} {option}',
      selectMax: 'Máximo {max} {option}',
    },
  },

  pages: {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Bienvenido a Alquemist - Panel de Control',
      underDevelopment: '(Panel principal en desarrollo)',
    },

    help: {
      title: 'Centro de Ayuda',
      subtitle: 'Documentación y soporte de Alquemist',
      underDevelopment: '(Centro de ayuda en desarrollo)',
    },

    notFound: {
      title: '404',
      subtitle: 'Página no encontrada',
      description: 'La página que buscas no existe o ha sido movida.',
      backHome: 'Volver al inicio',
    },
  },
} as const;

export type Messages = typeof messages;
