# IoT Smart Garden - Water Level Monitoring System

## Project Overview

### What is this project?

The **IoT Smart Garden** is a comprehensive web-based monitoring and control system for automated garden irrigation. It provides real-time water level monitoring, automatic pump control, and detailed analytics through an intuitive dashboard interface.

### Key Features

- **Real-Time Monitoring**: Live water level readings from ultrasonic sensors via WebSocket connections
- **Automatic Pump Control**: Smart pump activation based on configurable water level thresholds
- **Manual Override**: Admin users can manually start/stop pumps when needed
- **Multi-Device Support**: Manage multiple IoT devices from a single dashboard
- **Historical Data**: View water level trends with interactive charts and detailed tables
- **User Management**: Role-based access control (Admin/User) with secure authentication
- **Threshold Configuration**: Set custom min/max water level thresholds per device
- **Data Export**: Export historical data to CSV for analysis
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vue.js)                    │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │
│  │ Dashboard  │  │   Device   │  │  User Management │   │
│  │            │  │ Management │  │                  │   │
│  └────────────┘  └────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                    REST API + WebSocket
                           │
┌─────────────────────────────────────────────────────────┐
│              Backend (Spring Boot - Java)               │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐     │
│  │   API    │  │ WebSocket│  │  Database (MySQL)  │     │
│  │  Server  │  │  Server  │  │                    │     │
│  └──────────┘  └──────────┘  └────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
                    MQTT Protocol
                           │
┌─────────────────────────────────────────────────────────┐
│                 IoT Devices (ESP32/Arduino)             │
│  ┌──────────────────┐  ┌──────────────────────────┐     │
│  │ Ultrasonic Sensor│  │  Water Pump Controller   │     │
│  │  (HC-SR04)       │  │  (Relay Module)          │     │
│  └──────────────────┘  └──────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Vue.js 3 (Composition API)
- Pinia (State Management)
- Vue Router (Navigation)
- Axios (HTTP Client)
- Chart.js / Recharts (Data Visualization)
- WebSocket (Real-time Communication)

---

## What We Need to Do

This README will guide you through:

1. **Installing Prerequisites** - Node.js, npm, Git
2. **Cloning the Repository** - Getting the project code
3. **Installing Dependencies** - Downloading all required packages
4. **Configuration** - Setting up environment variables
5. **Running the Frontend** - Starting the development server
6. **Building for Production** - Creating optimized production build
7. **Troubleshooting** - Common issues and solutions

---

## Requirements

### System Requirements

Before starting, ensure your system meets these requirements:

#### 1. **Node.js** (Required)
- **Minimum Version:** `18.x` or higher
- **Recommended Version:** `20.x LTS` (Long Term Support)
- **Why:** Vue 3 and modern build tools require Node.js 18+

**Check your current version:**
```bash
node --version
```

**If you see:** `v16.x.x` or lower → **You must upgrade!**

**Download Node.js:**
- Official Website: https://nodejs.org/
- Download the **LTS version** (recommended for most users)
- Windows: Download the `.msi` installer
- macOS: Download the `.pkg` installer or use Homebrew: `brew install node`
- Linux: Use your package manager or nvm (Node Version Manager)

**Using nvm (Recommended for developers):**
```bash
# Install nvm (Linux/macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install latest LTS version
nvm install --lts

# Use the installed version
nvm use --lts
```

#### 2. **npm** (Comes with Node.js)
- **Minimum Version:** `9.x` or higher
- **Comes bundled with Node.js** - no separate installation needed

**Check your version:**
```bash
npm --version
```

#### 3. **Git** (Required for cloning)
- **Any recent version**
- Download: https://git-scm.com/downloads

**Check your version:**
```bash
git --version
```

#### 4. **Code Editor** (Recommended)
- **Visual Studio Code** (Highly Recommended)
  - Download: https://code.visualstudio.com/
  - Extensions to install:
    - Vue Language Features (Volar)
    - ESLint
    - Prettier
    - Vue VSCode Snippets

