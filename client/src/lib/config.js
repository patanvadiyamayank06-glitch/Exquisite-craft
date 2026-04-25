const hostname = window.location.hostname;

export const API_BASE_URL =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://exquisite-craft.onrender.com/"; // 👈 replace with your Render URL after deploying
