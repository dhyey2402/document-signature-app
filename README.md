# SignFlow ✍️

SignFlow is a modern, full-stack Document Signature Platform designed to simplify the process of requesting, tracking, and applying digital signatures to PDF documents. Built with a sleek user interface and a robust API backend, it offers an end-to-end workflow for managing document lifecycles securely.

![SignFlow Dashboard Preview](./frontend/public/icon.png) 

## 🚀 Features

- **Authentication & Security:** Secure user registration and login using JWT.
- **Document Management:** Upload, store, and manage PDF documents effortlessly.
- **Interactive Field Placement:** Drag and drop signature fields precisely where recipients need to sign.
- **Public Signing Links:** Generate secure, unique URLs for external recipients to sign without needing an account.
- **Digital Signatures:** Recipients can draw their signature directly in the browser, which is then cryptographically merged into the final PDF.
- **Real-Time Audit Trail:** Comprehensive tracking of all document actions (Uploaded, Viewed, Signed, Rejected, Downloaded) for legal compliance.
- **Workflow & Notifications:** Monitor document lifecycles via the interactive Dashboard, Workflows tab, and dynamic Notification bell.
- **Interactive Guide:** Built-in master-detail onboarding tutorial.
- **Premium UI:** Fully responsive design with native Dark Mode support, built with Tailwind CSS.

## 🛠️ Technology Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (for styling and glassmorphism effects)
- **React Router** (for SPA navigation)
- **React Hot Toast** (for notifications)
- **Lucide React** (for crisp SVG icons)
- **Axios** (for API communication)

### Backend
- **Python 3.x**
- **FastAPI** (High-performance web framework)
- **SQLAlchemy** (ORM for database management)
- **PyMuPDF / reportlab** (for parsing and stamping PDFs)
- **SQLite** (Default database for local development)
- **Uvicorn** (ASGI server)

---

## ⚙️ Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the database migrations (if applicable) and start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend will run on `http://127.0.0.1:8000`*

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`*

---

## 📖 Usage Workflow

1. **Sign Up / Log In**: Create an account to access your personal dashboard.
2. **Upload a Document**: Click "Upload New Document" and select a PDF.
3. **Place Fields**: Click on the document in the list to open the viewer. Drag a signature field onto the document.
4. **Send for Signature**: Use the right-hand sidebar to enter a recipient's email and generate a signing link.
5. **Sign as Recipient**: Open the generated link in an incognito window. Click the field, draw a signature, and submit.
6. **Track & Download**: Go back to your dashboard, check the notifications, view the updated audit trail, and download the finalized signed PDF!

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