#### 5. **Web Browser** (For testing)
- **Chrome** (Recommended) or **Firefox**
- Modern browser with WebSocket support

---

## Getting Started

### Step 1: Clone the Repository

```bash
# Clone the frontend repository
git clone 

# Navigate to the project directory
cd iot-smart-garden-frontend
```

### Step 2: Install Dependencies

This will download all required packages listed in `package.json`:

```bash
npm install
```

**What this does:**
- Downloads Vue.js and all its dependencies
- Installs Pinia for state management
- Installs Vue Router for navigation
- Installs Axios for API calls
- Installs Chart.js for data visualization
- Downloads all development tools (Vite, ESLint, etc.)

**Expected output:**
```
added 847 packages, and audited 848 packages in 45s

128 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**If you see errors:**

#### Error: "npm ERR! code ENOENT"
**Solution:** Make sure you're in the correct directory where `package.json` exists

#### Error: "npm ERR! ERESOLVE unable to resolve dependency tree"
**Solution:** Try with legacy peer dependencies:
```bash
npm install --legacy-peer-deps
```

#### Error: "gyp ERR! stack Error: not found: python"
**Solution:** Install Python (some packages need it for compilation)
```bash
# Windows (using Chocolatey)
choco install python

# macOS
brew install python

# Linux (Ubuntu/Debian)
sudo apt-get install python3
```

#### Error: "node: command not found"
**Solution:** Node.js is not installed or not in PATH. Reinstall Node.js

#### Error: Node version too old
**Solution:** Upgrade Node.js to version 18 or higher:
```bash
# Using nvm
nvm install 20
nvm use 20

# Or download from nodejs.org
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env

# Or create manually
touch .env
```

**Edit `.env` with your backend API configuration:**

```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8080/api

# WebSocket URL
VITE_WS_URL=ws://localhost:8080/ws

# Enable debug mode (optional)
VITE_DEBUG=true
```

**Important Notes:**
- Replace `localhost:8080` with your actual backend server URL
- For production, use your production domain (e.g., `https://api.yourdomain.com`)
- The `VITE_` prefix is required for Vite to expose these variables

### Step 4: Start the Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

**What this does:**
- Starts a local development server
- Enables hot module replacement (HMR) - changes reflect instantly
- Opens your default browser automatically
- Watches files for changes

**Access the application:**
- Open your browser
- Navigate to `http://localhost:5173/`
- You should see the login page

**Default port:** `5173`

**To use a different port:**
```bash
npm run dev -- --port 3000
```

---

## Building for Production

When you're ready to deploy:

```bash
npm run build
```

**What this does:**
- Creates optimized production files
- Minifies JavaScript and CSS
- Optimizes images and assets
- Outputs everything to the `dist/` folder

**Output location:** `./dist/`

**Deploy the dist folder to:**
- Netlify
- Vercel
- AWS S3 + CloudFront
- Nginx web server
- Apache web server
- Any static hosting service

**Example: Deploy to Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## Project Structure

```
iot-smart-garden-frontend/
├── public/                 # Static assets (favicon, robots.txt)
├── src/
│   ├── assets/            # Images, icons, fonts
│   ├── components/        # Reusable Vue components
│   │   ├── DeviceList.vue
│   │   ├── WaterLevelCard.vue
│   │   ├── ManualPumpControl.vue
│   │   ├── ThresholdControl.vue
│   │   ├── UserList.vue
│   │   └── ...
│   ├── views/             # Page-level components
│   │   ├── DashboardView.vue
│   │   ├── LoginView.vue
│   │   ├── DeviceManagementView.vue
│   │   └── UserManagementView.vue
│   ├── stores/            # Pinia state management
│   │   ├── auth.js        # Authentication state
│   │   ├── devices.js     # Device management
│   │   ├── sensors.js     # Sensor data & WebSocket
│   │   └── thresholds.js  # Threshold configuration
│   ├── router/            # Vue Router configuration
│   │   └── index.js
│   ├── utils/             # Utility functions
│   │   ├── api.js         # Axios API client
│   │   └── websocket.js   # WebSocket client
│   ├── App.vue            # Root component
│   └── main.js            # Application entry point
├── .env                   # Environment variables (create this)
├── .env.example           # Environment variables example
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

---

## Available Scripts

### Development
```bash
# Start development server with hot reload
npm run dev

