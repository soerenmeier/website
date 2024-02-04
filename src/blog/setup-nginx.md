---
title: Setting Up Nginx on a VPS
description: A step-by-step guide on setting up nginx as a reverse proxy.
---

Let's install nginx with apt:
```bash
sudo apt install nginx
```

## Install certbot
```bash
sudo apt install certbot python3-certbot-nginx
```

## Add a default 80 configuration
With this default configuration we will be able to easely request a certificate from certbot.
```
server {
	listen 80 default_server;
	server_name my.domain;

	location / {
		return 301 https://my.domain$request_uri;
	}
}
```

## Add a certificate
```bash
sudo certbot
```
Once the certificate is generated, delete the previously created configuration and replace it with this one:
```
server {
	listen 80 default_server;
	server_name my.domain;

	location / {
		return 301 https://my.domain$request_uri;
	}
}

server {
	listen 443 ssl http2 default_server;
	server_name my.domain;

    if ($host != "my.domain") {
        return 301 https://my.domain$request_uri;
    }

	## tls
	ssl_certificate /etc/letsencrypt/live/my.domain/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/my.domain/privkey.pem;

	## gzip
	gzip on;
	gzip_types text/plain application/javascript application/json text/css;

	## Routing
	location / {
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;

		proxy_pass http://127.0.0.1:8080/;

		proxy_redirect default;
	}
}
```