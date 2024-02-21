---
title: Setting Up Kellnr on a VPS
description: A step-by-step guide on setting up kellnr.
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
      - KELLNR_ORIGIN__HOSTNAME=hostname
      - KELLNR_REGISTRY__AUTH_REQUIRED=true
      - KELLNR_ORIGIN__PORT=443
      - KELLNR_ORIGIN__PROTOCOL=https
      - KELLNR_POSTGRESQL__ENABLED=true
      - KELLNR_POSTGRESQL__ADDRESS=host.docker.internal
      - KELLNR_POSTGRESQL__USER=kellnr
      - KELLNR_POSTGRESQL__PWD=Apassword
```

## Setup the nginx config
```
server {
	listen 80;
	server_name hostname;

	location / {
		return 301 https://hostname$request_uri;
	}
}

server {
	listen 443 ssl http2;
	server_name hostname;

	## tls
	ssl_certificate /etc/letsencrypt/live/hostname/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/hostname/privkey.pem;

	## gzip
	gzip on;
	gzip_types text/plain application/javascript application/json text/css;

	## Routing
	location / {
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;

		proxy_pass http://127.0.0.1:8124/;

		proxy_redirect default;
	}
}
```