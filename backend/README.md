# Email Management System - Backend

## Overview

This is the **backend** of the Email Management System, responsible for:

- Connecting to multiple email accounts via IMAP  
- Synchronizing emails across folders (INBOX, Sent, Drafts, Spam, etc.)  
- Storing email and account data in a MongoDB database  
- Providing a REST API for the frontend to fetch accounts and emails  

---

## 🛠 Tools & Technologies Used

- **Node.js** & **TypeScript** – Core backend language and type safety  
- **NestJS** – Framework for scalable, modular backend development  
- **MongoDB** – Database for accounts, emails, and analytics  
- **IMAP** – For connecting and fetching emails  
- **Mailparser** – Parsing email content into structured format  
- **EventEmitter2** – Real-time event handling  
- **Axios** – Internal API requests (optional)  
- **dotenv** – Environment configuration  

---

## 📚 Features

- **Account Management**: Add, remove, and manage multiple email accounts  
- **Email Synchronization**: Fetch emails from IMAP folders and store in MongoDB  
- **Folder Management**: Supports standard folders (INBOX, Drafts, Sent, Spam, Trash)  
- **Analytics**: Extract sender domain, identify ESP, analyze headers, calculate time delta  
- **Real-Time Updates**: Event-driven notifications for account status and new emails  
- **Automatic Reconnect**: Handles IMAP disconnections and reconnects automatically  

---

> The frontend communicates with api endpoints through a centralized `api.ts` service.  

---

## ⚡ Future Improvements

- **OAuth2 Support** for Gmail, Outlook, and other providers  
- **Real-Time Email Streaming** using WebSockets & Analytics

---

## **Setup Instructions**

### **Prerequisites**
- Node.js v18+  
- npm  
- Backend API running (default: `http://localhost:3001`)  

### **Clone Repository**
```bash
git clone <https://github.com/naman005/Email-Management.git>
```

### Set Up the Backend
```bash
cd backend
npm install
```
### Create a .env file/:
```bash
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
PORT=3001
```
### Start the backend:
```bash
npm run start:dev
```

Backend will run at: `http://localhost:3001`

