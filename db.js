const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'products.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        category TEXT,
        img TEXT,
        description TEXT
    )`);

    // Create cart table for persistence
    db.run(`CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        FOREIGN KEY(product_id) REFERENCES products(id)
    )`);

    // Create orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_amount INTEGER,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        items_count INTEGER
    )`);

    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        wallet INTEGER DEFAULT 0
    )`);

    // Seed users if empty
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (row && row.count === 0) {
            db.run("INSERT INTO users (email, password, name, wallet) VALUES (?, ?, ?, ?)", 
            ['admin@riouk.com', 'riouk123', 'Riouk Elite User', 4200]);
        }
    });

    // Check if table is empty
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (row.count === 0) {
            console.log("Seeding Riouk database...");
            const stmt = db.prepare("INSERT INTO products (name, price, category, img, description) VALUES (?, ?, ?, ?, ?)");
            
            const seedProducts = [
                ["Neon Flux Watch", 2499, "Drops", "neon_watch.png", "Elite neon-lit smart watch with biometric tracking."],
                ["Riouk Pods Elite", 3299, "Tech", "aura_pods.png", "Crystal clear audio with active noise cancellation."],
                ["Cyber Jacket X", 5499, "Gear", "cyber_jacket.png", "Techwear jacket with integrated heating and LED accents."],
                ["Pulse Smart Band", 1899, "Drops", "pulse_band.png", "Ultra-thin fitness tracker with OLED display."],
                ["Riouk Glasses G1", 1299, "Elite", "aura_glasses.png", "Blue light filtering elite eyewear."],
                ["Sonic Speaker", 4499, "Tech", "sonic_speaker.png", "High-fidelity portable speaker with RGB sync."],
                ["Riouk Watch Pro", 12499, "Elite", "offer_watch.png", "The ultimate elite smartwatch with holographic interface and 30-day battery."],
                ["Riouk View Glasses", 24999, "Tech", "offer_glasses.png", "Next-gen AR glasses with 4K projection and neural link support."],
                ["Flux Pods Max", 8999, "Drops", "aura_pods.png", "Pro-grade spatial audio with hybrid driver technology."]
            ];

            seedProducts.forEach(p => stmt.run(p));
            stmt.finalize();
            console.log("Database seeded successfully.");
        }
    });
});

module.exports = db;
