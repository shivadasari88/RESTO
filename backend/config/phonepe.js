const axios = require('axios');
const crypto = require('crypto');

class PhonePePayment {
  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID;
    this.saltKey = process.env.PHONEPE_SALT_KEY;
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || 1;
    this.baseUrl = process.env.PHONEPE_BASE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    this.redirectUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  }

  // Generate SHA256 hash
  generateSHA256Payload(payload) {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToHash = base64Payload + '/pg/v1/pay' + this.saltKey;
    const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return base64Payload + '###' + hash;
  }

  // Verify response signature
  verifyResponseSignature(response, header) {
    const [responseHash, headerHash] = header.split('###');
    const stringToHash = response + this.saltKey;
    const computedHash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return computedHash === headerHash;
  }

  // Create payment order
  async createOrder(orderData) {
  try {
    console.log('Creating PhonePe order with data:', orderData);
    
    // TEMPORARY: Return mock response for testing
    const mockResponse = {
      success: true,
      code: "PAYMENT_INITIATED",
      message: "Payment initiated successfully",
      data: {
        merchantId: this.merchantId,
        merchantTransactionId: `MT${Date.now()}`,
        instrumentResponse: {
          type: "REDIRECT",
          redirectInfo: {
            url: "https://sandbox.phonepe.com/apis/pg-sandbox/pg/v1/pay/test-payment",
            method: "GET"
          }
        }
      }
    };

    console.log('Returning mock response');
    return mockResponse;

    /* COMMENT OUT THE REAL CODE TEMPORARILY
    const payload = {
      merchantId: this.merchantId,
      // ... rest of your payload
    };

    const xVerify = this.generateSHA256Payload(payload);

    const response = await axios.post(`${this.baseUrl}/pg/v1/pay`, {
      request: payload
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': this.merchantId
      }
    });

    return response.data;
    */
  } catch (error) {
    console.error('PhonePe order creation error:', error.response?.data || error.message);
    throw new Error('Failed to create payment order');
  }
}
  // Check payment status
  async checkPaymentStatus(merchantTransactionId) {
    try {
      const stringToHash = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}` + this.saltKey;
      const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const xVerify = hash + '###' + this.saltIndex;

      const response = await axios.get(
        `${this.baseUrl}/pg/v1/status/${this.merchantId}/${merchantTransactionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'X-MERCHANT-ID': this.merchantId
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('PhonePe status check error:', error.response?.data || error.message);
      throw new Error('Failed to check payment status');
    }
  }
}

module.exports = new PhonePePayment();