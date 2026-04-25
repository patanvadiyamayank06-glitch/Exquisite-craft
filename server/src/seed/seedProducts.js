import dotenv from "dotenv";
import { connectDB, getPool } from "../config/db.js";

dotenv.config();

await connectDB();

const pool = getPool();

const products = [
  { name: "Nothing Customized Phone Case", model: "OnePlus", price: 300, image: "/flower-case.webp", description: "Hand-pressed florals sealed in crystal-clear resin.", featured: true },
  { name: "iPhone Customized Phone Case", model: "iPhone", price: 350, image: "/marble-case.webp", description: "Soft marble swirls with hand-painted pastel accents.", featured: true },
  { name: "iPhone Customized Phone Case", model: "iPhone", price: 350, image: "/boho-case.webp", description: "Textured boho weave inspired by handmade textile art.", featured: false },
  { name: "Tanjiro Manga Collage Case", model: "Samsung", price: 300, image: "/tanjiro-case.jpg", description: "Always be kind ~Tanjiro. Stunning manga collage design featuring Tanjiro from Demon Slayer.", featured: true },
  { name: "DIY Heart Customized Phone Case", model: "Samsung", price: 300, image: "https://i.pinimg.com/736x/a7/d9/04/a7d9049c5852d75bb6fdad25e23711c4.jpg", description: "Handmade DIY phone case with a cute heart design and aesthetic decorations.", featured: false },
  { name: "Krishna Peacock Phone Case", model: "Samsung", price: 300, image: "https://i.pinimg.com/736x/73/3a/27/733a27a5b19365eb1c0fcd096dcde184.jpg", description: "Aesthetic handmade phone case featuring a beautiful peacock design, totally customisable.", featured: false },
  { name: "You're Special Collage Phone Case", model: "iPhone", price: 350, image: "https://i.pinimg.com/736x/37/8f/83/378f83897bf5e6f9af463b5fc4e51b01.jpg", description: "Handmade collage phone case with cute photos, stickers and the words 'You're Special'.", featured: false },
  { name: "Smile For The Camera Phone Case", model: "Samsung", price: 300, image: "/camera-case.jpeg", description: "Aesthetic collage phone case with camera stickers, film strips and quotes.", featured: false },
  { name: "iPhone Customized Phone Case", model: "iPhone", price: 350, image: "/iphone-case2.jpeg", description: "Handcrafted customized iPhone case, uniquely designed just for you.", featured: false },
  { name: "iPhone Customized Phone Case", model: "iPhone", price: 350, image: "/iphone-case3.jpeg", description: "Handcrafted customized iPhone case, uniquely designed just for you.", featured: false },
  { name: "Customized Phone Case", model: "OnePlus", price: 300, image: "/other-case1.jpeg", description: "Handcrafted customized phone case, uniquely designed just for you.", featured: false },
  { name: "Handmade Aesthetic Backcover", model: "Samsung", price: 300, image: "https://i.pinimg.com/736x/05/97/f8/0597f80372bdaadea69b2bb8e885027a.jpg", description: "Handmade aesthetic backcover, totally customisable.", featured: false },
];

// Clear existing products first
await pool.query("DELETE FROM wishlist_items");
await pool.query("DELETE FROM reviews");
await pool.query("DELETE FROM products");

for (const p of products) {
  await pool.query(
    `INSERT INTO products (name, model, price, image, description, featured) VALUES ($1,$2,$3,$4,$5,$6)`,
    [p.name, p.model, p.price, p.image, p.description, p.featured]
  );
}

console.log(`Seeded ${products.length} products successfully`);
process.exit(0);
