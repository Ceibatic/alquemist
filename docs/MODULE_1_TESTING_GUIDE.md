# MODULE 1 - Local Testing Guide

**Module**: Authentication & Company Setup
**Branch**: `feature/module-1-auth-company-setup`
**Status**: Ready for Testing

---

## 🚀 Quick Start

### 1. Prerequisites Check

Make sure these services are running:

```bash
# Check Docker services
docker ps

# Should show 4 containers running:
# - alquemist-db (PostgreSQL)
# - alquemist-redis (Redis)
# - alquemist-minio (MinIO)
# - alquemist-mailhog (MailHog)
```

If not running:
```bash
npm run docker:up
```

### 2. Environment Setup

```bash
# Verify root .env.local exists
ls -la .env.local

# If missing, create it
cp .env.example .env.local
```

**Frontend Environment** (prevents ENOWORKSPACES warning):

The file `apps/web/.env.local` is already configured with:
- `NEXT_TELEMETRY_DISABLED=1` - Disables Next.js telemetry (fixes npm workspace error)
- `NEXT_PUBLIC_API_URL=http://localhost:8000` - Backend API URL

**Note**: This fixes the harmless `npm error code ENOWORKSPACES` message during Next.js startup.

### 3. Database Setup

```bash
# Ensure database schema is synced
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" npm run db:push

# Verify roles are seeded (needed for COMPANY_OWNER)
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" docker exec alquemist-db psql -U alquemist -d alquemist_dev -c "SELECT name, level FROM roles WHERE name LIKE '%OWNER%';"

# Should show COMPANY_OWNER role
```

If roles are missing, seed the database:
```bash
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" npm run db:seed
```

### 4. Install Dependencies

```bash
# Root dependencies
npm install

# API dependencies
cd apps/api
npm install

# Web dependencies
cd ../web
npm install

# Back to root
cd ../..
```

---

## 🖥️ Start Development Servers

Open **two terminal windows**:

### Terminal 1: Backend API

```bash
cd apps/api
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" PORT=8000 npm run dev
```

**Expected output**:
```
🚀 Alquemist API running on port 8000
{"level":30,"msg":"Server listening at http://0.0.0.0:8000"}
```

**Test it**:
```bash
# In another terminal
curl http://localhost:8000/api/auth/me
# Should return: {"error":"UNAUTHORIZED","message":"Sesión no encontrada..."}
```

### Terminal 2: Frontend (Next.js)

```bash
cd apps/web
npm run dev
```

**Expected output**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

**Open browser**: http://localhost:3000

---

## 🧪 Manual Testing Checklist

### Test 1: Registration Flow

1. **Navigate** to http://localhost:3000 (should redirect to `/registro`)

2. **Fill out the form**:
   - **Nombre(s)**: Juan
   - **Apellido(s)**: Pérez
   - **Correo Electrónico**: tu-email@example.com
   - **Contraseña**: Test123456 (min 8 chars)
   - **Confirmar Contraseña**: Test123456 (must match)
   - **Nombre de la Empresa**: Mi Cultivo Test
   - **Tipo de Entidad Comercial**: S.A.S - Sociedad por Acciones Simplificada
   - **Departamento**: Valle del Cauca (searchable)
   - **Municipio**: Cali (filtered by department)

3. **Click** "Crear Cuenta"

4. **Expected Result**:
   - ✅ Loading spinner appears
   - ✅ Redirect to `/dashboard`
   - ✅ See welcome message: "Bienvenido, Juan Pérez"
   - ✅ Company name displayed: "Mi Cultivo Test"
   - ✅ Session cookie set in browser (check DevTools → Application → Cookies)

5. **Check Database** (optional):
   ```bash
   DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" \
   docker exec alquemist-db psql -U alquemist -d alquemist_dev \
   -c "SELECT email, first_name, last_name FROM users ORDER BY created_at DESC LIMIT 1;"
   ```

---

### Test 2: Form Validation (Client-Side)

Try registering with **invalid data**:

**Missing fields**:
- Leave email empty → Shows "El correo electrónico es obligatorio"

**Invalid email**:
- Enter "notanemail" → Shows "Correo electrónico inválido"

**Short password**:
- Enter "123" → Shows "La contraseña debe tener al menos 8 caracteres"

**Mismatched passwords**:
- Password: "Test123456"
- Confirm: "Different123" → Shows "Las contraseñas no coinciden"

**Expected**: All errors appear in Spanish below respective fields

---

### Test 3: Server Validation

Try registering with **email that already exists**:

1. Register a user: test@example.com
2. Try registering again with same email
3. **Expected**: Error message "Este correo electrónico ya está registrado"

---

### Test 4: Login Flow

1. **Log out** from dashboard (click "Cerrar Sesión")
2. Should redirect to `/login`

