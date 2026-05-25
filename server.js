const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve Static Frontend Files
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Endpoints
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Cart Endpoints
app.get('/api/cart', (req, res) => {
    db.all(`
        SELECT products.* FROM cart 
        JOIN products ON cart.product_id = products.id
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/cart', (req, res) => {
    const { productId } = req.body;
    db.run("INSERT INTO cart (product_id) VALUES (?)", [productId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.delete('/api/cart', (req, res) => {
    db.run("DELETE FROM cart", [], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Cart cleared" });
    });
});

// Checkout Endpoint
app.post('/api/checkout', (req, res) => {
    const { total, itemsCount } = req.body;
    db.run("INSERT INTO orders (total_amount, items_count) VALUES (?, ?)", [total, itemsCount], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        // Clear cart after checkout
        db.run("DELETE FROM cart", [], () => {
            res.json({ orderId: this.lastID, message: "Order placed successfully!" });
        });
    });
});

// Auth Endpoints
app.post('/api/signup', (req, res) => {
    const { email, password, name } = req.body;
    db.run("INSERT INTO users (email, password, name, wallet) VALUES (?, ?, ?, ?)", 
    [email, password, name, 5000], function(err) {
        if (err) return res.status(400).json({ error: "Email already exists" });
        res.json({ id: this.lastID, email, name, wallet: 5000 });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid credentials" });
        res.json(row);
    });
});

app.get('/api/user/:id', (req, res) => {
    db.get("SELECT name, email, wallet FROM users WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders ORDER BY order_date DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Riouk Server running on http://localhost:${PORT}`);
});
