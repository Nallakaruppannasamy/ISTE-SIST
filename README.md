
# ISTE SIST - Official Website & Admin Portal

A full-stack MERN application developed for the ISTE (International Society for Technical Education) Student Chapter at Sathyabama Institute of Science and Technology (SIST). This project includes a public-facing frontend for users and a comprehensive admin dashboard for management.

## 🚀 Features

### Public Frontend
- **Home:** Overview of ISTE SIST activities and mission.
- **Events:** View upcoming and past technical events.
- **Gallery:** A visual showcase of chapter activities.
- **Team:** Profiles of the student chapter members and leads.
- **Feedback:** A dedicated portal for users to provide suggestions.

### Admin Dashboard
- **Secure Authentication:** Protected login for administrators.
- **Event Management:** Create, update, and delete event listings.
- **Gallery Management:** Upload and manage images via Cloudinary.
- **Team Management:** Maintain up-to-date member information.
- **Feedback Viewer:** Access and review user-submitted feedback.

## 🛠️ Tech Stack

- **Frontend & Admin:** React 19, Vite, Tailwind CSS 4, Framer Motion, Lucide React, React Router 7.
- **Backend:** Node.js, Express 5, MongoDB (Mongoose 9).
- **Storage:** Cloudinary for image hosting.
- **Authentication:** JSON Web Tokens (JWT) and Bcrypt.js.
- **Deployment:** Optimized for Vercel with custom rewrite rules.

## 📂 Project Structure

```text
ISTE-SIST/
├── frontend/     # Public React application
├── admin/        # Administrative React dashboard
└── backend/       # Express API with MongoDB models

```

## ⚙️ Installation & Local Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ISTE-SIST

```

### 2. Backend Setup

Navigate to the backend folder, install dependencies, and create a `.env` file.

```bash
cd backend
npm install

```

**Environment Variables (.env):**

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password

```

Run the server:

```bash
npm run server

```

### 3. Frontend & Admin Setup

Repeat these steps for both `frontend/` and `admin/` directories:

```bash
npm install
npm run dev

```

## 🌐 Deployment

This project is configured for deployment on **Vercel**.

* **Frontend/Admin:** Use the Vite framework preset.
* **Backend:** The `vercel.json` ensures the Express server runs as a serverless function.

Ensure all environment variables are added to the Vercel dashboard for the backend project.

```

---

### How to Add This to Your Repository

You can add the `README.md` file using one of the two methods below:

#### Method 1: Using the GitHub Web Interface (Easiest)
1. Go to your repository on GitHub.
2. Click the **Add file** button and select **Create new file**.
3. Name the file `README.md`.
4. Copy and paste the content provided above into the editor.
5. Scroll down, write a commit message (e.g., "docs: add detailed README"), and click **Commit changes**.

#### Method 2: Using the Command Line (Terminal)
1. Navigate to the root directory of your project on your computer.
2. Create the file:
   - **Windows:** `type nul > README.md`
   - **Mac/Linux:** `touch README.md`
3. Open the file in your code editor (like VS Code) and paste the content above.
4. Save the file and run the following commands in your terminal:
   ```bash
   git add README.md
   git commit -m "docs: add detailed README"
   git push origin main

```
