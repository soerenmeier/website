---
title: Setting Up Postgres on a VPS
description: A step-by-step guide to configure postgres.
---

Postgres installation starts with apt:
```bash
sudo apt install postgresql
```

## Set postgres password
After the installation we need to set the postgres password to be able to login via for example pgAdmin.

Switch to the postgres user:
```bash
sudo su postgres
```

then open a psql session and set the new password:
```bash
psql postgres postgres
\password postgres
```

## Change data folder
Changing the data folder can be useful if it should be stored in another volume or disk.
```bash
sudo systemctl stop postgresql
```

Now we need to move the folder to the new location:
```bash
# first create new folder
mkdir /data/postgres
sudo chown postgres:postgres postgres
# check where the previous location was
cat /etc/postgresql/*/main/postgresql.conf | grep data_directory
# then move it to the new location
sudo mv /var/lib/postgresql/*/main /data/postgres/data
# Now update data_directory with the new directory
```

## Change access rights (to allow docker)
Update listen_addresses to listen on all addresses in the file: `/etc/postgresql/*/main/postgresql.conf`
```
listen_addresses = '*'
```

### Modify pg_hba
We need to modify the Authentication file (`/etc/postgresql/*/main/pg_hba.conf`) to allow docker contains to connect but disable connections from the outside.

Add the following line:
```
host  all  all  172.16.0.0/12  scram-sha-256
```

## Store a backup
```bash
sudo su postgres
pg_dumpall -f /data/postgres/backup/dump
```

## Locale error
If you get an error like:
```
perl: warning: Please check that your locale settings:
```
Uncomment the language in `/etc/locale.gen` and call:
```bash
sudo locale-gen
```