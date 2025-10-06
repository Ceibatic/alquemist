# 🚀 MODULE 1 - Quick Start Guide

**Authentication & Company Setup** - Ready to test locally!

---

## ⚡ Super Quick Start (One Command)

```bash
./scripts/start-module1.sh
```

This will:
- ✅ Check Docker services
- ✅ Create .env.local if needed
- ✅ Install dependencies
- ✅ Seed database
- ✅ Open terminals for backend + frontend

Then open: **http://localhost:3000**

---

## 🧪 Test the API (Automated)

```bash
# Make sure backend is running first
./scripts/test-api.sh
```

Tests all endpoints:
- ✅ Registration
- ✅ Login
- ✅ /me (current user)
- ✅ Logout
- ✅ Session management

---

## 📝 Manual Testing

### Option 1: Use the automated script
```bash
./scripts/start-module1.sh
```

### Option 2: Manual setup (2 terminals)

**Terminal 1 - Backend:**
```bash
cd apps/api
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" PORT=8000 npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
```

---

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Registration**: http://localhost:3000/registro
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard (protected)

---

## ✅ Quick Test Checklist

1. **Register a user** at /registro:
   - Fill all fields (Name, Email, Password, Company, Business Type, Department, Municipality)
   - Click "Crear Cuenta"
   - Should redirect to /dashboard

2. **Check dashboard**:
   - See welcome message with your name
   - See company name
   - Click "Cerrar Sesión"

3. **Login** at /login:
   - Use same email/password
   - Should redirect to /dashboard

4. **Test protected route**:
   - Logout
   - Try to access /dashboard directly
   - Should redirect to /login (401)

---

## 🎨 What to Look For

**Colombian Features**:
- ✅ Yellow primary buttons (#f5b700)
- ✅ Green accents (#005611)
- ✅ Spanish labels and errors
- ✅ 22 Colombian departments in dropdown
- ✅ Municipalities filter by department
- ✅ 5 business entity types (S.A.S, S.A., Ltda, E.U., Persona Natural)

**Form Validation**:
- ✅ Red border on error
- ✅ Spanish error messages below fields
- ✅ Loading spinner on submit

**Session Management**:
- ✅ Session persists on page refresh
- ✅ Logout clears session
- ✅ Protected routes redirect to /login

---

## 🐛 Common Issues

### Backend won't start
```bash
# Make sure DATABASE_URL is set
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" npm run dev
```

### "OWNER_ROLE_NOT_FOUND"
```bash
# Seed the database
DATABASE_URL="postgresql://alquemist:alquemist_dev_2025@localhost:5432/alquemist_dev" npm run db:seed
```

### Docker not running
```bash
npm run docker:up
```

---

## 📚 Full Documentation

**Comprehensive Testing Guide**: [docs/MODULE_1_TESTING_GUIDE.md](docs/MODULE_1_TESTING_GUIDE.md)

Includes:
- 9 detailed test scenarios
- API testing with curl
- Database verification queries
- Troubleshooting guide
- Acceptance criteria checklist

---

## 🎯 Success Criteria

You're ready when:
- ✅ Can register new user
- ✅ Can login successfully
- ✅ Dashboard shows user info
- ✅ Can logout
- ✅ Protected routes work
- ✅ Colombian data displays correctly
- ✅ All forms validate in Spanish

---

## 🚀 Next Steps After Testing

1. **Merge to main** (create PR)
2. **Start MODULE 2** (Email Verification)
3. **Start MODULE 3** (Subscription & Payments)

---

**Need Help?** Check [docs/MODULE_1_TESTING_GUIDE.md](docs/MODULE_1_TESTING_GUIDE.md) for detailed troubleshooting.

**Happy Testing!** 🎉
