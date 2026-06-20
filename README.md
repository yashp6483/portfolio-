# Yash Patel - MERN Stack Developer Portfolio

This is a premium, attractive, animated, and fully responsive developer portfolio built specifically for Yash Patel using the **MERN Stack** (MongoDB, Express, React, Node.js). 

It features:
- **Design & Styling:** A custom modern dark theme with fluid glassmorphism, responsive grids, sleek typography, and glowing gradients.
- **Animations:** Dynamic entrance fade-ins, timeline slide-ins, scaling cards, interactive neon glows, and custom typing subtitles powered by **Framer Motion**.
- **Real Backend Integration:** A fully functional Express backend and Mongoose connection that captures, validates, and stores contact form submissions in a MongoDB database.
- **Structured Content:** A clean `config.js` content repository so details can be updated easily in one place.

---

## 📁 Directory Structure
```
portfolio/
├── package.json          # Root configuration for concurrent commands
├── README.md             # This instructions file
├── resume.pdf            # Original resume document
├── backend/              # Node.js & Express server application
│   ├── .env              # Server environment variables (port, db connection)
│   ├── package.json      # Backend dependencies (Express, Mongoose, Cors)
│   └── server.js         # API logic & Mongoose schema for contact form
└── frontend/             # React.js SPA (created via CRA, no Vite)
    ├── package.json      # React dependencies (Framer Motion, React Icons)
    ├── public/           # Static assets and index.html
    └── src/
        ├── App.js        # Main UI application layout and animations
        ├── index.css     # Premium styling system, animations & grids
        ├── index.js      # React DOM client entrypoint
        └── config.js     # Single source of truth for resume & social links
```

---

## 🛠️ Prerequisites
1. **Node.js** (v16.0.0 or higher recommended)
2. **MongoDB** (Ensure MongoDB is running locally at `mongodb://127.0.0.1:27017/portfolio` or get an Atlas Connection URI)

---

## 🚀 Getting Started

### 1. Install Dependencies
You can install dependencies for all workspaces (root, frontend, and backend) with a single command from the root directory:
```bash
npm run install-all
```

### 2. Configure Database Environment (Optional)
If you want to use MongoDB Atlas (online database), update the connection string inside [backend/.env](file:///C:/Users/yashp_bsxjuhj/Desktop/project/portfolio/backend/.env):
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/portfolio
```
*Otherwise, it defaults to a local running instance at `mongodb://127.0.0.1:27017/portfolio`.*

### 3. Run the Entire Project (Concurrently)
Launch both the frontend client and the backend server concurrently with:
```bash
npm run dev
```
- **Frontend** will start at: [http://localhost:3000](http://localhost:3000)
- **Backend API** will start at: [http://localhost:5000](http://localhost:5000)

---

## ✍️ Customizing Your Links & Information
All personal details, skills, experiences, and project repositories are defined inside [frontend/src/config.js](file:///C:/Users/yashp_bsxjuhj/Desktop/project/portfolio/frontend/src/config.js). 

To update your social links, repository URLs, or live websites:
1. Open [config.js](file:///C:/Users/yashp_bsxjuhj/Desktop/project/portfolio/frontend/src/config.js)
2. Edit the following fields under `personal`, `projects`, and `socials`:
   - `linkedin`: Add your LinkedIn URL
   - `github`: Add your Github profile URL
   - `website`: Add your personal portfolio link
   - `projects[].links.github`: Add the repository link for your projects
   - `projects[].links.live`: Add the hosting link for your projects
3. Save the file. The React dev-server will automatically reload the updates.
