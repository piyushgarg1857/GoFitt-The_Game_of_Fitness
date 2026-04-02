# GoFitt - The Game of Fitness

🌐 **Live Demo:** [https://gofitt.vercel.app](https://gofitt.vercel.app)

GoFitt is an interactive, gamified fitness application that turns your physical activities into an engaging game. Built with cutting-edge web technologies, it features real-time maps, fitness statistics, and user interactions to motivate you on your fitness journey.

## 🚀 Features

- **Interactive Maps:** Real-time location tracking and map rendering using Mapbox GL and Turf.js.
- **User Authentication:** Secure signup and login powered by JSON Web Tokens (JWT) and bcryptjs.
- **Fitness Dashboard:** A comprehensive dashboard to track your daily stats, progress, and goals.
- **User Search & Profiles:** Connect with other fitness enthusiasts, search for users, and view profiles.
- **Gamified Experience:** Elevate your typical exercise routine into a fun and competitive game.
- **Responsive Design:** Optimal layout for mobile and desktop screens using Tailwind CSS.

## 🛠 Tech Stack

- **Frontend:** React.js, Next.js 14, Tailwind CSS, Lucide React
- **Map Services:** Mapbox GL, Turf.js
- **Backend & Database:** Next.js API Routes, MongoDB
- **Authentication:** JWT, bcryptjs
- **Other Tools:** TypeScript, clsx, tailwind-merge

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Mapbox API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is licensed under the MIT License.
