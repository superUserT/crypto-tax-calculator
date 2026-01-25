# Backend Server Documentation (Linux)

This document describes how to **install dependencies** and **run the backend server** on a **Linux system**.  
These instructions are written for Debian/Ubuntu-based distributions and PHP 8.3.

---

## System Requirements

- Linux (Debian/Ubuntu-based)
- PHP **8.3**
- Composer **2.x**
- Git (optional but recommended)

---

## PHP Extensions Required

The backend relies on Symfony and requires the following PHP extensions:

- xml (mandatory)
- intl
- mbstring
- curl
- zip
- pdo

Failure to install these extensions will prevent the application from booting.

---

## Installation Instructions

### 1. Install PHP and Required Extensions

Update package lists:

```bash
sudo apt update
````

Install PHP 8.3 and required extensions:

```bash
sudo apt install \
  php8.3 \
  php8.3-cli \
  php8.3-xml \
  php8.3-intl \
  php8.3-mbstring \
  php8.3-curl \
  php8.3-zip \
  php8.3-pdo
```

Verify PHP installation:

```bash
php --version
```

Verify XML extension is enabled:

```bash
php -m | grep xml
```

You should see output similar to:

```
libxml
SimpleXML
XML
XMLReader
XMLWriter
```

---

### 2. Install Composer

If Composer is not installed:

```bash
sudo apt install composer
```

Verify Composer installation:

```bash
composer --version
```

---

### 3. Install Project Dependencies

Navigate to the backend root directory (where `composer.json` is located):

```bash
cd backend
```

Install dependencies using the lock file:

```bash
composer install
```

This will create the `vendor/` directory and generate required autoload files.

---

## Running the Server

### 1. Start the PHP Development Server

From the backend root directory:

```bash
php -S localhost:8000 -t public
```

Expected output:

```
PHP 8.3.x Development Server (http://localhost:8000) started
```

---

### 2. Access the Server

* Base URL:
  `http://localhost:8000`

* API example:
  `http://localhost:8000/api`

The server must remain running in the terminal while the backend is in use.

---

## Common Issues

### Missing `autoload_runtime.php`

If you see an error similar to:

```
Failed opening required 'vendor/autoload_runtime.php'
```

This means Composer dependencies were not installed correctly.
Re-run:

```bash
composer install
```

---

### XML Extension Error During Composer Install

If Composer reports:

```
requires ext-xml -> it is missing from your system
```

Install the extension:

```bash
sudo apt install php8.3-xml
```

Then retry:

```bash
composer install
```

---

## Notes

* These instructions are **Linux-only**.
* The built-in PHP server is intended for **development use only**.
* For production deployments, use a proper web server such as **Nginx or Apache** with PHP-FPM.

---