const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'yash_portfolio_secret_key_2026';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// --- EMAIL NOTIFICATION SETUP ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendInquiryEmail = async (inquiry) => {
  const { name, email, subject, message } = inquiry;
  
  // Verify environment configurations are loaded
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Nodemailer info: SMTP credentials not fully configured in env.');
    return;
  }

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Yash Portfolio'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `New Portfolio Inquiry: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px; max-width: 600px;">
        <h2 style="color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">New Contact Message Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 15px; border-left: 4px solid #6366f1;">
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="font-size: 0.85rem; color: #888; margin-top: 20px;">This email was automatically sent from your MERN Portfolio system.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Notification email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending notification email:', error.message);
  }
};

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    seedAdmin(); // Seed default admin account on startup
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });

// --- SCHEMAS & MODELS ---

// 1. Contact Messages Schema
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', ContactSchema);

// 2. Visitors Schema
const VisitorSchema = new mongoose.Schema({
  ip: { type: String, default: 'Unknown' },
  browser: { type: String, default: 'Unknown' },
  platform: { type: String, default: 'Unknown' },
  visitedAt: { type: Date, default: Date.now }
});
const Visitor = mongoose.model('Visitor', VisitorSchema);

// 3. Admin Account Schema
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Admin = mongoose.model('Admin', AdminSchema);

// Seed Default Admin Helper
async function seedAdmin() {
  try {
    // 1. Delete old default admin if it exists
    await Admin.deleteOne({ username: 'admin' });

    // 2. Check and seed new custom admin
    const adminExists = await Admin.findOne({ username: 'yashp4710@gmail.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Yash7576@', 10);
      const newAdmin = new Admin({
        username: 'yashp4710@gmail.com',
        password: hashedPassword
      });
      await newAdmin.save();
      console.log('--- ADMIN SEED ---');
      console.log('Default Admin Account Created!');
      console.log('Username: yashp4710@gmail.com');
      console.log('Password: Yash7576@');
      console.log('------------------');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

// --- JWT AUTH MIDDLEWARE ---
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied. Token missing.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.admin = verified;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// --- ROUTES ---

// 1. Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Portfolio backend server is active and running.' });
});

// 2. Submit Contact Form
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
  }

  try {
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    
    // Trigger email notification in the background
    sendInquiryEmail(newContact);

    return res.status(201).json({ success: true, message: 'Message sent successfully! I will get back to you soon.' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error. Please try again later.' });
  }
});

// 3. Track Website Visitor
app.post('/api/visit', async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  
  // Clean IPv6 prefix if local
  const cleanIp = ip === '::1' ? '127.0.0.1' : ip.replace(/^.*:/, '');

  // Parse browser and platform from user-agent
  let browser = 'Other';
  let platform = 'Other';

  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  if (userAgent.includes('Windows')) platform = 'Windows';
  else if (userAgent.includes('Macintosh')) platform = 'macOS';
  else if (userAgent.includes('Linux')) platform = 'Linux';
  else if (userAgent.includes('Android')) platform = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'iOS';

  try {
    const newVisitor = new Visitor({ ip: cleanIp, browser, platform });
    await newVisitor.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return res.status(500).json({ success: false });
  }
});

// 4. Admin Login Route
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both username and password.' });
  }

  try {
    const adminUser = await Admin.findOne({ username });
    if (!adminUser) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: adminUser._id, username: adminUser.username }, JWT_SECRET, { expiresIn: '2h' });
    return res.status(200).json({ success: true, token, username: adminUser.username });
  } catch (error) {
    console.error('Error on admin login:', error);
    return res.status(500).json({ success: false, message: 'Server Login Error.' });
  }
});

// 5. Admin Routes (Contact Messages Listing)
app.get('/api/admin/messages', authenticateAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
});

// 6. Admin Routes (Delete Contact Message)
app.delete('/api/admin/messages/:id', authenticateAdmin, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
});

// 7. Admin Routes (Visitor Analytics)
app.get('/api/admin/visitors', authenticateAdmin, async (req, res) => {
  try {
    const totalCount = await Visitor.countDocuments();
    const visitorLogs = await Visitor.find().sort({ visitedAt: -1 }).limit(100);
    
    // Aggregate by browser and platform
    const browserStats = await Visitor.aggregate([
      { $group: { _id: '$browser', count: { $sum: 1 } } }
    ]);
    const platformStats = await Visitor.aggregate([
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    res.status(200).json({ 
      success: true, 
      total: totalCount, 
      logs: visitorLogs,
      browsers: browserStats,
      platforms: platformStats
    });
  } catch (error) {
    console.error('Error fetching admin visitors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
});

// 8. Admin Routes (Update Settings)
app.put('/api/admin/settings', authenticateAdmin, async (req, res) => {
  const { newUsername, newPassword } = req.body;
  
  try {
    const adminUser = await Admin.findById(req.admin.id);
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    if (newUsername) {
      if (newUsername !== adminUser.username) {
        const usernameTaken = await Admin.findOne({ username: newUsername });
        if (usernameTaken) {
          return res.status(400).json({ success: false, message: 'Username is already in use.' });
        }
      }
      adminUser.username = newUsername;
    }

    if (newPassword) {
      adminUser.password = await bcrypt.hash(newPassword, 10);
    }

    await adminUser.save();
    return res.status(200).json({ success: true, message: 'Admin settings updated successfully!' });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong on the server!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
