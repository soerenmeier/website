---
title: Setting Up SSH on a VPS
description: A step-by-step guide on configuring SSH for secure access to your VPS.
---

Setting up SSH (Secure Shell) on a Virtual Private Server (VPS) is crucial for secure remote management. After acquiring your VPS, you'll typically receive an IP address, a username, and a password. Here's a short guide to help you establish a secure SSH setup.

## Logging into Your VPS via SSH
Initially, you will log into your VPS using the provided credentials.


## Creating a New User
It's best practice to operate as a non-root user with sudo privileges. Here’s how to create one:

### 1. Become Root
Access the root account by entering:
```bash
su -
```

### 2. Add a New User
```bash
adduser [newusername]
```

### 3. Grant Sudo Privileges
```bash
# install sudo if needed
apt install sudo
usermod -aG sudo [newusername]
```

### 4. Remove the Old User
```bash
deluser --remove-home [oldusername]
```
If you encounter a message indicating that processes are still running, a system restart should resolve it.


## Adding SSH Keys
SSH keys offer a more secure way of logging into a server with SSH than using a password alone.

### 1. Ensure the SSH Directory Exists
On your server, check if the `~/.ssh` directory is present. If not, create it.
```bash
mkdir ~/.ssh
```

### 2. Add some keys
Add the to the following files:
```bash
nano ~/.ssh/authorized_keys
```

### 3. Update SSH Configuration
Edit the `/etc/ssh/sshd_config` file:
```
PasswordAuthentication no
```
This disables password-based logins, enforcing key authentication.

### 4. Restart SSH Service
Apply the changes by restarting the SSH service:
```bash
systemctl restart ssh
```


## Changing the Hostname
```bash
hostnamectl set-hostname [new-hostname]
```