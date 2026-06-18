import {
  NotificationTemplateType,
  NotificationChannel,
  RecipientType,
} from '../enums/notification.enum';
import { INotificationTemplate } from '../interfaces/notification.interface';

/**
 * Predefined mandatory notification templates
 */
export const MANDATORY_TEMPLATES: INotificationTemplate[] = [
  // ============== CUSTOMER TEMPLATES ==============
  {
    id: 'tmpl_low_wallet_balance',
    type: NotificationTemplateType.LOW_WALLET_BALANCE,
    recipientType: RecipientType.CUSTOMER,
    channel: NotificationChannel.BOTH,
    title: 'Low Wallet Balance - Top Up Now',
    subject: 'Your Milk Delivery Wallet is Low',
    pushTitle: '⚠️ Low Wallet Balance',
    pushBody: 'Your wallet has only ₹{{amount}} left. Top up now to continue ordering.',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Low Wallet Balance Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 4px;">
          <h2 style="color: #856404; margin-top: 0;">⚠️ Low Wallet Balance Alert</h2>
          <p>Hello {{customerName}},</p>
          <p>Your Milk Delivery wallet balance is running low!</p>
          <p style="font-size: 18px; font-weight: bold; color: #d9534f;">
            Current Balance: <span style="color: #d9534f;">₹{{amount}}</span>
          </p>
          <p>To ensure uninterrupted milk deliveries, please top up your wallet now.</p>
          <p>{{actionUrl}}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Milk Delivery Service.
          </p>
        </div>
      </body>
      </html>
    `,
    variables: ['customerName', 'amount'],
    isMandatory: true,
    isActive: true,
    description: 'Alert when customer wallet balance is low',
  },

  {
    id: 'tmpl_order_placed',
    type: NotificationTemplateType.ORDER_PLACED,
    recipientType: RecipientType.CUSTOMER,
    channel: NotificationChannel.BOTH,
    title: 'Order Placed Successfully',
    subject: 'Your Milk Delivery Order #{{orderId}} is Confirmed',
    pushTitle: '✅ Order Confirmed',
    pushBody: 'Your order {{orderId}} for {{amount}} has been placed. Order ID: {{orderId}}',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; border-radius: 4px;">
          <h2 style="color: #155724; margin-top: 0;">✅ Order Placed Successfully</h2>
          <p>Hello {{customerName}},</p>
          <p>Your order has been confirmed and is being prepared for delivery.</p>
          <p><strong>Order Details:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Order ID:</strong> {{orderId}}</li>
            <li><strong>Total Amount:</strong> ₹{{amount}}</li>
            <li><strong>Delivery Address:</strong> {{deliveryAddress}}</li>
            <li><strong>Estimated Delivery:</strong> {{estimatedTime}}</li>
          </ul>
          <p>Your delivery partner will be assigned shortly. You can track your order in the app.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Thank you for ordering with Milk Delivery!
          </p>
        </div>
      </body>
      </html>
    `,
    variables: [
      'customerName',
      'orderId',
      'amount',
      'deliveryAddress',
      'estimatedTime',
    ],
    isMandatory: true,
    isActive: true,
    description: 'Confirmation email/notification when order is placed',
  },

  {
    id: 'tmpl_order_delivered',
    type: NotificationTemplateType.ORDER_DELIVERED,
    recipientType: RecipientType.CUSTOMER,
    channel: NotificationChannel.BOTH,
    title: 'Order Delivered',
    subject: 'Your Order #{{orderId}} Has Been Delivered',
    pushTitle: '🎉 Order Delivered',
    pushBody: 'Your order {{orderId}} has been successfully delivered!',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; border-radius: 4px;">
          <h2 style="color: #155724; margin-top: 0;">🎉 Order Delivered Successfully</h2>
          <p>Hello {{customerName}},</p>
          <p>Your order has been delivered to your doorstep!</p>
          <p><strong>Delivery Details:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Order ID:</strong> {{orderId}}</li>
            <li><strong>Delivered By:</strong> {{partnerName}}</li>
            <li><strong>Delivery Time:</strong> {{deliveryTime}}</li>
            <li><strong>Amount Paid:</strong> ₹{{amount}}</li>
          </ul>
          <p>Thank you for your order! We hope you enjoyed your products.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Rate your experience in the app to help us improve!
          </p>
        </div>
      </body>
      </html>
    `,
    variables: [
      'customerName',
      'orderId',
      'partnerName',
      'deliveryTime',
      'amount',
    ],
    isMandatory: true,
    isActive: true,
    description: 'Notification when order is successfully delivered',
  },

  {
    id: 'tmpl_subscription_ending_alert',
    type: NotificationTemplateType.SUBSCRIPTION_ENDING_ALERT,
    recipientType: RecipientType.CUSTOMER,
    channel: NotificationChannel.BOTH,
    title: 'Subscription Ending Soon',
    subject: 'Your Milk Subscription Ends on {{endDate}}',
    pushTitle: '📅 Subscription Ending',
    pushBody: 'Your {{productName}} subscription will end on {{endDate}}. Renew now!',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Ending Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #e7e8f7; border-left: 4px solid #6c63ff; padding: 20px; border-radius: 4px;">
          <h2 style="color: #6c63ff; margin-top: 0;">📅 Your Subscription Ends Soon</h2>
          <p>Hello {{customerName}},</p>
          <p>Your {{productName}} subscription will end on <strong>{{endDate}}</strong>.</p>
          <p style="background-color: #f0f0f0; padding: 15px; border-radius: 4px;">
            <strong>Subscription Details:</strong><br>
            Product: {{productName}}<br>
            Deliveries Completed: {{deliveredCount}}<br>
            Next Delivery Date: {{nextDeliveryDate}}<br>
            Ending Date: {{endDate}}
          </p>
          <p>To continue enjoying fresh milk deliveries, <strong>renew your subscription now</strong>!</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            You can renew or modify your subscription anytime from the app.
          </p>
        </div>
      </body>
      </html>
    `,
    variables: [
      'customerName',
      'productName',
      'endDate',
      'deliveredCount',
      'nextDeliveryDate',
    ],
    isMandatory: true,
    isActive: true,
    description: 'Alert when subscription is about to end',
  },

  {
    id: 'tmpl_order_out_for_delivery',
    type: NotificationTemplateType.ORDER_OUT_FOR_DELIVERY,
    recipientType: RecipientType.CUSTOMER,
    channel: NotificationChannel.BOTH,
    title: 'Order Out for Delivery',
    subject: 'Your Order #{{orderId}} Is Out for Delivery',
    pushTitle: '🚚 Out for Delivery',
    pushBody: 'Your order is with {{partnerName}} and is on the way to you!',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Out for Delivery</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #cce5ff; border-left: 4px solid #0099ff; padding: 20px; border-radius: 4px;">
          <h2 style="color: #0066cc; margin-top: 0;">🚚 Your Order Is Out for Delivery!</h2>
          <p>Hello {{customerName}},</p>
          <p>Your order is with our delivery partner and is on the way to you!</p>
          <p><strong>Delivery Partner:</strong> {{partnerName}}</p>
          <p><strong>Contact:</strong> {{partnerPhone}}</p>
          <p><strong>Estimated Arrival:</strong> {{estimatedTime}}</p>
          <p>Track your order in real-time in the app.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Make sure the delivery address is accessible when the partner arrives.
          </p>
        </div>
      </body>
      </html>
    `,
    variables: [
      'customerName',
      'orderId',
      'partnerName',
      'partnerPhone',
      'estimatedTime',
    ],
    isMandatory: true,
    isActive: true,
    description: 'Notification when order is out for delivery',
  },

  // ============== DELIVERY PARTNER TEMPLATES ==============
  {
    id: 'tmpl_new_order_assigned',
    type: NotificationTemplateType.NEW_ORDER_ASSIGNED,
    recipientType: RecipientType.DELIVERY_PARTNER,
    channel: NotificationChannel.BOTH,
    title: 'New Order Assigned',
    subject: 'New Order #{{orderId}} Assigned To You',
    pushTitle: '📦 New Order Alert',
    pushBody: 'Order {{orderId}} assigned. Pickup location: {{pickupLocation}}',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Assigned</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 20px; border-radius: 4px;">
          <h2 style="color: #1976D2; margin-top: 0;">📦 New Order Assigned</h2>
          <p>Hello {{partnerName}},</p>
          <p>A new order has been assigned to you!</p>
          <p><strong>Order Details:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Order ID:</strong> {{orderId}}</li>
            <li><strong>Customer:</strong> {{customerName}}</li>
            <li><strong>Pickup Location:</strong> {{pickupLocation}}</li>
            <li><strong>Delivery Location:</strong> {{deliveryLocation}}</li>
            <li><strong>Items:</strong> {{itemCount}} item(s)</li>
            <li><strong>Amount:</strong> ₹{{amount}}</li>
          </ul>
          <p>View full details and navigate in the app.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Please accept or reject this order within 5 minutes.
          </p>
        </div>
      </body>
      </html>
    `,
    variables: [
      'partnerName',
      'orderId',
      'customerName',
      'pickupLocation',
      'deliveryLocation',
      'itemCount',
      'amount',
    ],
    isMandatory: true,
    isActive: true,
    description: 'Notification when new order is assigned to delivery partner',
  },

  {
    id: 'tmpl_new_subscription_assigned',
    type: NotificationTemplateType.NEW_SUBSCRIPTION_ASSIGNED,
    recipientType: RecipientType.DELIVERY_PARTNER,
    channel: NotificationChannel.BOTH,
    title: 'New Subscription Assigned',
    subject: 'New Daily Subscription Route: {{productName}}',
    pushTitle: '📅 New Subscription Route',
    pushBody: 'Subscription delivery assigned: {{productName}} for {{customerName}}',
    emailTemplate: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Subscription Assigned</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f3e5f5; border-left: 4px solid #9c27b0; padding: 20px; border-radius: 4px;">
          <h2 style="color: #7b1fa2; margin-top: 0;">📅 New Subscription Assigned</h2>
          <p>Hello {{partnerName}},</p>
          <p>A new subscription delivery route has been assigned to you!</p>
          <p><strong>Subscription Details:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Subscription ID:</strong> {{subscriptionId}}</li>
            <li><strong>Product:</strong> {{productName}}</li>
            <li><strong>Customer:</strong> {{customerName}}</li>
            <li><strong>Delivery Location:</strong> {{deliveryLocation}}</li>
            <li><strong>Delivery Schedule:</strong> {{deliverySchedule}}</li>
            <li><strong>Daily Amount:</strong> ₹{{amount}}</li>
          </ul>
          <p>This is a recurring delivery. Check app for more details.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Maintain quality and timeliness for customer satisfaction.
          </p>
        </div>
      </body>
      </html>
    `,
    variables: [
      'partnerName',
      'subscriptionId',
      'productName',
      'customerName',
      'deliveryLocation',
      'deliverySchedule',
      'amount',
    ],
    isMandatory: true,
    isActive: true,
    description: 'Notification when new subscription route is assigned',
  },
];
