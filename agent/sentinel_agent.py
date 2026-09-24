#!/usr/bin/env python3
"""
SentinelDesk Python Security Agent
-----------------------------------
Runs on endpoints (Kali Linux, Ubuntu, Debian) to monitor authentication logs
(e.g., /var/log/auth.log or /var/log/syslog), detect:
 1. SSH Brute-Force attacks (sliding window of repeated failures)
 2. Sudo Privilege Escalation anomalies (unauthorized sudo / multiple failures)
 3. Network Reconnaissance & Port Scans (nmap signatures / SYN floods)
and transmits correlated security alerts to the SentinelDesk SOC platform via /api/analyzer/analyze.
"""

import os
import sys
import time
import re
import json
import socket
import argparse
from datetime import datetime
from collections import defaultdict, deque
import urllib.request
import urllib.error

# Default Configuration
DEFAULT_SERVER_URL = os.getenv("SENTINEL_SERVER_URL", "http://localhost:3000")
DEFAULT_AGENT_KEY = os.getenv("SENTINEL_AGENT_KEY", "snt_agent_kali_sec_key_2026")
DEFAULT_AUTH_LOG = os.getenv("SENTINEL_LOG_PATH", "/var/log/auth.log")
DEFAULT_THRESHOLD = int(os.getenv("SENTINEL_THRESHOLD", "5"))
DEFAULT_WINDOW_SECONDS = int(os.getenv("SENTINEL_WINDOW_SECONDS", "60"))

# Detection Rule Patterns
SSH_FAILED_PATTERNS = [
    re.compile(r"Failed password for (?:invalid user )?(\S+) from (\d+\.\d+\.\d+\.\d+) port (\d+) ssh2", re.IGNORECASE),
    re.compile(r"Invalid user (\S+) from (\d+\.\d+\.\d+\.\d+) port (\d+)", re.IGNORECASE),
    re.compile(r"Failed (?:password|publickey) for (\S+) from (\d+\.\d+\.\d+\.\d+) port (\d+)", re.IGNORECASE),
    re.compile(r"authentication failure;.*rhost=(\d+\.\d+\.\d+\.\d+).*user=(\S+)", re.IGNORECASE),
]

SUDO_PRIV_ESCALATION_PATTERNS = [
    re.compile(r"sudo:\s+(\S+)\s*:\s*(\d+)\s+incorrect password attempts", re.IGNORECASE),
    re.compile(r"sudo:\s+(\S+)\s*:\s*user NOT in sudoers\s*;\s*TTY=\S+\s*;\s*PWD=\S+\s*;\s*USER=(\S+)\s*;\s*COMMAND=(.+)", re.IGNORECASE),
    re.compile(r"sudo:\s+(\S+)\s*:\s*TTY=\S+\s*;\s*PWD=\S+\s*;\s*USER=root\s*;\s*COMMAND=(?:/bin/bash|/bin/sh|/usr/bin/su|/bin/dash)", re.IGNORECASE),
]

PORT_SCAN_PATTERNS = [
    re.compile(r"(?:nmap|masscan|zmap|scan).*from (\d+\.\d+\.\d+\.\d+)", re.IGNORECASE),
    re.compile(r"SYN_FLOOD.*SRC=(\d+\.\d+\.\d+\.\d+).*DST=(\d+\.\d+\.\d+\.\d+)", re.IGNORECASE),
    re.compile(r"UFW BLOCK.*SRC=(\d+\.\d+\.\d+\.\d+).*DST=(\d+\.\d+\.\d+\.\d+).*PROTO=(TCP|UDP)", re.IGNORECASE),
]

