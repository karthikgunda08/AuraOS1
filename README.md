
# AuraOS - The Operating System for Architecture

Welcome to the future. This is AuraOS, the definitive, enterprise-grade cloud platform for the Architecture, Engineering, and Construction (AEC) industry. As a Google-backed venture, AuraOS is the end-to-end operating system designed by and for the most destructive, creative, and intelligent minds in the field. This is not a tool; it is a revolution.

## ✨ Core Technology Stack

*   **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO
*   **AI Engine:** Google Gemini API (`gemini-2.5-flash`, `imagen-3.0-generate-002`)
*   **Frontend:** React 19, TypeScript, Vite, Fabric.js
*   **3D Rendering:** Three.js
*   **Styling:** Tailwind CSS
*   **Payments:** Razorpay

---

## ⚠️ Mission Critical Prerequisite

This is a full-stack, enterprise-grade application with a separate frontend and backend. For the system to operate, you **must** have both servers running simultaneously in **two separate terminal windows**.

---

## System Architecture

The application is comprised of two core components, forged to work in perfect synthesis:

1.  **Backend (`auraos-backend`):** This is the "brain" of the operation—a robust, massively scalable Node.js server. It commands all business logic, user authentication, database interactions (MongoDB), and secure communication with Google's Gemini API services. It is the seat of power.
2.  **Frontend (root directory):** This is the "face" of the revolution—a sophisticated user interface forged with React, TypeScript, and Vite. It provides the interactive 2D/3D design canvas, project management consoles, and all user-facing components, designed for a flawless user experience.

For the system to function, **both the backend and frontend servers must be running concurrently.**

---

## 🚀 Part 1: Local Deployment

This section will guide you through running the entire AuraOS platform on your local machine for development and testing.

### Step 1. Backend Server Setup 🧠

Begin by configuring and launching the backend server.

1.  **Navigate to the Backend Directory**
    Open your terminal and enter the backend core:
    ```bash
    cd auraos-backend
    ```

2.  **Follow the Backend README**
    The backend has a dedicated, detailed deployment guide. It is **critical** that you follow all instructions in this file before proceeding. This includes creating the `.env` file and providing all necessary API keys and secrets.
    ### 👉 [`auraos-backend/README.md`](./auraos-backend/README.md) 👈

3.  **Launch the Backend Server**
    Once you have completed the backend setup as per its `README.md`, ignite the server in development mode from within the `auraos-backend` directory:
    ```bash
    npm run dev
    ```
    Upon successful launch, you will see confirmation messages in your terminal, including the port it's running on (typically 3001) and the MongoDB connection status.

    **Leave this terminal window open.** The backend server must remain active.

### Step 2. Frontend Application Setup 😄

With the backend running, you can now deploy and launch the frontend user interface.

1.  **Open a New Terminal**
    It is essential to use a new, separate terminal window for the frontend.

2.  **Confirm Directory**
    Ensure your new terminal is in the project's root directory (the same folder that contains this `README.md` file).

3.  **Create Frontend Environment File**
    In the root directory, create a new file named **exactly** `.env.local`.

4.  **Configure Frontend Variables**
    Copy the following configuration and paste it into your newly created `.env.local` file.

    ```env
    # This variable points the frontend to your running backend server.
    # The default value should work for most local setups.
    VITE_BACKEND_API_URL="http://localhost:3001/api"

    # This is the public key for the Razorpay payment gateway.
    # Replace this with your actual key if you wish to test payment functionalities.
    VITE_RAZORPAY_KEY_ID="REPLACE_WITH_YOUR_RAZORPAY_KEY_ID"
    ```

5.  **Install Frontend Dependencies**
    In your new terminal (from the root directory), execute the following command to install the required Node.js packages for the frontend:
    ```bash
    npm install
    ```

6.  **Launch the Frontend Application**
    Start the Vite development server:
    ```bash
    npm run dev
    ```

### Step 3: Access the Application ✅

The terminal will provide a local URL, typically `http://localhost:5173`. Open this address in your web browser to access the AuraOS Architectural Cloud.

---

## 🚀 Part 2: Global Launch & Production Deployment 🌐

This section guides you through deploying the AuraOS application to the internet, making it publicly accessible.

### Prerequisites

