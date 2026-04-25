const hostname = window.location.hostname;
export const API_BASE_URL = hostname === "localhost" || hostname === "127.0.0.1"
  ? "http://localhost:5000"
  : `http://10.139.197.238:5000`;