class SentinelSecurityAgent:
    def __init__(self, server_url, agent_key, log_file, threshold=5, window=60, hostname=None):
        self.server_url = server_url.rstrip("/")
        self.endpoint_url = f"{self.server_url}/api/analyzer/analyze"
        self.agent_key = agent_key
        self.log_file = log_file
        self.threshold = threshold
        self.window = window
        self.hostname = hostname or socket.gethostname() or "kali-endpoint-lab"
        
        # Sliding windows for SSH and Port Scan
        self.ip_failures = defaultdict(deque)
        self.ip_recent_logs = defaultdict(list)
        self.scan_failures = defaultdict(deque)
        
        # Cooldown dictionary per IP + rule to prevent alert flooding
        self.alert_cooldown = {}

        print(f"[+] Sentinel Security Agent Initialized")
        print(f"    - Endpoint Hostname   : {self.hostname}")
        print(f"    - Target SOC Server   : {self.endpoint_url}")
        print(f"    - Auth Log Target     : {self.log_file}")
        print(f"    - Rule 1 (SSH Brute)  : {self.threshold} failures within {self.window}s window")
        print(f"    - Rule 2 (Sudo Escal) : Immediate trigger on unauthorized root/sudo attempts")
        print(f"    - Rule 3 (Port Scan)  : Detection on rapid firewall drops / reconnaissance signatures")

    def parse_log_line(self, line):
        """Parse raw syslog line across multiple cybersecurity detection rules."""
        # 1. Check SSH Failed Password
        for pattern in SSH_FAILED_PATTERNS:
            match = pattern.search(line)
            if match:
                groups = match.groups()
                if len(groups) >= 3 and "." in groups[1]:
                    username, source_ip, port = groups[0], groups[1], groups[2]
                elif len(groups) >= 2 and "." in groups[0]:
                    source_ip, username = groups[0], groups[1]
                    port = 22
                elif len(groups) >= 2 and "." in groups[1]:
                    username, source_ip = groups[0], groups[1]
                    port = 22
                else:
                    continue
                return {
                    "rule": "SSH_BRUTE_FORCE",
                    "source_ip": source_ip,
                    "username": username,
                    "port": int(port) if str(port).isdigit() else 22,
                    "raw_line": line.strip()
                }

        # 2. Check Sudo Privilege Escalation
        for pattern in SUDO_PRIV_ESCALATION_PATTERNS:
            match = pattern.search(line)
            if match:
                username = match.group(1)
                return {
                    "rule": "PRIVILEGE_ESCALATION",
                    "source_ip": "127.0.0.1",
                    "username": username,
                    "port": 0,
                    "raw_line": line.strip()
                }

        # 3. Check Port Scan / Recon
        for pattern in PORT_SCAN_PATTERNS:
            match = pattern.search(line)
            if match:
                source_ip = match.group(1)
                return {
                    "rule": "PORT_SCAN",
                    "source_ip": source_ip,
                    "username": "network-scanner",
                    "port": 0,
                    "raw_line": line.strip()
                }

        return None

    def process_event(self, event):
        """Evaluate matched event against thresholds and dispatch alerts."""
        rule = event["rule"]
        now = time.time()

        # Handler for SSH Brute Force (Sliding Window)
        if rule == "SSH_BRUTE_FORCE":
            source_ip = event["source_ip"]
            window_start = now - self.window
            timestamps = self.ip_failures[source_ip]
            while timestamps and timestamps[0] < window_start:
                timestamps.popleft()

            timestamps.append(now)
            self.ip_recent_logs[source_ip].append(event)
            failure_count = len(timestamps)
            print(f"[*] [SSH_FAIL] IP: {source_ip} | User: {event['username']} | Count in {self.window}s: {failure_count}/{self.threshold}")

            if failure_count >= self.threshold:
                cooldown_key = f"ssh_{source_ip}"
                if now - self.alert_cooldown.get(cooldown_key, 0) > self.window:
                    self.alert_cooldown[cooldown_key] = now
                    self.dispatch_alert(
                        rule="Brute Force",
                        source_ip=source_ip,
                        username=event["username"],
                        count=failure_count,
                        severity="HIGH" if failure_count < 10 else "CRITICAL",
                        title=f"SSH Brute Force: {failure_count} Failed Logins on {self.hostname}",
                        description=f"Endpoint Security Agent detected {failure_count} repeated SSH authentication failures from {source_ip} targeting user '{event['username']}' on host {self.hostname} within {self.window}s.",
                        raw_events=self.ip_recent_logs[source_ip]
                    )
                    self.ip_failures[source_ip].clear()
                    self.ip_recent_logs[source_ip].clear()

        # Handler for Sudo Privilege Escalation (Instant Trigger)
        elif rule == "PRIVILEGE_ESCALATION":
            user = event["username"]
            cooldown_key = f"sudo_{user}"
            if now - self.alert_cooldown.get(cooldown_key, 0) > 30:
                self.alert_cooldown[cooldown_key] = now
                print(f"[!] >>> DETECTION RULE MATCHED: Privilege Escalation by '{user}' <<<")
                self.dispatch_alert(
                    rule="Privilege Escalation",
                    source_ip="127.0.0.1",
                    username=user,
                    count=1,
                    severity="CRITICAL",
                    title=f"Privilege Escalation: Unauthorized Sudo Execution on {self.hostname}",
                    description=f"Endpoint agent observed unauthorized sudo/root escalation attempt by user '{user}'. Raw log: {event['raw_line']}",
                    raw_events=[event]
                )

        # Handler for Port Scan
        elif rule == "PORT_SCAN":
            source_ip = event["source_ip"]
            window_start = now - self.window
            timestamps = self.scan_failures[source_ip]
            while timestamps and timestamps[0] < window_start:
                timestamps.popleft()
            timestamps.append(now)
            count = len(timestamps)
            if count >= 3:
                cooldown_key = f"scan_{source_ip}"
                if now - self.alert_cooldown.get(cooldown_key, 0) > self.window:
                    self.alert_cooldown[cooldown_key] = now
                    print(f"[!] >>> DETECTION RULE MATCHED: Port Reconnaissance from {source_ip} <<<")
                    self.dispatch_alert(
                        rule="Port Scan",
                        source_ip=source_ip,
                        username="anonymous",
                        count=count,
                        severity="MEDIUM",
                        title=f"Port Reconnaissance Sweep: {source_ip} on {self.hostname}",
                        description=f"Multiple rapid probe or firewall drop indicators observed from source {source_ip} across endpoint interface.",
                        raw_events=[event]
                    )
                    self.scan_failures[source_ip].clear()

    def dispatch_alert(self, rule, source_ip, username, count, severity, title, description, raw_events):
        """Construct alert payload and transmit to SentinelDesk /api/analyzer/analyze."""
        payload = {
            "eventType": rule.upper().replace(" ", "_"),
            "sourceIp": source_ip,
            "destinationIp": "10.0.4.15",
            "sourcePort": raw_events[-1].get("port", 54112) if raw_events else 54112,
            "destinationPort": 22 if "SSH" in rule or "Brute" in rule else 0,
            "protocol": "SSH" if "SSH" in rule or "Brute" in rule else "LOCAL",
            "username": username,
            "hostname": self.hostname,
            "eventCount": count,
            "timeWindowSeconds": self.window,
            "severity": severity,
            "title": title,
            "description": description,
            "rawLogs": [e.get("raw_line") for e in raw_events]
        }

        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                self.endpoint_url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "X-Agent-Key": self.agent_key,
                    "User-Agent": "SentinelDesk-Python-Agent/1.0"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                print(f"[+] Alert successfully ingested by SOC server!")
                print(f"    - Alert ID : {res_json.get('alertId')}")
                print(f"    - Title    : {title}")
                print(f"    - Severity : {severity}\n")
        except urllib.error.HTTPError as http_err:
            print(f"[-] HTTP Error sending alert to SOC: {http_err.code} - {http_err.read().decode('utf-8')}")
        except Exception as err:
            print(f"[-] Network Error communicating with SentinelDesk server: {err}")

    def run_live_monitor(self):
        """Continuously tail authentication log file (similar to tail -F)."""
        if not os.path.exists(self.log_file):
            print(f"[-] Log file '{self.log_file}' not found.")
            print(f"    Tip: On Kali Linux / Debian, ensure /var/log/auth.log exists or run with sudo.")
            print(f"    Tip: For testing on Windows or local systems, use --simulate to trigger mock attacks.")
            sys.exit(1)

        print(f"[*] Listening for live logs on {self.log_file}...")
        with open(self.log_file, "r", encoding="utf-8", errors="ignore") as f:
            f.seek(0, os.SEEK_END)
            while True:
                line = f.readline()
                if line:
                    event = self.parse_log_line(line)
                    if event:
                        self.process_event(event)
                else:
                    time.sleep(0.5)

    def simulate_attack(self, attack_type="ssh", attacker_ip="192.168.1.188", target_user="root", count=5):
        """Simulate realistic security attacks for testing."""
        if attack_type == "ssh":
            print(f"\n[+] SIMULATION: Injecting {count} failed SSH attempts from {attacker_ip} for user '{target_user}'...")
            for i in range(1, count + 1):
                mock_line = f"Sep 25 {datetime.now().strftime('%H:%M:%S')} {self.hostname} sshd[{10420+i}]: Failed password for {target_user} from {attacker_ip} port {50000+i} ssh2"
                print(f"    [{i}/{count}] {mock_line}")
                event = self.parse_log_line(mock_line)
                if event:
                    self.process_event(event)
                time.sleep(0.3)

        elif attack_type == "sudo":
            print(f"\n[+] SIMULATION: Injecting unauthorized sudo privilege escalation attempt for user '{target_user}'...")
            mock_line = f"Sep 25 {datetime.now().strftime('%H:%M:%S')} {self.hostname} sudo: {target_user} : user NOT in sudoers ; TTY=pts/2 ; PWD=/home/{target_user} ; USER=root ; COMMAND=/bin/bash"
            print(f"    [1/1] {mock_line}")
            event = self.parse_log_line(mock_line)
            if event:
                self.process_event(event)

        elif attack_type == "scan":
            print(f"\n[+] SIMULATION: Injecting network port reconnaissance signature from {attacker_ip}...")
            for i in range(1, 4):
                mock_line = f"Sep 25 {datetime.now().strftime('%H:%M:%S')} {self.hostname} kernel: [UFW BLOCK] IN=eth0 OUT= SRC={attacker_ip} DST=10.0.4.15 PROTO=TCP SPT={40000+i} DPT={80+i*100}"
                print(f"    [{i}/3] {mock_line}")
                event = self.parse_log_line(mock_line)
                if event:
                    self.process_event(event)
                time.sleep(0.3)

        print("[+] Simulation complete. Check your SentinelDesk SOC Dashboard at http://localhost:3000 to observe the real-time alert!\n")


