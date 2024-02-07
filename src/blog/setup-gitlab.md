---
title: Setting Up Gitlab on a VPS
description: A step-by-step guide on setting up gitlab.
---

## Prepare folder
Create the folder you need: `config, logs, data`

Make sure they have the right rights: chown 1000:1000

## Compose file
```yaml
version: '3.6'
services:
  web:
    image: 'gitlab/gitlab-ce:latest'
    restart: always
    hostname: git.example.com
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'https://git.example.com'
        # Add any other gitlab.rb configuration here, each on its own line
        gitlab_rails['trusted_proxies'] = ['172.0.0.0/8']
        nginx['listen_port'] = 80
        nginx['listen_https'] = false
        nginx['real_ip_trusted_addresses'] = ['172.0.0.0/8']

        pages_external_url 'https://pages.example.com'
        gitlab_pages['enable'] = true
        gitlab_pages['access_control'] = true
        gitlab_pages['listen_proxy'] = '0.0.0.0:8090'
        gitlab_pages['internal_gitlab_server'] = 'http://127.0.0.1'
        pages_nginx['enable'] = false

        registry_external_url 'https://registry.example.com'
        registry_nginx['enable'] = false
        registry['enable'] = true
        registry['registry_http_addr'] = "0.0.0.0:5000"
    ports:
      - '127.0.0.1:280:80'
      - '22:22'
      - '127.0.0.1:380:5000'
      - '127.0.0.1:480:8090'
    volumes:
      - '/data/gitlab/config:/etc/gitlab'
      - '/data/gitlab/logs:/var/log/gitlab'
      - '/data/gitlab/data:/var/opt/gitlab'
    shm_size: '256m'
```

Check email settings

Execute docker compose up -d --pull always

## Runner yaml
```yaml
version: '3.6'
services:
  runner-1:
    image: 'gitlab/gitlab-runner:latest'
    restart: always
    volumes:
      - '/data/gitlab/runner-1/config:/etc/gitlab-runner'
      - '/var/run/docker.sock:/var/run/docker.sock'
```

## Nginx configuration
```
server {
	listen 80;
	server_name git.example.com;

	location / {
		return 301 https://git.example.com$request_uri;
	}
}

server {
	listen 443 ssl http2;
	server_name git.example.com;

	## tls
	ssl_certificate /etc/letsencrypt/live/git.example.com/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/git.example.com/privkey.pem;

	## Routing

	location / {
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_set_header X-Forwarded-Host $host;
		proxy_set_header X-Forwarded-Ssl on;

		client_max_body_size 0;
                proxy_buffering off;
                proxy_request_buffering off;

		proxy_pass http://127.0.0.1:280/;

		proxy_redirect default;
	}

	# redirect server error pages to the static page /50x.html
	error_page 500 502 503 504 /50x.html;
	location = /50x.html {
		root /usr/share/nginx/html;
	}
}

server {
	listen 80;
	server_name .pages.example.com;

	location / {
		return 301 https://$host$request_uri;
	}
}

server {
	listen 443 ssl http2;
	server_name .pages.example.com;

	## tls
	ssl_certificate /etc/letsencrypt/live/pages.example.com/fullchain.pem; # managed by Certbot
	ssl_certificate_key /etc/letsencrypt/live/pages.example.com/privkey.pem; # managed by Certbot

	## Routing

	location / {
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_set_header X-Forwarded-Host $host;
		proxy_set_header X-Forwarded-Ssl on;

		client_max_body_size 0;
		proxy_buffering off;
		proxy_request_buffering off;

		proxy_pass http://127.0.0.1:480/;

		proxy_redirect default;
	}

	# redirect server error pages to the static page /50x.html
	error_page 500 502 503 504 /50x.html;
	location = /50x.html {
		root /usr/share/nginx/html;
	}
}

server {
	listen 80;
	server_name registry.example.com;

	location / {
		return 301 https://registry.example.com$request_uri;
	}
}

server {
	listen 443 ssl http2;
	server_name registry.example.com;

	## tls
	ssl_certificate /etc/letsencrypt/live/registry.example.com/fullchain.pem; # managed by Certbot
	ssl_certificate_key /etc/letsencrypt/live/registry.example.com/privkey.pem; # managed by Certbot

	## Routing

	location / {
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		proxy_set_header X-Forwarded-Host $host;
		proxy_set_header X-Forwarded-Ssl on;

		client_max_body_size 0;
		proxy_buffering off;
		proxy_request_buffering off;

		proxy_pass http://127.0.0.1:380/;

		proxy_redirect default;
	}

	# redirect server error pages to the static page /50x.html
	error_page 500 502 503 504 /50x.html;
	location = /50x.html {
		root /usr/share/nginx/html;
	}
}
```

Get the root password to login:
```bash
docker exec -it gitlab-web-1 grep 'Password:' /etc/gitlab/initial_root_password
```