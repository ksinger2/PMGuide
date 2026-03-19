# PMGuide Docker Setup (WSL + systemd)

Run PMGuide as an always-on service that auto-starts on Windows boot.

## Architecture

```
Windows Boot → Task Scheduler → WSL → systemd → Docker → PMGuide container
```

---

## Step 1: Enable systemd in WSL

```bash
# Edit wsl.conf
sudo nano /etc/wsl.conf
```

Add:
```ini
[boot]
systemd=true
```

Then restart WSL (from PowerShell as admin):
```powershell
wsl --shutdown
wsl
```

Verify:
```bash
systemctl --version
```

---

## Step 2: Install Docker Engine (not Docker Desktop)

```bash
# Remove old versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg

# Add Docker's GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repo
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Enable Docker with systemd
sudo systemctl enable docker
sudo systemctl start docker
```

Verify:
```bash
docker run hello-world
```

---

## Step 3: Build and Run PMGuide

```bash
cd /mnt/c/Users/[YourUser]/path/to/PMGuide

# Build the image
docker compose build

# Start the container
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

Test: http://localhost:3000

---

## Step 4: Windows Auto-Start

**Option A: PowerShell (as Admin)**
```powershell
$action = New-ScheduledTaskAction -Execute "wsl.exe" -Argument "-d Ubuntu -u root -- systemctl start docker"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName "StartWSLDocker" -Action $action -Trigger $trigger -Principal $principal -Settings $settings
```

**Option B: Task Scheduler GUI**
1. Open `taskschd.msc`
2. Create Basic Task → "StartWSLDocker"
3. Trigger: "When the computer starts"
4. Action: Start a program
   - Program: `wsl.exe`
   - Arguments: `-d Ubuntu`
5. Properties → "Run whether user is logged on or not"
6. Properties → "Run with highest privileges"

---

## Management Commands

```bash
# View logs
docker compose logs -f pmguide

# Restart
docker compose restart

# Stop
docker compose down

# Rebuild after code changes
docker compose build --no-cache
docker compose up -d
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| systemd not starting | Check Windows version (requires Win 11 or recent Win 10), verify `/etc/wsl.conf` syntax |
| Docker won't start | `sudo systemctl status docker`, uninstall Docker Desktop if present |
| Container won't restart | Verify `restart: always` in docker-compose.yml, check `docker ps -a` |
| Port 3000 blocked | Check Windows Firewall, verify container running with `docker ps` |

---

## Verification Checklist

- [ ] `/etc/wsl.conf` has `systemd=true`
- [ ] `systemctl status docker` shows active
- [ ] `docker compose up -d` starts PMGuide
- [ ] http://localhost:3000 loads PMGuide
- [ ] Task Scheduler has "StartWSLDocker"
- [ ] Reboot PC → PMGuide accessible
