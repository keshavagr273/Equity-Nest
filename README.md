# Equity Nest - Real-time Stock Trading Platform

A comprehensive stock trading platform built with Next.js, Express.js, and MongoDB. Features real-time stock data, interactive charts, portfolio management, and Google OAuth authentication.

## 🚀 Features

- **Real-time Stock Data**: Live stock prices and market data
- **Interactive Charts**: Advanced charting with TradingView integration
- **Portfolio Management**: Track and manage your investments
- **Google OAuth**: Secure authentication with Google
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: WebSocket integration for live data

## 🛠️ Tech Stack

### Frontend
- **Next.js 13** - React framework with App Router
- **TypeScript** - Type-safe development
- **Material-UI** - Modern UI components
- **Redux Toolkit** - State management
- **Socket.io Client** - Real-time communication

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Google OAuth** - Third-party authentication

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/keshavagr273/Equity-Nest.git
   cd Equity-Nest
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   yarn install

   # Install client dependencies
   cd ../client
   yarn install
   ```

3. **Environment Setup**
   
   Create `.env` file in server directory:
   ```env
   PORT=5000
   DB=mongodb://localhost:27017/equitynest
   PRIVATE_KEY=your-jwt-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google
   CLIENT_DOMAIN=http://localhost:3000
   ```

   Create `.env` file in client directory:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google
   ```

4. **Run the application**
   ```bash
   # Start server (in server directory)
   yarn dev

   # Start client (in client directory)
   yarn dev
   ```

## 🌐 Live Demo

Visit: [Equity Nest](https://equitynest.vercel.app)

## 👨‍💻 Author

**Keshav Agrawal**
- LinkedIn: [keshav-agrawal-02b4861b0](https://www.linkedin.com/in/keshav-agrawal-02b4861b0)
- GitHub: [@keshavagr273](https://github.com/keshavagr273)
- Email: keshavagrawal273@gmail.com

## 📄 License

This project is licensed under the MIT License.