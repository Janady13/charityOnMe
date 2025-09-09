# CharityOnMe - AI for Everyone Donation Platform

A modern charity donation platform with Stripe integration, webhooks, and multiple payment methods for supporting AI development initiatives.

## 🚀 Features

- **Secure Stripe Integration**: Full Stripe Elements integration with webhooks
- **Multiple Payment Methods**: Stripe (cards), Venmo, Cash App
- **Real-time Webhooks**: Automatic payment processing and confirmation
- **Responsive Design**: Works on desktop and mobile devices
- **Donation Tracking**: Backend logging and webhook handling
- **Security**: Helmet.js, CORS protection, and Stripe signature verification

## 📋 Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn package manager
- Stripe account with API keys
- Domain for webhook endpoints (for production)

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd charityOnMe
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your actual values:

```bash
cp .env.example .env
```

Edit `.env` file with your actual credentials:

```env
# Stripe Configuration (REQUIRED)
STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here

# Server Configuration
PORT=3000
NODE_ENV=production

# Domain Configuration
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://your-api-domain.com
```

### 3. Set Up Stripe Webhooks

1. **Login to Stripe Dashboard**: Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)

2. **Create Webhook Endpoint**:
   - Navigate to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - Enter your webhook URL: `https://your-domain.com/webhook/stripe`
   - Select these events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
     - `charge.dispute.created`

3. **Copy Webhook Secret**:
   - After creating the webhook, copy the "Signing secret"
   - Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

### 4. Get Your Stripe API Keys

1. **Get API Keys**:
   - In Stripe Dashboard, go to "Developers" → "API keys"
   - Copy the "Publishable key" and "Secret key"
   - **Important**: Use live keys for production, test keys for development

2. **Add to Environment**:
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_live_51ABC123...
   STRIPE_SECRET_KEY=sk_live_51ABC123...
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3000 (or your configured PORT).

## 📁 File Structure

```
charityOnMe/
├── server.js              # Express server with Stripe integration
├── index.html             # Main charity website
├── donate.html            # Quick donation page ($1-20)
├── payment.html           # Secure Stripe payment page
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🔗 API Endpoints

### Public Endpoints
- `GET /` - Main website (index.html)
- `GET /donate` - Quick donation page
- `GET /payment.html` - Secure payment form
- `GET /health` - Health check

### API Endpoints
- `GET /api/stripe-config` - Get Stripe publishable key
- `POST /api/create-payment-intent` - Create payment intent
- `POST /webhook/stripe` - Stripe webhook handler

## 💳 Payment Flow

1. **User selects amount** on main site or donation page
2. **Redirected to secure payment page** (`/payment.html`)
3. **Stripe Elements** handles card input securely
4. **Payment processed** through Stripe API
5. **Webhook confirms** payment and logs donation
6. **User redirected** back with success confirmation

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS Protection**: Configured for your domain
- **Stripe Signature Verification**: Validates webhook authenticity
- **Input Validation**: Amount limits and sanitization
- **No Card Storage**: All payments processed through Stripe

## 🌐 Deployment Options

### Option 1: Heroku
```bash
# Install Heroku CLI, then:
heroku create your-app-name
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
git push heroku main
```

### Option 2: Vercel
```bash
npm install -g vercel
vercel
# Configure environment variables in Vercel dashboard
```

### Option 3: VPS/Cloud Server
```bash
# Clone repo on server
git clone <repo-url>
cd charityOnMe
npm install
# Set up environment variables
# Use PM2 or similar for process management
pm2 start server.js --name charityOnMe
```

## 🔧 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key | `pk_live_51ABC...` |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key | `sk_live_51ABC...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret | `whsec_abc123...` |
| `PORT` | No | Server port | `3000` |
| `NODE_ENV` | No | Environment | `production` |
| `FRONTEND_URL` | No | Frontend domain | `https://yourdomain.com` |

## 📊 Webhook Events Handled

The application automatically handles these Stripe webhook events:

- **payment_intent.succeeded**: Logs successful donation
- **payment_intent.payment_failed**: Handles failed payments  
- **payment_intent.canceled**: Processes canceled payments
- **charge.dispute.created**: Notifies of payment disputes

## 🛠️ Customization

### Adding New Payment Amounts
Edit the quick amount buttons in `payment.html`:
```javascript
<button type="button" class="quick-amount" onclick="setAmount(25)">$25</button>
```

### Modifying Donation Limits
Update the limits in `.env`:
```env
MIN_DONATION_AMOUNT=100    # $1.00 minimum
MAX_DONATION_AMOUNT=100000 # $1,000.00 maximum
```

### Adding Email Notifications
Extend the webhook handlers in `server.js` to send emails:
```javascript
async function handlePaymentSuccess(paymentIntent) {
    // Add email sending logic here
    console.log('Payment succeeded:', paymentIntent);
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"Stripe not initialized"**
   - Check that `STRIPE_PUBLISHABLE_KEY` is set
   - Verify the key starts with `pk_live_` or `pk_test_`

2. **Webhook signature verification failed**
   - Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
   - Check that webhook URL is correct

3. **CORS errors**
   - Update `FRONTEND_URL` in environment variables
   - Check that domains match exactly

### Development vs Production

- **Development**: Use Stripe test keys (`pk_test_`, `sk_test_`)
- **Production**: Use Stripe live keys (`pk_live_`, `sk_live_`)
- **Webhooks**: Set up separate endpoints for test and live

## 📝 API Key Security

**⚠️ Important Security Notes:**

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate keys regularly** in Stripe dashboard
4. **Monitor webhook logs** for suspicious activity
5. **Use HTTPS only** in production

## 📞 Support

For questions about:
- **Stripe Setup**: Check [Stripe Documentation](https://stripe.com/docs)
- **Webhook Configuration**: See [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- **Deployment Issues**: Check your hosting provider's documentation

## 📄 License

MIT License - see LICENSE file for details.

---

## 🔑 Quick Start Summary

1. **Get Stripe keys** from dashboard.stripe.com
2. **Copy `.env.example` to `.env`** and fill in your keys
3. **Set up webhook** endpoint in Stripe dashboard
4. **Run `npm install && npm start`**
5. **Test with a small donation**

Your donation platform is now ready to accept secure payments! 🎉