# ⚡ Quick Reference - Alquemist

**Essential commands for daily development**

---

## 🚀 **First Time Setup (Second Computer)**

```bash
# 1. Clone repository
git clone git@github.com:ceibatic/alquemist.git
cd alquemist

# 2. Install everything
npm install && npm run docker:up && sleep 10

# 3. Setup database
npm run db:generate && npm run db:push && npm run db:seed

# 4. Start developing
npm run dev
```

---

## 💻 **Daily Workflow**

### **Start your day:**
```bash
git pull origin main                    # Get latest changes
npm install                             # Update dependencies
npm run docker:up                       # Start services
npm run dev                             # Start development
```

### **End your day:**
```bash
git add .                               # Stage changes
git commit -m "feat: your changes"     # Commit
git push origin your-branch             # Push to GitHub
npm run docker:down                     # Stop services (optional)
```

---

## 🔧 **Common Commands**

### **Git**
```bash
git status                              # Check status
git checkout -b feature/name            # New branch
git push origin branch-name             # Push branch
git pull origin main                    # Pull main
gh pr create                            # Create PR (with GitHub CLI)
```

### **Development**
```bash
npm run dev                             # Start all apps
npm run build                           # Build everything
npm run test                            # Run tests
npm run lint                            # Lint code
npm run type-check                      # Check types
```

### **Database**
```bash
npm run db:generate                     # Generate Prisma client
npm run db:push                         # Update database schema
npm run db:seed                         # Add sample data
npm run db:studio                       # Open database GUI
npm run db:reset                        # ⚠️ Reset database
```

### **Docker**
```bash
npm run docker:up                       # Start services
npm run docker:down                     # Stop services
npm run docker:logs                     # View logs
docker ps                               # Check running containers
```

---

## 🐛 **Troubleshooting**

### **Problem: "Can't connect to database"**
```bash
npm run docker:logs                     # Check logs
npm run docker:down                     # Stop
npm run docker:up                       # Restart
sleep 10                                # Wait
npm run db:push                         # Re-push schema
```

### **Problem: "Module not found"**
```bash
rm -rf node_modules package-lock.json   # Clean
npm install                             # Reinstall
npm run db:generate                     # Regenerate Prisma
```

### **Problem: "Port already in use"**
```bash
# Find process using port 5432
lsof -i :5432
# Or on Windows: netstat -ano | findstr :5432

# Kill process (replace PID)
kill -9 PID
# Or on Windows: taskkill /PID <PID> /F
```

### **Problem: "Git conflicts"**
```bash
git status                              # See conflicts
# Edit conflicting files manually
git add .                               # Stage resolved files
git commit -m "merge: resolve conflicts"
git push
```

### **Problem: "Docker services won't start"**
```bash
# Restart Docker Desktop
# Then:
npm run docker:down
docker system prune -f                  # Clean Docker
npm run docker:up
```

---

## 📦 **Service URLs**

```
Web App:          http://localhost:3000
API:              http://localhost:8000
Database Studio:  npm run db:studio
MinIO Console:    http://localhost:9001
Mailhog:          http://localhost:8025
```

---

## 🔑 **Login Credentials**

```
Owner:      carlos@cultivosvalleverde.com / AlquemistDev2025!
Manager:    maria@cultivosvalleverde.com / AlquemistDev2025!
Technician: juan@cultivosvalleverde.com / AlquemistDev2025!
```

---

## 📝 **Commit Message Format**

```
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code refactoring
test: adding tests
chore: maintenance

Example:
git commit -m "feat: add batch QR code scanning"
```

---

## 🎯 **Quick Actions**

```bash
# Reset everything and start fresh
npm run docker:down
docker system prune -f
rm -rf node_modules package-lock.json
git pull origin main
npm install
npm run docker:up && sleep 10
npm run db:generate && npm run db:push && npm run db:seed
npm run dev
```

```bash
# Update from main and continue feature
git checkout feature/your-branch
git pull origin main
npm install
npm run dev
```

```bash
# Create PR quickly
git add .
git commit -m "feat: your feature"
git push origin feature/your-branch
gh pr create --fill
```

---

## 🚨 **Emergency Commands**

```bash
# Stop everything immediately
npm run docker:down
pkill -f "node"
pkill -f "next"
pkill -f "tsx"
```

```bash
# Check system resources
docker stats                            # Docker resource usage
df -h                                   # Disk space
free -h                                 # RAM usage
```

---

## 📖 **Full Documentation**

- [GitHub Setup Guide](GITHUB_SETUP.md)
- [Development Guide](Development%20Setup%20Guide%20v4.0.md)
- [Database Schema](Alquemist%20-%20Database%20Schema%20&%20Colombian%20Seeds%20v4.0.md)

---

**Keep this handy! 🚀**