3. **Navigate** to http://localhost:3000/login

4. **Fill out the form**:
   - **Correo Electrónico**: tu-email@example.com
   - **Contraseña**: Test123456

5. **Click** "Iniciar Sesión"

6. **Expected Result**:
   - ✅ Redirect to `/dashboard`
   - ✅ Welcome message with your name
   - ✅ Session cookie set

**Test invalid credentials**:
- Wrong password → "Email o contraseña incorrectos"
- Non-existent email → "Email o contraseña incorrectos"

---

### Test 5: Protected Routes

1. **Open browser in incognito/private mode**
2. Navigate directly to http://localhost:3000/dashboard
3. **Expected**: Redirect to `/login` (401 unauthorized)

4. **Log in** with valid credentials
5. Navigate to http://localhost:3000/dashboard
6. **Expected**: See dashboard (authorized)

---

### Test 6: Session Persistence

1. **Log in** successfully
2. **Refresh** the page (F5)
3. **Expected**: Still logged in, no redirect

4. **Close browser tab** and **reopen**
5. Navigate to http://localhost:3000/dashboard
6. **Expected**: Still logged in (session persists)

---

### Test 7: Logout

1. **While logged in**, click "Cerrar Sesión" button
2. **Expected**:
   - ✅ Redirect to `/login`
   - ✅ Session cookie cleared
   - ✅ Cannot access `/dashboard` anymore (redirects to `/login`)

---

### Test 8: Colombian Data

**Test Department Dropdown**:
1. Click department dropdown
2. **Expected**: See 22 Colombian departments (Antioquia, Atlántico, Bolívar, etc.)
3. Type "Valle" in search → Filter to "Valle del Cauca"

**Test Municipality Dropdown**:
1. Select department "Antioquia"
2. Click municipality dropdown
3. **Expected**: See municipalities like Medellín, Envigado, Itagüí, etc.

4. Change department to "Valle del Cauca"
5. **Expected**: Municipality dropdown updates to show Cali, Buenaventura, Palmira, etc.

**Test Business Entity Types**:
1. Click "Tipo de Entidad Comercial" dropdown
2. **Expected**: 5 options in Spanish:
   - S.A.S - Sociedad por Acciones Simplificada
   - S.A. - Sociedad Anónima
   - Ltda - Sociedad Limitada
   - E.U. - Empresa Unipersonal
   - Persona Natural

---

### Test 9: UI/UX

