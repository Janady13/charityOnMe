const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "js.stripe.com", "*.stripe.com"],
      connectSrc: ["'self'", "api.stripe.com", "*.stripe.com"],
      frameSrc: ["'self'", "js.stripe.com", "*.stripe.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Raw body parser for Stripe webhooks (must be before express.json())
app.use('/webhook/stripe', bodyParser.raw({ type: 'application/json' }));

// JSON parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== STRIPE PAYMENT ROUTES ====================

// Create payment intent for custom amounts
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    // Validate amount
    const minAmount = parseInt(process.env.MIN_DONATION_AMOUNT) || 100; // $1.00
    const maxAmount = parseInt(process.env.MAX_DONATION_AMOUNT) || 100000; // $1,000.00

    if (!amount || amount < minAmount || amount > maxAmount) {
      return res.status(400).json({
        error: `Amount must be between $${minAmount/100} and $${maxAmount/100}`
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        source: 'charityonme',
        ...metadata
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Get Stripe publishable key
app.get('/api/stripe-config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// ==================== STRIPE WEBHOOK HANDLER ====================

app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      
      case 'charge.dispute.created':
        await handleDispute(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// ==================== WEBHOOK EVENT HANDLERS ====================

async function handlePaymentSuccess(paymentIntent) {
  console.log('💚 Payment succeeded:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    customer: paymentIntent.customer,
    metadata: paymentIntent.metadata
  });

  // Here you could:
  // 1. Send confirmation email to donor
  // 2. Save donation to database
  // 3. Update donor records
  // 4. Send notification to your team
  // 5. Generate tax receipt

  // Example: Log donation (you might want to save to database instead)
  const donation = {
    id: paymentIntent.id,
    amount: paymentIntent.amount / 100, // Convert cents to dollars
    currency: paymentIntent.currency,
    timestamp: new Date().toISOString(),
    metadata: paymentIntent.metadata
  };

  // TODO: Save to database
  console.log('Donation recorded:', donation);
}

async function handlePaymentFailed(paymentIntent) {
  console.log('❌ Payment failed:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    last_payment_error: paymentIntent.last_payment_error
  });

  // Handle failed payment
  // You might want to send an email to the donor or retry the payment
}

async function handlePaymentCanceled(paymentIntent) {
  console.log('⚠️ Payment canceled:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    cancellation_reason: paymentIntent.cancellation_reason
  });

  // Handle canceled payment
}

async function handleDispute(charge) {
  console.log('⚖️ Dispute created:', {
    id: charge.id,
    amount: charge.amount,
    reason: charge.dispute?.reason
  });

  // Handle dispute - you might want to notify your team
}

// ==================== STATIC FILE SERVING ====================

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/donate', (req, res) => {
  res.sendFile(path.join(__dirname, 'donate.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== SERVER STARTUP ====================

app.listen(PORT, () => {
  console.log(`🚀 CharityOnMe server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  // Validate environment variables
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  STRIPE_SECRET_KEY not set');
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET not set');
  }
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    console.warn('⚠️  STRIPE_PUBLISHABLE_KEY not set');
  }
  
  console.log('💳 Stripe webhook endpoint: /webhook/stripe');
  console.log('🔑 API endpoints: /api/stripe-config, /api/create-payment-intent');
});

module.exports = app;