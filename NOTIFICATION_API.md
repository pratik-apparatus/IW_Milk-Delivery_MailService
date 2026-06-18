# Milk Delivery - Notification System API Documentation

## Overview

The notification system provides mandatory notification templates for customers and delivery partners. It supports sending notifications via FCM (Firebase Cloud Messaging) for push notifications and email fallback.

**Base URL for Notifications:** `http://localhost:4002`

---

## 1. Send Notification (Backend → MailService)

### Endpoint
```
POST /notifications/send
```

### Purpose
Send a notification to a specific recipient using a predefined template.

### Request Body
```json
{
  "recipientId": "string",
  "recipientType": "CUSTOMER" | "DELIVERY_PARTNER",
  "templateType": "LOW_WALLET_BALANCE" | "ORDER_PLACED" | "ORDER_DELIVERED" | "SUBSCRIPTION_ENDING_ALERT" | "ORDER_OUT_FOR_DELIVERY" | "NEW_ORDER_ASSIGNED" | "NEW_SUBSCRIPTION_ASSIGNED" | "ORDER_ACCEPTED",
  "variables": {
    "key1": "value1",
    "key2": "value2"
  },
  "channel": "EMAIL" | "FCM" | "BOTH",
  "customTitle": "string (optional)",
  "customBody": "string (optional)"
}
```

### Response
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "messageId": "fcm_1234567890_recipient123"
}
```

### Example: Order Placed Notification
```bash
curl -X POST http://localhost:4002/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "customer_123",
    "recipientType": "CUSTOMER",
    "templateType": "ORDER_PLACED",
    "variables": {
      "customerName": "John Doe",
      "orderId": "ORD-12345",
      "amount": "500",
      "deliveryAddress": "123 Main St, Pune",
      "estimatedTime": "9:30 AM tomorrow"
    },
    "channel": "BOTH"
  }'