**Buttons**:
- ✅ Primary button: Yellow (#f5b700) with dark text
- ✅ Loading state: Spinner icon appears
- ✅ Disabled state: Reduced opacity, no cursor

**Inputs**:
- ✅ Focus: Blue ring appears
- ✅ Error: Red border + error message below
- ✅ Labels: Spanish text above input

**Forms**:
- ✅ Consistent spacing (gap-4)
- ✅ Responsive on mobile (test by resizing browser)

**Colors** (Colombian theme):
- ✅ Primary: Yellow (#f5b700)
- ✅ Accent: Green (#005611)
- ✅ Background: Light gray (#e7e7ef)

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Error**: `Environment variable not found: DATABASE_URL`

**Fix**:
```bash
# Make sure to include DATABASE_URL when starting
cd apps/api
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" npm run dev
```

Or create `.env` file in `apps/api/`:
```bash
# apps/api/.env
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev"
```

---

### Issue: "npm error code ENOWORKSPACES" during Next.js startup

**Error**:
```
npm error code ENOWORKSPACES
npm error This command does not support workspaces.
```

**Status**: ✅ **Harmless** - Next.js runs fine despite this message

**What's happening**:
- Next.js telemetry tries to run `npm config get registry`
- This command doesn't support monorepo workspaces in npm 10.9+
- Server continues running normally ("Ready in 2.5s")

**Already Fixed in MODULE 1**:
The file `apps/web/.env.local` contains `NEXT_TELEMETRY_DISABLED=1` which prevents this error.

**If you still see it**: Make sure `apps/web/.env.local` exists with:
```bash
NEXT_TELEMETRY_DISABLED=1
```

---

### Issue: "OWNER_ROLE_NOT_FOUND" error

**Fix**: Seed the database
```bash
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" npm run db:seed
```

Verify roles exist:
```bash
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" \
docker exec alquemist-db psql -U alquemist -d alquemist_dev \
-c "SELECT name FROM roles;"
```

---

### Issue: Frontend shows "Failed to fetch" or CORS errors

**Check**:
1. Backend is running on port 8000
2. Frontend is running on port 3000
3. Frontend is making requests to correct URL

**Verify in browser DevTools**:
- Network tab → Check request URL
- Should be: `http://localhost:8000/api/auth/...`

---

### Issue: Session not persisting

**Check cookies in browser**:
1. DevTools → Application → Cookies
2. Look for `alquemist_session` cookie
3. Should have `HttpOnly` and `SameSite=Lax` flags

**If missing**: Backend may not be setting cookie properly. Check backend logs for errors.

---

### Issue: Prisma errors

**Error**: "Can't reach database server"

**Fix**:
```bash
# Check PostgreSQL is running
docker ps | grep alquemist-db

# If not, start it
npm run docker:up

# Test connection
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" \
docker exec alquemist-db psql -U alquemist -d alquemist_dev -c "SELECT 1;"
```

---

## 🔍 API Testing (Command Line)

### Test Registration (curl)

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test-cli@example.com",
    "password": "SecurePass123",
    "companyName": "Test Company CLI",
    "businessEntityType": "SAS",
    "department": "Antioquia",
    "municipality": "Medellín"
  }' | python3 -m json.tool
```

**Expected**: JSON with `success: true`, user, company, role data

---

### Test Login (curl)

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test-cli@example.com",
    "password": "SecurePass123"
  }' | python3 -m json.tool
```

**Expected**: Session cookie saved to `cookies.txt`

---

### Test /me Endpoint (curl)

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -b cookies.txt | python3 -m json.tool
```

**Expected**: User, company, role data

---

### Test Logout (curl)

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -b cookies.txt | python3 -m json.tool
```

**Expected**: `{"success": true, "message": "Sesión cerrada exitosamente"}`

---

## 📊 Database Queries (Verification)

### Check registered users

```bash
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" \
docker exec alquemist-db psql -U alquemist -d alquemist_dev -c \
"SELECT u.email, u.first_name, u.last_name, c.name as company, r.display_name_es as role
FROM users u
JOIN companies c ON u.company_id = c.id
JOIN roles r ON u.role_id = r.id
ORDER BY u.created_at DESC
LIMIT 5;"
```

---

### Check sessions

```bash
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" \
docker exec alquemist-db psql -U alquemist -d alquemist_dev -c \
"SELECT s.id, u.email, s.expires_at
FROM sessions s
JOIN users u ON s.user_id = u.id
ORDER BY s.expires_at DESC
LIMIT 5;"
```

---

### Check companies

```bash
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" \
docker exec alquemist-db psql -U alquemist -d alquemist_dev -c \
"SELECT name, business_entity_type, colombian_department, created_at
FROM companies
ORDER BY created_at DESC
LIMIT 5;"
```

---

## ✅ Acceptance Criteria Checklist

Use this to verify MODULE 1 is fully working:

### Registration Flow
- [ ] User can access `/registro` page
- [ ] Form validates all required fields client-side
- [ ] Form shows Colombian business entity type dropdown
- [ ] Form shows department dropdown (22 options)
- [ ] Form shows municipality dropdown (filtered by selected department)
- [ ] Password must be 8+ characters
- [ ] Email validation (valid format)
- [ ] On submit, creates User + Company in single transaction
- [ ] User assigned "COMPANY_OWNER" role automatically
- [ ] Redirects to `/dashboard` after successful registration
- [ ] Shows validation errors in Spanish

### Login Flow
- [ ] User can access `/login` page
- [ ] Form validates email and password
- [ ] Incorrect credentials show error: "Email o contraseña incorrectos"
- [ ] Successful login creates session
- [ ] Redirects to `/dashboard` after login
- [ ] Shows validation errors in Spanish

### Session Management
- [ ] Logged-in user can access `/dashboard`
- [ ] Unauthenticated user redirected to `/login` when accessing `/dashboard`
- [ ] Session persists on page refresh
- [ ] User can log out (destroys session)
- [ ] After logout, redirects to `/login`

### Dashboard (Basic)
- [ ] Shows: "Bienvenido, [User Name]" (Welcome message)
- [ ] Shows company name
- [ ] Shows logout button
- [ ] Shows user details (email, role, business entity, department)

---

## 🎯 Success Criteria

**You're ready to merge when**:
- ✅ All acceptance criteria pass
- ✅ No console errors in browser
- ✅ No errors in backend logs
- ✅ Session persists across page refreshes
- ✅ All forms validate correctly
- ✅ Colombian data displays properly
- ✅ UI matches design system (yellow/green theme)

---

## 📝 Notes

- **Spanish-only**: All UI text is in Spanish (English in MODULE 4)
- **Email verification**: Deferred to MODULE 2
- **Password reset**: Deferred to MODULE 2
- **MFA**: Deferred to MODULE 4
- **Subscription**: Deferred to MODULE 3

---

## 🔗 Useful Links

- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Registration**: http://localhost:3000/registro
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard

---

**Happy Testing!** 🚀

If you encounter any issues, check the Troubleshooting section above or review backend logs for error details.
