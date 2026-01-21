FROM php:8.2-apache

# 1. Install system dependencies and MongoDB extension
# PECL is used to install PHP extensions (similar to npm install -g for global tools)
RUN apt-get update && apt-get install -y \
    libssl-dev \
    unzip \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb

# 2. Install Composer (Standard method)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 3. Enable Apache Rewrite Module (Crucial for Node-style routing)
RUN a2enmod rewrite

# 4. Set working directory
WORKDIR /var/www/html

# 5. Copy project files
# We copy composer files first to cache dependencies
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader

# Copy the rest of the application
COPY . .

# Generate the autoloader optimized
RUN composer dump-autoload --optimize

# 6. Point Apache to the 'public' directory (Security best practice)
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf
