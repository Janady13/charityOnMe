# 🔑 Stripe API Keys Setup Guide

## Where to Add Your Stripe API Keys

Your Stripe API keys need to be added to the `.env` file in the root directory of this project.

### Step 1: Get Your Stripe API Keys

1. **Login to Stripe Dashboard**: Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **Navigate to API Keys**: Click on "Developers" → "API keys" in the left sidebar
3. **Copy Your Keys**:
   - **Publishable key**: Starts with `pk_live_` (for production) or `pk_test_` (for testing)
   - **Secret key**: Starts with `sk_live_` (for production) or `sk_test_` (for testing)

### Step 2: Set Up Webhook Endpoint

1. **Go to Webhooks**: In Stripe Dashboard, click "Developers" → "Webhooks"
2. **Add Endpoint**: Click "Add endpoint" button
3. **Enter Your URL**: `https://yourdomain.com/webhook/stripe`
4. **Select Events**: Choose these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.dispute.created`
5. **Copy Webhook Secret**: After creating, copy the "Signing secret" (starts with `whsec_`)

### Step 3: Configure Environment Variables

1. **Copy the template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your actual Stripe keys:
   ```env
   # Replace with your actual Stripe keys
   STRIPE_PUBLISHABLE_KEY=pk_live_51ABC123DEF456...your_actual_publishable_key
   STRIPE_SECRET_KEY=sk_live_51ABC123DEF456...your_actual_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_ABC123DEF456...your_actual_webhook_secret

   # Server configuration
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=https://yourdomain.com

   # Payment limits (in cents)
   MIN_DONATION_AMOUNT=100    # $1.00 minimum
   MAX_DONATION_AMOUNT=100000 # $1,000.00 maximum
   DEFAULT_CURRENCY=usd
   ```

### Step 4: Test Your Setup

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Test payments**:
   - Visit `http://localhost:3000` for the main site
   - Visit `http://localhost:3000/donate` for quick donations
   - Try making a test payment with Stripe test cards

3. **Verify webhooks**:
   - Check your server logs for webhook events
   - Monitor your Stripe Dashboard for payment activity

## 🔒 Security Best Practices

1. **Never commit your `.env` file** to version control
2. **Use test keys for development**, live keys for production
3. **Rotate your API keys regularly**
4. **Monitor webhook logs** for suspicious activity
5. **Use HTTPS only** in production

## 📊 Testing with Stripe Test Cards

Use these test card numbers when testing:

- **Successful payment**: `4242424242424242`
- **Payment declined**: `4000000000000002`
- **Requires authentication**: `4000002500003155`

## 🌐 Production Deployment

For production, make sure to:

1. **Use live Stripe keys** (not test keys)
2. **Set up proper SSL/TLS** certificates
3. **Configure your domain** in environment variables
4. **Set up webhook endpoint** with your production URL
5. **Test thoroughly** before going live

## 🛠️ Troubleshooting

### Common Issues:

**❌ "Stripe not initialized"**
- Check that `STRIPE_PUBLISHABLE_KEY` is set correctly
- Verify the key format starts with `pk_live_` or `pk_test_`

**❌ "Webhook signature verification failed"**
- Ensure `STRIPE_WEBHOOK_SECRET` matches your Stripe webhook configuration
- Check that the webhook URL is accessible from the internet

**❌ "Payment failed"**
- Verify `STRIPE_SECRET_KEY` is correct
- Check Stripe Dashboard for error details
- Ensure your account is activated for live payments

## 💡 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env with your Stripe keys
# (See Step 3 above for details)

# 4. Start the server
npm start

# 5. Test at http://localhost:3000
```

## 📞 Need Help?

- **Stripe Documentation**: https://stripe.com/docs
- **Webhook Guide**: https://stripe.com/docs/webhooks
- **Test Cards**: https://stripe.com/docs/testing

---

✨ **Your charity donation platform is ready to accept secure payments once you add your Stripe API keys!**