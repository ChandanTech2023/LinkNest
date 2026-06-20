# LinkNest

LinkNest is a full-stack Link-in-Bio web application that allows users to build custom, highly-styled profile pages, manage their links via an intuitive drag-and-drop interface, and monitor their link clicks with visual analytics.

## Features

- **Authentication System**: Secure user registration and login with JWT and bcrypt password hashing.
- **Profile Dashboard**: 
  - Edit your profile details (name, bio, photo).
  - Add, edit, and toggle visibility of links.
  - Reorder links via a smooth drag-and-drop interface.
  - Live preview of your public profile page.
- **Customizable Themes**: Choose from 5 beautiful CSS themes: `Minimal`, `Dark`, `Gradient`, `Neon`, and `Pastel`.
- **Public Profile Page**: A highly responsive public page mapped to `/:username` allowing visitors to see and interact with your links.
- **Analytics**: Track your lifetime clicks and view a 7-day click history on an interactive bar chart using Chart.js.

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Chart.js, `@hello-pangea/dnd`
- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs
- **Database**: MongoDB (Atlas Cloud)

## Setup Instructions

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/download/) (v16 or higher)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas/register) or local MongoDB instance.

### 1. Database Setup

1. Create a free shared cluster on MongoDB Atlas.
2. Under "Database Access", create a user with a username and password.
3. Under "Network Access", add IP address `0.0.0.0/0` (Allow Access from Anywhere).
4. Go to Databases, click "Connect", choose "Drivers", and copy your Connection String. It should look like this:
   `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/linknest?retryWrites=true&w=majority`

### 2. Backend Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Edit the `.env` file in the `backend` directory and paste your MongoDB URI:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string_here
   JWT_SECRET=super_secret_linknest_jwt_key_987654321
   ```
4. **Seed the Database** (Optional but recommended):
   Run the seeder script to populate 3 demo accounts (`demo1@linknest.com`, `demo2@linknest.com`, `demo3@linknest.com` with password `password123`) with dummy links and a 7-day click history.
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173`.

## Usage

1. Go to `http://localhost:5173/register` to create a new account or log in with a seeded demo account.
2. From the dashboard, customize your profile, add new links, drag them into your preferred order, and change your theme.
3. Share your public profile link (e.g., `http://localhost:5173/johndoe`) with others.
4. Visit the **Analytics** page to monitor the clicks your links are generating!

## License

MIT
