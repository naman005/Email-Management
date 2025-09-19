# Email Management System - Frontend

The **Frontend** of the Email Management System is built using **React** and **TypeScript**. It provides a modern and responsive interface for managing multiple email accounts, viewing emails, searching, and syncing folders in real-time.

---


## Tools & Libraries Used

- **React** – Core frontend library for building user interfaces  
- **TypeScript** – Strongly typed JavaScript for safer code  
- **Axios** – HTTP client for interacting with the backend API  
- **Tailwind CSS** – Utility-first CSS framework for styling  
- **React Toastify** – Notification system for success/error messages  
- **Lucide-React** – For modern, scalable icons  
---

## Features

- **Account Management**
  - Add, delete, and view multiple email accounts
  - Sync folders of selected accounts
  - Real-time account status display (Connected / Disconnected)
  
- **User Interface**
  - Responsive design for desktop and tablet
  - Tabbed interface for Accounts and Emails
  - Notifications for error handling

### Future-ready Features
  - Fetch and display emails for selected accounts
  - Email metadata: sender, recipient, subject, sent/received time, flags
  - Advanced search within accounts
  - Loading indicators for sync and search
  - Pagination support
  
### Future Improvements

  - Real-time email updates via WebSocket / EventEmitter
  - Folder-based navigation (Inbox, Sent, Drafts, etc.)
  - Bulk actions: mark as read/unread, delete, flag
  - Integration with analytics dashboards

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

### Set Up the Frontend
```bash
cd frontend
npm install
```
### Create a .env file/:
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SOCKET_URL=http://localhost:3001
VITE_API_BASE=http://localhost:3001/api
```
### Start the frontend:
```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`




