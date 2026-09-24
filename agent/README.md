# 🛡️ SentinelDesk — Python Security Agent (Kali Linux Lab)

The **SentinelDesk Python Security Agent** is an endpoint detection agent designed to run on a Linux / Kali Linux system. It monitors authentication logs (such as `/var/log/auth.log`), detects **SSH Brute-Force attacks** using a sliding-window heuristic, and transmits structured security events to the SentinelDesk SOC platform via the `/api/analyzer/analyze` endpoint.

---

## 🏗️ How It Works

1. **Log Monitoring**: The agent continuously monitors `/var/log/auth.log` in real time.
2. **Detection Rules**: Matches failed SSH login attempts (`Failed password for <user> from <ip>`).
3. **Sliding Window Heuristic**: Tracks attempts per source IP. If $\ge 5$ failures occur within a 60-second window, it triggers a **Brute Force** detection.
4. **Secure Dispatch**: Sends an authenticated JSON payload with `X-Agent-Key: snt_agent_kali_sec_key_2026` to `POST /api/analyzer/analyze`.
5. **Real-Time SOC Broadcast**: SentinelDesk ingests the alert and immediately pushes it across Server-Sent Events (SSE) and WebSockets to all active SOC analyst consoles.

---

## 🚀 Running on Kali Linux / Debian / Ubuntu

### 1. Requirements
- Python 3.8+ (comes pre-installed on Kali Linux)
- No third-party dependencies required (built entirely with standard library: `urllib`, `re`, `json`, `collections`).

### 2. Start Live Log Monitoring
```bash
sudo python3 sentinel_agent.py --server http://<YOUR_SOC_SERVER_IP>:3000 --log /var/log/auth.log
```

*(Note: `sudo` is required to read `/var/log/auth.log` on most Linux distributions).*

---

## 🧪 Testing and Simulation

### Option A: Immediate Simulation (Runs on Windows, macOS, or Linux)
You can test the entire pipeline without needing an active SSH attack by running:
```bash
python sentinel_agent.py --simulate --server http://localhost:3000
```
This generates 6 realistic failed SSH authentication logs in rapid succession. Within 2 seconds, you will see:
- The detection rule trigger in the terminal.
- An alert dispatched to `http://localhost:3000/api/analyzer/analyze`.
- The **SentinelDesk SOC Dashboard** pop up an alert with audio chime and live timeline updates!

---

### Option B: Real Attack in Kali Linux Lab using Hydra
From an attacker machine or terminal, launch a dictionary attack against the target SSH port:
```bash
hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://<TARGET_IP>
```
The SentinelDesk agent will immediately catch the attack, correlate the attacker's IP, and transmit the alert to the SOC dashboard.

---

## ⚙️ CLI Options & Configuration

| Flag | Default | Description |
| :--- | :--- | :--- |
| `--server` | `http://localhost:3000` | URL of the SentinelDesk SOC server |
| `--key` | `snt_agent_kali_sec_key_2026` | Agent authorization key (`X-Agent-Key`) |
| `--log` | `/var/log/auth.log` | Path to the auth log file |
| `--threshold`| `5` | Number of failed logins needed to trigger an alert |
| `--window` | `60` | Sliding detection window in seconds |
| `--simulate`| `False` | Run simulated attack burst for instant testing |
| `--attacker-ip`| `192.168.1.188` | Mock attacker IP for simulation mode |
