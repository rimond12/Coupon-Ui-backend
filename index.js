const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ------------------- IN-MEMORY COUPONS -------------------
const coupons = [
  {
    code: "WELCOME100",
    description: "Get 100 off for first order",
    discountType: "FLAT",
    discountValue: 100,
    maxDiscountAmount: 0,
    startDate: "2025-11-20",
    endDate: "2025-12-01",
    usageLimitPerUser: 1,
    eligibility: {
      allowedUserTiers: ["NEW", "REGULAR"],
      minLifetimeSpend: 0,
      minOrdersPlaced: 0,
      firstOrderOnly: true,
      allowedCountries: ["IN"],
      minCartValue: 500,
      applicableCategories: ["electronics", "fashion"],
      excludedCategories: ["books"],
      minItemsCount: 1,
    },
  },
];

// ------------------- CREATE COUPON -------------------
app.post("/api/coupons", (req, res) => {
  const coupon = req.body;

  if (!coupon.code) {
    return res.status(400).json({ message: "Coupon code is required" });
  }

  // Duplicate check
  const exists = coupons.find((c) => c.code === coupon.code);
  if (exists) {
    return res.status(400).json({ message: "Coupon code already exists" });
  }

  coupons.push(coupon);
  res.json({ message: "Coupon created successfully", coupon });
});

// ------------------- GET ALL COUPONS -------------------
app.get("/api/coupons", (req, res) => {
  res.json(coupons);
});

// ------------------- BEST COUPON -------------------
app.post("/api/coupons/best", (req, res) => {
  const { user, cart } = req.body;

  if (!user || !cart || !cart.items) {
    return res.status(400).json({ message: "User and cart required" });
  }

  const cartValue = cart.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const itemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const now = new Date();

  const eligibleCoupons = coupons.filter((c) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    if (now < start || now > end) return false;

    const e = c.eligibility || {};

    // User checks with trim
    if (e.allowedUserTiers?.length && !e.allowedUserTiers.some(tier => tier.trim() === user.userTier)) return false;
    if (e.minLifetimeSpend && user.lifetimeSpend < e.minLifetimeSpend) return false;
    if (e.minOrdersPlaced && user.ordersPlaced < e.minOrdersPlaced) return false;
    if (e.firstOrderOnly && user.ordersPlaced > 0) return false;
    if (e.allowedCountries?.length && !e.allowedCountries.some(c => c.trim() === user.country)) return false;

    // Cart checks with trim
    if (e.minCartValue && cartValue < e.minCartValue) return false;
    if (e.minItemsCount && itemsCount < e.minItemsCount) return false;
    if (e.applicableCategories?.length) {
      if (!cart.items.some(item => e.applicableCategories.some(cat => cat.trim() === item.category.trim()))) return false;
    }
    if (e.excludedCategories?.length) {
      if (cart.items.some(item => e.excludedCategories.some(cat => cat.trim() === item.category.trim()))) return false;
    }

    return true;
  });

  if (eligibleCoupons.length === 0) return res.json({ bestCoupon: null });

  // Compute discount amount
  const couponsWithDiscount = eligibleCoupons.map((c) => {
    let discount = 0;
    if (c.discountType === "FLAT") discount = c.discountValue;
    else if (c.discountType === "PERCENT") {
      discount = (c.discountValue / 100) * cartValue;
      if (c.maxDiscountAmount) discount = Math.min(discount, c.maxDiscountAmount);
    }
    return { ...c, discount };
  });

  // Select best coupon: highest discount -> earliest endDate -> lex smallest code
  couponsWithDiscount.sort((a, b) => {
    if (b.discount !== a.discount) return b.discount - a.discount;
    const dateA = new Date(a.endDate);
    const dateB = new Date(b.endDate);
    if (dateA - dateB !== 0) return dateA - dateB;
    return a.code.localeCompare(b.code);
  });

  res.json({ bestCoupon: couponsWithDiscount[0] });
});

// ------------------- DEMO LOGIN -------------------
const demoUsers = [
  {
    email: "hire-me@anshumat.org",
    password: "HireMe@2025!",
    userId: "u123",
    userTier: "NEW",
    country: "IN",
    lifetimeSpend: 1200,
    ordersPlaced: 0,
  },
];

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = demoUsers.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  res.json({ message: "Login successful", user });
});

// ------------------- START SERVER -------------------
app.get("/", (req, res) => {
  res.send("Coupon Management Server is running");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
