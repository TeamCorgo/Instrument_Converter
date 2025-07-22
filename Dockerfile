# Use the latest Ubuntu image as the base
FROM ubuntu:latest

# Maintainer information
LABEL maintainer="NMBON Hunter Salazar <Hunter@corgo.org>"

# Install OS Features
RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx nano openssl tzdata && \
    rm -rf /var/lib/apt/lists/*

# Set the timezone to Denver (Mountain Time)
RUN ln -sf /usr/share/zoneinfo/America/Denver /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata

###################################################################

# Expose port 445
EXPOSE 445 

# Create cert directory
RUN mkdir -p /etc/nginx/certs

# Generate self-signed certificate
RUN openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/certs/cert.key \
    -out /etc/nginx/certs/cert.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Copy config and site content
COPY default.conf /etc/nginx/sites-available/default
COPY content/ /var/www/html/

# Make location for logs
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log /var/log/nginx/error.log

# Health check for Nginx
HEALTHCHECK --start-period=60s --interval=300s --timeout=60s --retries=3 \
    CMD curl -k -f http://127.0.0.1:443 || exit 1

# Make sure NGINX doesn't daemonize
CMD ["nginx", "-g", "daemon off;"]
