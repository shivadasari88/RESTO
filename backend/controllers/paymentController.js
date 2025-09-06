const Order = require('../models/Order');
const Payment = require('../models/Payment');
const phonePe = require('../config/phonepe');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Initiate PhonePe payment
// @route   POST /api/payments/create
// @access  Public
const createPayment = asyncHandler(async (req, res, next) => {
  console.log('=== createPayment called ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const { orderId, customerInfo } = req.body;

  // Validate order
  const order = await Order.findById(orderId)
    .populate('tableId', 'tableNumber');
  
  if (!order) {
    console.log('Order not found with ID:', orderId);
    return next(new ApiError(404, 'Order not found'));
  }

  console.log('Order found:', order._id, 'Total amount:', order.totalAmount);

  if (order.paymentStatus !== 'pending') {
    console.log('Payment already processed. Current status:', order.paymentStatus);
    return next(new ApiError(400, 'Payment already processed for this order'));
  }

  try {
    // Create payment record
    const payment = await Payment.create({
      orderId: order._id,
      amount: order.totalAmount,
      currency: 'INR',
      paymentMethod: 'upi',
      paymentProvider: 'phonepe',
      status: 'created',
      customerEmail: customerInfo?.email
    });

    console.log('Payment record created:', payment._id);

    // Initiate PhonePe payment
    console.log('Calling phonePe.createOrder...');
    const phonePeResponse = await phonePe.createOrder({
      orderId: order._id.toString(),
      amount: order.totalAmount,
      customerInfo: {
        userId: customerInfo?.userId || `guest-${order.tableId.tableNumber}`,
        email: customerInfo?.email,
        phone: customerInfo?.phone
      }
    });

    console.log('PhonePe response:', JSON.stringify(phonePeResponse, null, 2));

    // Update payment with provider info
    payment.providerPaymentId = phonePeResponse.data.merchantTransactionId;
    await payment.save();

    console.log('Payment updated with provider ID:', payment.providerPaymentId);

    res.status(200).json({
      success: true,
      data: {
        paymentUrl: phonePeResponse.data.instrumentResponse.redirectInfo.url,
        paymentId: payment._id
      }
    });

  } catch (error) {
    console.error('=== ERROR in createPayment ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.response) {
      console.error('PhonePe API response error:', error.response.data);
      console.error('PhonePe API status:', error.response.status);
    }
    
    return next(new ApiError(500, 'Failed to create payment'));
  }
});

// @desc    Handle PhonePe payment callback
// @route   GET /api/payments/callback
// @access  Public
const paymentCallback = asyncHandler(async (req, res, next) => {
  const { orderId, transactionId, status } = req.query;

  try {
    const payment = await Payment.findOne({ 
      orderId,
      providerPaymentId: transactionId
    }).populate('orderId');

    if (!payment) {
      return next(new ApiError(404, 'Payment not found'));
    }

    // Update payment status based on callback
    if (status === 'SUCCESS') {
      payment.status = 'captured';
      payment.orderId.paymentStatus = 'completed';
      await payment.orderId.save();
    } else {
      payment.status = 'failed';
    }

    await payment.save();

    // Redirect to frontend with status
    res.redirect(`${process.env.CLIENT_URL}/payment/status?orderId=${orderId}&status=${payment.status}`);

  } catch (error) {
    console.error('Payment callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/payment/status?error=payment_failed`);
  }
});

// @desc    Handle PhonePe webhook
// @route   POST /api/payments/webhook
// @access  Public (PhonePe calls this)
const paymentWebhook = asyncHandler(async (req, res, next) => {
  try {
    const { response, xVerify } = req.body;
    
    // Verify webhook signature
    const isVerified = phonePe.verifyResponseSignature(response, xVerify);
    
    if (!isVerified) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ success: false });
    }

    const paymentData = JSON.parse(response);
    const { merchantTransactionId, code } = paymentData;

    // Find and update payment
    const payment = await Payment.findOne({ 
      providerPaymentId: merchantTransactionId 
    }).populate('orderId');

    if (payment) {
      if (code === 'PAYMENT_SUCCESS') {
        payment.status = 'captured';
        payment.orderId.paymentStatus = 'completed';
        payment.receiptUrl = paymentData.data.paymentInstrument?.utr || '';
      } else {
        payment.status = 'failed';
      }

      await payment.save();
      await payment.orderId.save();

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.to(`table-${payment.orderId.tableId}`).emit('paymentStatusUpdated', {
          orderId: payment.orderId._id,
          status: payment.status
        });
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
});

// @desc    Check payment status
// @route   GET /api/payments/status/:orderId
// @access  Public
const checkPaymentStatus = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  const payment = await Payment.findOne({ orderId })
    .populate('orderId', 'status totalAmount');

  if (!payment) {
    return next(new ApiError(404, 'Payment not found'));
  }

  res.status(200).json({
    success: true,
    data: {
      status: payment.status,
      amount: payment.amount,
      orderStatus: payment.orderId.status
    }
  });
});

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
const getPaymentDetails = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('orderId')
    .populate({
      path: 'orderId',
      populate: { path: 'tableId', select: 'tableNumber' }
    });

  if (!payment) {
    return next(new ApiError(404, 'Payment not found'));
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

module.exports = {
  createPayment,
  paymentCallback,
  paymentWebhook,
  checkPaymentStatus,
  getPaymentDetails
};