def main():
    parser = argparse.ArgumentParser(description="SentinelDesk Python Endpoint Security Agent")
    parser.add_argument("--server", default=DEFAULT_SERVER_URL, help=f"SentinelDesk SOC URL (default: {DEFAULT_SERVER_URL})")
    parser.add_argument("--key", default=DEFAULT_AGENT_KEY, help="Agent authorization key (X-Agent-Key)")
    parser.add_argument("--log", default=DEFAULT_AUTH_LOG, help=f"Path to authentication log (default: {DEFAULT_AUTH_LOG})")
    parser.add_argument("--threshold", type=int, default=DEFAULT_THRESHOLD, help=f"Failed attempts threshold (default: {DEFAULT_THRESHOLD})")
    parser.add_argument("--window", type=int, default=DEFAULT_WINDOW_SECONDS, help=f"Time window in seconds (default: {DEFAULT_WINDOW_SECONDS})")
    parser.add_argument("--hostname", default=None, help="Endpoint identifier hostname")
    parser.add_argument("--simulate", action="store_true", help="Run in simulation mode to test detection immediately")
    parser.add_argument("--attack-type", choices=["ssh", "sudo", "scan"], default="ssh", help="Attack scenario for simulation (ssh, sudo, scan)")
    parser.add_argument("--attacker-ip", default="192.168.1.188", help="Attacker IP to use in simulation mode")
    parser.add_argument("--user", default="root", help="Target username for simulation")
    parser.add_argument("--count", type=int, default=6, help="Number of failed attempts in simulation")

    args = parser.parse_args()

    agent = SentinelSecurityAgent(
        server_url=args.server,
        agent_key=args.key,
        log_file=args.log,
        threshold=args.threshold,
        window=args.window,
        hostname=args.hostname
    )

    if args.simulate:
        agent.simulate_attack(
            attack_type=args.attack_type,
            attacker_ip=args.attacker_ip,
            target_user=args.user,
            count=args.count
        )
    else:
        agent.run_live_monitor()

if __name__ == "__main__":
    main()
