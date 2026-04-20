#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  PATHIK — Quick Start Script
#  Run this from the /Pathik root folder: bash start.sh
# ═══════════════════════════════════════════════════════════

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

echo ""
echo "  ██████╗  █████╗ ████████╗██╗  ██╗██╗██╗  ██╗"
echo "  ██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██║██║ ██╔╝"
echo "  ██████╔╝███████║   ██║   ███████║██║█████╔╝ "
echo "  ██╔═══╝ ██╔══██║   ██║   ██╔══██║██║██╔═██╗ "
echo "  ██║     ██║  ██║   ██║   ██║  ██║██║██║  ██╗"
echo "  ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝"
echo "  Nepal's Premium Ride-Sharing App"
echo ""
echo "  Starting all services..."
echo "═══════════════════════════════════════════════════════════"

# ── Start Backend ──────────────────────────────────────────
echo ""
echo "  [1/2] 🚀 Starting Backend (NestJS) on http://localhost:3000"
osascript -e 'tell application "Terminal"
  do script "cd /Users/abhisekpaswan/Downloads/Pathik/pathik-backend && export PATH=\"/usr/local/bin:$PATH\" && npm run start:dev"
end tell'

sleep 3

# ── Start Mobile App ───────────────────────────────────────
echo "  [2/2] 📱 Starting Mobile App (Expo) — scan QR with Expo Go"
osascript -e 'tell application "Terminal"
  do script "cd /Users/abhisekpaswan/Downloads/Pathik/pathik-mobile && export PATH=\"/usr/local/bin:$PATH\" && npm start"
end tell'

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Both services started in new terminals!"
echo ""
echo "  Backend  → http://localhost:3000"
echo "  Mobile   → Scan QR code in Expo Go app"
echo ""
echo "  Test Creds (Khalti Sandbox):"
echo "  Phone: 9800000000 | MPIN: 1111 | OTP: 987654"
echo "═══════════════════════════════════════════════════════════"