```

---

## 2. Send Bulk Notifications

### Endpoint
```
POST /notifications/send-bulk
```

### Purpose
Send the same template notification to multiple recipients.

### Request Body
```json
{
  "recipientIds": ["string", "string"],
  "templateType": "string",
  "variables": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

### Response
```json
{
  "success": true,
  "message": "Notifications sent to 45/50 recipients",
  "sentTo": 45
}
```

### Example: Low Wallet Balance Alert to Multiple Customers
```bash
curl -X POST http://localhost:4002/notifications/send-bulk \
  -H "Content-Type: application/json" \
  -d '{
    "recipientIds": ["customer_1", "customer_2", "customer_3"],
    "templateType": "LOW_WALLET_BALANCE",
    "variables": {
      "customerName": "Customer",
      "amount": "250"
    }
  }'
```

---

## 3. Send Custom Notification (Admin)

### Endpoint
```
POST /admin/notifications/send-custom
```

### Purpose
Admin can send custom messages to all customers or delivery partners with a custom template.

### Request Body
```json
{
  "title": "string",
  "body": "string",
  "recipientType": "CUSTOMER" | "DELIVERY_PARTNER" | "ALL_CUSTOMERS" | "ALL_DELIVERY_PARTNERS",
  "recipientIds": ["string (optional)"],
  "channel": "EMAIL" | "FCM" | "BOTH"
}
```

### Response
```json
{
  "success": true,
  "message": "Custom notification sent to 1250 recipients",
  "sentTo": 1250
}
```

### Example: Broadcast Maintenance Message
```bash
curl -X POST http://localhost:4002/admin/notifications/send-custom \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Maintenance",
    "body": "We will have a 2-hour maintenance window tomorrow from 10 PM to 12 AM. Service will be unavailable during this time.",
    "recipientType": "ALL_CUSTOMERS",
    "channel": "BOTH"
  }'
```

---

## 4. Get All Templates

### Endpoint
```
GET /admin/notifications/templates
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "ORDER_PLACED",
      "recipientType": "CUSTOMER",
      "channel": "BOTH",
      "title": "Order Placed Successfully",
      "subject": "Your Milk Delivery Order #{{orderId}} is Confirmed",
      "pushTitle": "✅ Order Confirmed",
      "pushBody": "Your order {{orderId}} for {{amount}} has been placed.",
      "emailTemplate": "... HTML email template ...",
      "variables": ["customerName", "orderId", "amount", "deliveryAddress", "estimatedTime"],
      "isMandatory": true,
      "isActive": true,
      "description": "Confirmation email/notification when order is placed",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "count": 8
}
```

---

## 5. Get Mandatory Templates

### Endpoint
```
GET /admin/notifications/templates/mandatory
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "ORDER_PLACED",
      "recipientType": "CUSTOMER",
      ...
    }
  ],
  "count": 8
}
```

---

## 6. Test Template (Preview)

### Endpoint
```
POST /admin/notifications/templates/test
```

### Purpose
Preview how a template will look after variable substitution.

### Request Body
```json
{
  "templateType": "ORDER_PLACED",
  "variables": {
    "customerName": "John Doe",
    "orderId": "ORD-12345",
    "amount": "500",
    "deliveryAddress": "123 Main St, Pune",
    "estimatedTime": "9:30 AM"
  },
  "testEmail": "admin@example.com (optional)"
}
```

### Response
```json
{
  "success": true,
  "message": "Template rendered successfully",
  "preview": {
    "title": "Order Placed Successfully",
    "subject": "Your Milk Delivery Order #ORD-12345 is Confirmed",
    "pushTitle": "✅ Order Confirmed",
    "pushBody": "Your order ORD-12345 for 500 has been placed.",
    "emailTemplate": "... rendered HTML with all variables replaced ..."
  }
}
```

---

## Available Notification Templates

### Customer Templates

1. **LOW_WALLET_BALANCE**
   - Variables: `customerName`, `amount`
   - Trigger: Wallet balance below threshold
   - Channels: Email + FCM Push

2. **ORDER_PLACED**
   - Variables: `customerName`, `orderId`, `amount`, `deliveryAddress`, `estimatedTime`
   - Trigger: Customer creates an order
   - Channels: Email + FCM Push

3. **ORDER_OUT_FOR_DELIVERY**
   - Variables: `customerName`, `orderId`, `partnerName`, `partnerPhone`, `estimatedTime`
   - Trigger: Order is assigned and out for delivery
   - Channels: Email + FCM Push

4. **ORDER_DELIVERED**
   - Variables: `customerName`, `orderId`, `partnerName`, `deliveryTime`, `amount`
   - Trigger: Order is successfully delivered
   - Channels: Email + FCM Push

5. **SUBSCRIPTION_ENDING_ALERT**
   - Variables: `customerName`, `productName`, `endDate`, `deliveredCount`, `nextDeliveryDate`
   - Trigger: Subscription is about to expire
   - Channels: Email + FCM Push

### Delivery Partner Templates

1. **NEW_ORDER_ASSIGNED**
   - Variables: `partnerName`, `orderId`, `customerName`, `pickupLocation`, `deliveryLocation`, `itemCount`, `amount`
   - Trigger: New order assigned to partner
   - Channels: Email + FCM Push

2. **NEW_SUBSCRIPTION_ASSIGNED**
   - Variables: `partnerName`, `subscriptionId`, `productName`, `customerName`, `deliveryLocation`, `deliverySchedule`, `amount`
   - Trigger: New subscription route assigned
   - Channels: Email + FCM Push

---

## Template Variables

Templates support variable substitution using `{{variableName}}` syntax.

### Example:
```
Template: "Hello {{customerName}}, your order {{orderId}} is ready!"
Variables: { customerName: "John", orderId: "ORD-123" }
Result: "Hello John, your order ORD-123 is ready!"
```

---

## Integration with Main Backend

The main backend should call the notification endpoints when key events occur:

### Example: When Order is Placed

```typescript
// In backend order.service.ts
await this.httpClient.post('http://localhost:4002/notifications/send', {
  recipientId: customerId,
  recipientType: 'CUSTOMER',
  templateType: 'ORDER_PLACED',
  variables: {
    customerName: customer.name,
    orderId: order.id,
    amount: order.totalAmount,
    deliveryAddress: order.address,
    estimatedTime: '9:30 AM tomorrow'
  },
  channel: 'BOTH'
}).toPromise();
```

### Example: When Delivery Partner Gets New Order

```typescript
// In backend delivery-partner.service.ts
await this.httpClient.post('http://localhost:4002/notifications/send', {
  recipientId: partnerId,
  recipientType: 'DELIVERY_PARTNER',
  templateType: 'NEW_ORDER_ASSIGNED',
  variables: {
    partnerName: partner.name,
    orderId: order.id,
    customerName: customer.name,
    pickupLocation: 'Store #1, Baner',
    deliveryLocation: order.address,
    itemCount: order.items.length,
    amount: order.totalAmount
  },
  channel: 'BOTH'
}).toPromise();
```

---

## Error Responses

```json
{
  "success": false,
  "message": "Error sending notification",
  "error": "Template not found for type: INVALID_TYPE"
}
```

---

## Environment Variables

Add to `.env` file in mailServices:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=milk_delivery

# Email Configuration (SMTP Fallback)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=noreply@example.com
SMTP_PASSWORD=password
SMTP_FROM_EMAIL=noreply@milkdelivery.com

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./src/common/firebase/serviceAccount.json

# App Configuration
PORT=4002
NODE_ENV=development
```

---

## Notes

- **FCM Tokens**: Currently, the system is placeholder-ready. To fully implement FCM, customer and delivery partner profiles need FCM tokens stored.
- **Database**: Templates are auto-seeded on application startup.
- **Validation**: All DTOs are validated using class-validator.
- **Error Handling**: Failed notifications in bulk send don't stop processing of remaining recipients.
