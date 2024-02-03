---
title: Setting Up Postfix on a VPS
description: A step-by-step guide on configuring postfix to send emails.
---

Postfix can easely be installed with apt:
```bash
sudo apt install postfix
```
When the installation process start click on **Iternet Site** then enter the domain where by default you wan't to send emails from.

## Setup
```bash
sudo nano /etc/postfix/main.cf
```

First we wan't to make it possible that docker can communicate with postfix. Add the following CIDR to **mynetworks**:
```
172.16.0.0/12
```

To make sure emails to you're user from the system are sen't correctly edit the aliases file and add you're username name and email.
```bash
sudo nano /etc/aliases
## set the content
# username: your@email.com
```

Then to save the aliases call:
```bash
sudo newaliases
```

## Test
To test we need the mail command.
```bash
sudo apt install mailutils
```

Now we can send emails with:
```
echo "Test email body" | mail -s "Test Email Subject" your.email@example.com
```