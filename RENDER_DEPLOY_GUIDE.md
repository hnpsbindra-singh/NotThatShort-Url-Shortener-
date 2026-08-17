# 🚀 Render Deployment Guide for NotThatShort Backend

This guide outlines how to deploy the Spring Boot backend on [Render](https://render.com) using Docker.

---

## 📁 Files Created for Render

| File | Purpose |
|---|---|
| [`Dockerfile`](file:///g:/UrlShortener/URLShortener/Dockerfile) | Multi-stage build (Maven 3.9 + Temurin 17 JRE) with container JVM flags |
| [`.dockerignore`](file:///g:/UrlShortener/URLShortener/.dockerignore) | Excludes `.git`, `target`, IDE files for fast build contexts |
| [`render.yaml`](file:///g:/UrlShortener/URLShortener/render.yaml) | Render Blueprint spec (if using Render Blueprint) |
| [`application.properties`](file:///g:/UrlShortener/URLShortener/src/main/resources/application.properties) | Updated to read from ENV vars with zero exposed credentials |

---

## 🛠️ Step-by-Step Deployment on Render

### Standard Web Service Setup

1. Log into **[dashboard.render.com](https://dashboard.render.com)**.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`NotThatShort-Url-Shortener-`).
4. Configure the service:
   - **Name**: `notthatshort-backend`
   - **Region**: Closest to your users (e.g., `Oregon (US West)` or `Singapore`)
   - **Root Directory**: Leave blank (if repo root is the Java project) or `URLShortener`
   - **Runtime / Environment**: **`Docker`**
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: `Free` or `Starter`
5. Scroll down to **Environment Variables** and add your keys:

```env
SPRING_MONGODB_URI = mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/CapstoneDB?retryWrites=true&w=majority
BREVO_API_KEY      = <your_brevo_api_key_from_brevo_dashboard>
BREVO_SENDER_EMAIL = <your_verified_sender_email>
BREVO_SENDER_NAME  = NotThatShort
REDIS_HOST         = <your_upstash_redis_host>
REDIS_PORT         = 6379
REDIS_USERNAME     = default
REDIS_PASSWORD     = <your_upstash_redis_password>
REDIS_SSL_ENABLED  = true
JWT_SECRET         = <your_256_bit_jwt_secret_string>
JWT_EXPIRATION     = 86400000
```

6. Click **Create Web Service**. Render will pull the repo, build the Docker image, and launch the service.

---

### ⚠️ Important Note on MongoDB
Make sure your MongoDB is hosted in the cloud (e.g. **MongoDB Atlas Free M0 cluster**) so your Render container can reach it.
In MongoDB Atlas:
- Under **Network Access**, ensure IP `0.0.0.0/0` (Allow Access from Anywhere) is added so Render's dynamic IP addresses can connect.

---

### 🌐 Updating Frontend with Your Backend URL
Once Render finishes deploying, copy your backend service URL (e.g., `https://notthatshort-backend.onrender.com`):
In your frontend (`url-shortener-frontend`), update `src/api/api.js` or set `VITE_API_BASE_URL` to point to your new Render backend URL!
