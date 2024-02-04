---
title: Setting Up Docker on a VPS
description: A step-by-step guide on setting up docker to run containers.
---

This guide is based on the one from [docker](https://docs.docker.com/engine/install/debian/)

## Install the apt repository
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

## Install docker
```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Give yourself permission to run docker without needing sudo:
```bash
sudo usermod -aG docker username
```

The easiest way to finish the installation is to restart you're server.

## Setup the first project
Write a compose.yaml file to the desired location, for example:
```
version: "3.8"
services:
  server:
    image: registry.gitlab.com/server
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - "/data/server/data:/data"
```

After login into youre registry with:
```bash
docker login registry.gitlab.com
```

You install and update the services:
```bash
docker compose up -d --pull always
```