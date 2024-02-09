---
title: Setting Up Gitlab on a VPS
description: A step-by-step guide on setting up gitlab.
---

Kellnr is a cargo registry

## Create the compose file
```yaml
version: "3.8"
services:
  kellnr:
    image: ghcr.io/kellnr/kellnr:5.1.2
    restart: unless-stopped
    ports:
      - "127.0.0.1:8124:8000"
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - "/data/kellnr/data:/opt/kdata"
    environment:
      - KELLNR_ORIGIN__HOSTNAME=kellnr.lvgd.ch
	  - KELLNR_REGISTRY__AUTH_REQUIRED=true
	  - KELLNR_ORIGIN__PORT=443
	  - KELLNR_ORIGIN__PROTOCOL=https
	  - KELLNR_POSTGRESQL__ENABLED=true
	  - KELLNR_POSTGRESQL__ADDRESS=host.docker.internal
	  - KELLNR_POSTGRESQL__USER=myuser
	  - KELLNR_POSTGRESQL__PWD=mypassword
```
