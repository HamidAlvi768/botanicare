const stripe = require('stripe')(require('../config').stripe.secretKey);
const { ErrorResponse } = require('../middleware/error');

class PaymentService {
  // Create payment intent
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata
      });

      return paymentIntent;
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw new ErrorResponse('Payment processing failed', 500);
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      throw new ErrorResponse('Payment confirmation failed', 500);
    }
  }

  // Create customer
  async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata
      });

      return customer;
    } catch (error) {
      console.error('Customer creation failed:', error);
      throw new ErrorResponse('Customer creation failed', 500);
    }
  }

  // Add payment method to customer
  async addPaymentMethod(customerId, paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      return paymentMethod;
    } catch (error) {
      console.error('Adding payment method failed:', error);
      throw new ErrorResponse('Adding payment method failed', 500);
    }
  }

  // Process refund
  async processRefund(paymentIntentId, amount = null) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...(amount && { amount: Math.round(amount * 100) }) // Convert to cents if amount provided
      });

      return refund;
    } catch (error) {
      console.error('Refund processing failed:', error);
      throw new ErrorResponse('Refund processing failed', 500);
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(rawBody, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        require('../config').stripe.webhookSecret
      );

      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new ErrorResponse('Webhook signature verification failed', 400);
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return this.handlePaymentSuccess(event.data.object);
      
      case 'payment_intent.payment_failed':
        return this.handlePaymentFailure(event.data.object);
      
      case 'charge.refunded':
        return this.handleRefund(event.data.object);
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  // Handle successful payment
  async handlePaymentSuccess(paymentIntent) {
    // Implement payment success logic
    console.log('Payment succeeded:', paymentIntent.id);
    return paymentIntent;
  }

  // Handle failed payment
  async handlePaymentFailure(paymentIntent) {
    // Implement payment failure logic
    console.log('Payment failed:', paymentIntent.id);
    return paymentIntent;
  }

  // Handle refund
  async handleRefund(charge) {
    // Implement refund logic
    console.log('Refund processed:', charge.id);
    return charge;
  }
}

module.exports = new PaymentService(); 