# Start on specific port
npm run dev -- --port 3000

# Start with network access (access from other devices)
npm run dev -- --host
```

### Building
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Code Quality
```bash
# Lint code (check for errors)
npm run lint

# Format code with Prettier
npm run format

# Type check (if using TypeScript)
npm run type-check
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error:**
```
Port 5173 is already in use
```

**Solution 1:** Kill the process using the port
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9
```

**Solution 2:** Use a different port
```bash
npm run dev -- --port 3000
```

---

### Issue: "Cannot find module 'vue'"

**Error:**
```
Error: Cannot find module 'vue'
```

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

---

### Issue: API Connection Failed

**Error in console:**
```
Network Error: Failed to fetch
```

**Checklist:**
1. Is the backend server running?
2. Is the backend URL correct in `.env`?
3. Check CORS settings on backend
4. Check firewall settings

**Test backend connection:**
```bash
# Test if backend is responding
curl http://localhost:8080/api/health

# Or open in browser
http://localhost:8080/api/health
```

---

### Issue: WebSocket Connection Failed

**Error in console:**
```
WebSocket connection failed
```

**Solution:**
1. Verify WebSocket URL in `.env`
2. Ensure backend WebSocket endpoint is enabled
3. Check if proxy/firewall is blocking WebSocket connections
4. For HTTPS sites, use `wss://` instead of `ws://`

---

### Issue: "npm: command not found"

**Solution:** Node.js/npm not installed or not in PATH

```bash
# Verify installation
which node
which npm

# Reinstall Node.js if needed
# Download from: https://nodejs.org/
```

---

### Issue: Slow Installation

**Solution:** Use a faster npm registry

```bash
# Use npm mirror (China)
npm config set registry https://registry.npmmirror.com

# Or use Yarn instead
npm install -g yarn
yarn install
```

---

### Issue: Permission Denied (EACCES)

**Error:**
```
npm ERR! Error: EACCES: permission denied
```

**Solution (Linux/macOS):**
```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules

# Or use nvm instead of system Node.js
```

**Solution (Windows):**
- Run Command Prompt/PowerShell as Administrator
- Or change npm global directory to user folder

---

## Default Login Credentials

**For testing purposes only:**

```
Admin Account:
Username: admin
Password: admin123

```

**IMPORTANT:** Change these credentials in production!

---

## Additional Resources

### Documentation
- Vue.js Guide: https://vuejs.org/guide/
- Pinia Documentation: https://pinia.vuejs.org/
- Vite Guide: https://vitejs.dev/guide/
- Vue Router: https://router.vuejs.org/

### Getting Help
- Check the browser console for errors (F12 → Console)
- Check the network tab for API issues (F12 → Network)
- Read error messages carefully
- Search for similar issues on Stack Overflow

### Development Tools
- Vue DevTools: https://devtools.vuejs.org/
  - Chrome Extension: Install from Chrome Web Store
  - Inspect Vue components, state, and events

---

## Contributing

### Code Style
- Use Composition API (not Options API)
- Follow Vue.js style guide: https://vuejs.org/style-guide/
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

### Commit Messages
```bash
# Format
type(scope): description

# Examples
feat(dashboard): add real-time water level chart
fix(auth): resolve login token expiration issue
docs(readme): update installation instructions
```

---

## License

[Your License Here - e.g., MIT]

---

## Quick Start 

1- Node.js 18+ installed (`node --version`)
2- npm 9+ installed (`npm --version`)
3- Repository cloned
4- Navigate to project directory
5- Run `npm install`
6- Create `.env` file
7- Configure backend API URL
8- Run `npm run dev`
9- Open `http://localhost:5173`
10- Login with test credentials
11- Backend server is running
12- IoT device is connected

---
