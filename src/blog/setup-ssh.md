---
title: Setup Ssh
description: How to setup ssh on a vps
---

After creating your vps you might receive an ip, a username and a password to login into you're vps.

Log into you're vps via ssh.

## create a new user
First of all make sure you're root, `su -`.
```bash
## become root
su -
## add a new user
adduser username
## add the user to the sudo group
usermod -aG sudo username
## remove the previous user
deluser --remove-home oldusername
## If you get some process is still running restart the machine
## this should fix it
```

## add ssh keys
To add ssh keys, we need to make sure the folder `~/.ssh` exists on the server. The key can then be added to `~/.ssh/authorized_keys`.

In the file `/etc/ssh/sshd_config` the following lines need to be set / updated:
```
PasswordAuthentication no
```
and then ssh can be restarted: `systemctl restart ssh`

## Install sudo
Become root `su -`


```bash
apt install sudo
# give the user the sudo group
usermod -aG sudo username
```

Change password with `passwd`

## change hostname
`hostnamectl set-hostname new-hostname`