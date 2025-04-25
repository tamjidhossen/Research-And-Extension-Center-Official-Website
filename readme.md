# 🌐 Research & Extension Center, JKKNIU

**Live Site:** [https://researchcenter.jkkniu.edu.bd/](https://researchcenter.jkkniu.edu.bd/)

A modern web platform for research proposal management, peer review, and extension activities at Jatiya Kabi Kazi Nazrul Islam University.

---

## 🚀 Features

- Online proposal submission for students and teachers
- Double-blind peer review workflow
- Document management (upload/download forms, marking sheets, invoices)
- Admin dashboard for proposal tracking and fiscal year management
- Reviewer honorarium and invoice generation
- Notices & announcements module
- Responsive, accessible UI with light/dark mode

## 🏗️ Project Structure

```
├── Backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── db/
│   ├── uploads/
│   ├── app.js
│   └── Dockerfile
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── index.css
│   │   └── ...
│   ├── public/
│   ├── index.html
│   └── Dockerfile
├── docker-compose.yml
```

## 🖥️ Tech Stack

- **Frontend:** React, Tailwind, ShadCn
- **Backend:** Node, Express, MongoDB, JWT, Nodemailer
- **DevOps:** Docker, Docker Compose

## ⚡ Getting Started

### Prerequisites

- Node.js
- MongoDB
- Docker (optional)

### Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/tamjidhossen/Research-And-Extension-Center-Official-Website
   cd rec-website
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` in both `Backend/` and `Frontend/` and fill in the required values.

3. **Install dependencies:**
   ```sh
   cd Backend && npm install
   cd ../Frontend && npm install
   ```

4. **Run with Docker:**
   ```sh
   docker-compose up --build
   ```
   Or run backend and frontend separately for development.

## 📄 API Documentation

See [Api Documentation](Backend/documentation/api_documentation.md) for full API details.

## 👨‍💻 Contributors

- [Md. Tamjid Hossen](https://github.com/tamjidhossen)
- [Nabeel Ahsan](https://github.com/Nabeel-Ahsan7)

---

> Made with ❤️ at Jatiya Kabi Kazi Nazrul Islam University