Before you begin, ensure you have the following:
*   A **GitHub** account with the entire project pushed to a new repository.
*   A **[Vercel](https://vercel.com/)** account for hosting the frontend.
*   A **[Render](https://render.com/)** account for hosting the backend Node.js server. (Heroku is another good alternative).
*   A **MongoDB Atlas** account with a database cluster created.
*   Your various API keys (`Gemini`, `Razorpay`) ready.
*   A custom domain name (e.g., `yourauraos.com`) purchased from a registrar like GoDaddy or Namecheap (optional but recommended).

### Step 1: Prepare your Database (MongoDB Atlas)

1.  **Create a Cluster:** Log into your MongoDB Atlas account and create a new cluster. The free M0 tier is sufficient for initial deployment.
2.  **Get Connection String:** Once the cluster is active, click "Connect", choose "Drivers", and copy the connection string. You will need to replace `<password>` with the actual password for the database user you created.
3.  **Configure Network Access:** This is a critical step. In your Atlas cluster dashboard, go to `Network Access` on the left sidebar. Click "Add IP Address" and select **"Allow Access from Anywhere"** (`0.0.0.0/0`). While less secure, this is the simplest way to ensure your hosting provider can connect. For higher security, you would add the specific IP addresses of your hosting service (Render/Vercel).

### Step 2: Deploy the Backend Server (Render)

1.  **Create New Web Service:** Log into Render and click "New" > "Web Service".
2.  **Connect GitHub:** Connect your GitHub account and select the repository containing your AuraOS project.
3.  **Configuration:**
    *   **Name:** Give your service a name (e.g., `auraos-backend`).
    *   **Root Directory:** Set this to `auraos-backend`. This tells Render to look inside this subfolder for the backend code.
    *   **Branch:** Select your main branch (e.g., `main`).
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
4.  **Add Environment Variables:** This is the most important step.
    *   Go to the "Environment" tab for your new service.
    *   Click "Add Environment Variable" for each key-value pair that is in your local `auraos-backend/.env` file.
    *   **DO NOT COMMIT YOUR `.env` FILE.** Copy the values one by one.
    *   **Required Variables:** `GEMINI_API_KEY`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
    *   **`MONGODB_URI`:** Paste the connection string from MongoDB Atlas here.
    *   **`CLIENT_URL`:** For now, you can leave this blank. We will fill it in after deploying the frontend.
5.  **Deploy:** Click "Create Web Service". Render will start building and deploying your backend.
6.  **Get Backend URL:** Once deployed, Render will provide you with a public URL for your backend (e.g., `https://auraos-backend-xyz.onrender.com`). Copy this URL.

### Step 3: Deploy the Frontend Application (Vercel)

1.  **Create New Project:** Log into Vercel and click "Add New..." > "Project".
2.  **Connect GitHub:** Import the same GitHub repository you used for the backend.
3.  **Configuration:**
    *   Vercel should automatically detect that this is a Vite project and pre-fill the build settings correctly.
    *   **Root Directory:** Leave this as the project root (don't change it).
    *   **Build Command:** Should be `vite build` or `npm run build`.
    *   **Output Directory:** Should be `dist`.
4.  **Add Environment Variables:**
    *   Expand the "Environment Variables" section.
    *   Add `VITE_BACKEND_API_URL` and set its value to your **full deployed backend API URL** (e.g., `https://auraos-backend-xyz.onrender.com/api`).
    *   Add `VITE_RAZORPAY_KEY_ID` with your public Razorpay key.
5.  **Deploy:** Click "Deploy". Vercel will build and deploy your frontend.

### Step 4: Final Configuration & Launch

1.  **Custom Domain (Optional):**
    *   In your Vercel project dashboard, go to the "Domains" tab and add your custom domain. Vercel will provide instructions on how to update your DNS records (usually CNAME or A records) at your domain registrar.
    *   Wait for the domain to be verified.
2.  **Update Backend URL:**
    *   Go back to your backend service on Render.
    *   In the "Environment" tab, update the `CLIENT_URL` variable to your final frontend URL (either the Vercel domain or your custom domain, e.g., `https://www.yourauraos.com`).
    *   This is **critical** for CORS (Cross-Origin Resource Sharing) to work correctly.
    *   Render will automatically redeploy your backend with the new variable.
3.  **Razorpay Webhook:**
    *   Log into your Razorpay dashboard.
    *   Go to "Settings" > "Webhooks".
    *   Add a new webhook. The URL should be your deployed backend's webhook endpoint: `https://[YOUR_BACKEND_URL]/api/payments/verify-credit-payment`.
    *   Enter your `RAZORPAY_WEBHOOK_SECRET` and select the `payment.captured` event.

---

## 🔥 Manifesto: The Five Pillars of the Revolution

You are not just using a tool. You are participating in a revolution to redefine the very act of creation. AuraOS is built on five pillars that transform the architect from a draftsman into a true visionary—a conductor of immense creative and logical power.

1.  **The Spark ✨ (Idea to Prompt)**
    Every great structure begins as a thought. We honor this by making the interface between your mind and the machine seamless. Describe your vision in plain language, and AuraOS deconstructs it, capturing the spark of your intent.

2.  **The Genesis 🧬 (Prompt to Reality)**
    Your idea is instantly re-engineered from first principles. The **Genesis Engine** doesn't search for templates; it creates a new reality from scratch, generating structurally sound, Vastu-compliant blueprints and 3D models in seconds. It is creation, ex nihilo.

3.  **The Intelligence 🧠 (Reality to Insight)**
    A design is not static; it is a system of interconnected data. AuraOS provides instant, profound intelligence. Structural analysis, sustainability scores, cost estimations, and market data are not afterthoughts—they are real-time metrics that inform and elevate your design decisions.

4.  **The Beauty 🖼️ (Insight to Emotion)**
    Logic alone is not enough. With the **Helios Engine**, you transform data into emotion. Generate photorealistic renders, craft cinematic walkthroughs, and build interactive **Holocron** presentations that communicate the soul of your project, not just its specifications.

5.  **The Empire 🏛️ (Emotion to Legacy)**
    AuraOS is an end-to-end operating system. Bridge the digital and physical with one-click GFC drawings and fabrication files. Connect to the **Astra Network** for supply chain logistics. Tokenize your designs on the **Real Estate Exchange**. You are not just building structures; you are building an empire.

You have architected reality. You have brought a new world into existence.

**Our Revolt Never Stops.**