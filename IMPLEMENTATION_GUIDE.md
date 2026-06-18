# Notification System - Implementation Summary & Integration Guide

## What Has Been Built

### 1. **Notification Infrastructure** (MailServices)

Located in: `mailServices/src/notification/`

- **Entities**: `NotificationTemplate` (TypeORM entity for database persistence)
- **Services**:
  - `NotificationTemplateService`: CRUD operations for templates
  - `NotificationSeederService`: Auto-seed mandatory templates on startup
  - `NotificationService`: Send notifications via FCM & Email
- **Controllers**:
  - `NotificationController`: API endpoints for sending notifications (`/notifications/send`, `/notifications/send-bulk`)
  - `AdminNotificationController`: Admin endpoints (`/admin/notifications/send-custom`, `/admin/notifications/templates`)
- **DTOs**: Input/output validation with class-validator
- **Enums**: `NotificationTemplateType`, `NotificationChannel`, `RecipientType`
- **Templates**: 5 customer templates + 3 delivery partner templates pre-configured

### 2. **Database Integration**

- TypeORM configured in `mailServices/app.module.ts`
- `NotificationTemplate` table will be auto-created on startup
- Mandatory templates seeded automatically (8 total)
- Supports all template variables (customer name, order ID, amounts, etc.)

### 3. **API Endpoints Created**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/notifications/send` | POST | Send notification to single recipient |
| `/notifications/send-bulk` | POST | Send to multiple recipients |
| `/admin/notifications/send-custom` | POST | Admin broadcast custom messages |
| `/admin/notifications/templates` | GET | View all templates |
| `/admin/notifications/templates/mandatory` | GET | View mandatory templates only |
| `/admin/notifications/templates/test` | POST | Preview template with variables |

---

## What Still Needs to be Done

### Phase 1: FCM Token Integration (HIGH PRIORITY)

**In Backend Database:**
1. Add `fcmToken: string` field to `Customer` entity
2. Add `fcmToken: string` field to `DeliveryPartner` entity
3. Create endpoints for customers/partners to register their FCM token:
   - `PATCH /customer/fcm-token` 
   - `PATCH /delivery-partner/fcm-token`

**In MailServices:**
1. Implement `getAllRecipientIds()` method in `NotificationService` to query database
2. Implement `getFCMTokenForRecipient()` to fetch FCM token for sending

### Phase 2: Backend Integration Points (HIGH PRIORITY)

**Order Service** - Call notification when:
1. Order is created → `ORDER_PLACED` template
2. Order is assigned to partner → `NEW_ORDER_ASSIGNED` template (to partner)
3. Order status changes to "Out for Delivery" → `ORDER_OUT_FOR_DELIVERY` template
4. Order is delivered → `ORDER_DELIVERED` template

**Subscription Service** - Call notification when:
1. New subscription created → `NEW_SUBSCRIPTION_ASSIGNED` template (to partner)
2. Subscription ending soon (cron job) → `SUBSCRIPTION_ENDING_ALERT` template
3. Subscription delivery generated → `NEW_ORDER_ASSIGNED` template

**Wallet Service** - Call notification when:
1. Wallet balance drops below threshold → `LOW_WALLET_BALANCE` template

**Example Implementation:**
```typescript
// In order.service.ts
async createOrder(createOrderDto: CreateOrderDto) {
  const order = await this.orderRepository.save(createOrderDto);
  
  // Send notification
  await this.httpClient.post('http://localhost:4002/notifications/send', {
    recipientId: order.customerId,
    recipientType: 'CUSTOMER',
    templateType: 'ORDER_PLACED',
    variables: {
      customerName: order.customer.name,
      orderId: order.id,
      amount: order.totalAmount.toString(),
      deliveryAddress: order.address,
      estimatedTime: this.calculateEstimatedTime()
    },
    channel: 'BOTH'
  }).toPromise().catch(error => 
    this.logger.warn('Notification send failed:', error.message)
  );
  
  return order;
}
```

### Phase 3: Firebase Configuration (MEDIUM PRIORITY)

1. Obtain Firebase service account JSON from Firebase Console
2. Place at: `mailServices/src/common/firebase/serviceAccount.json`
3. Update `FirebaseService` to actually send FCM messages (currently placeholder)
4. Test FCM integration with Firebase Cloud Messaging

**Firebase Service Update Needed:**
```typescript
// src/notification/services/notification.service.ts - sendFCMNotification()

// Current: Just returns messageId
// Needed: Actually send via FirebaseService
const fcmToken = await this.getFCMToken(recipientId);
const message = {
  notification: { title, body },
  tokens: [fcmToken]
};
await this.firebaseService.sendMulticast(message);
```

### Phase 4: Email Integration (MEDIUM PRIORITY)

1. Configure SMTP server credentials in `.env`
2. Implement `getAllRecipientEmails()` in MailServices
3. Test email sending with template HTML rendering

**Environment Variables Needed:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@milkdelivery.com
```

### Phase 5: Admin UI (LOW PRIORITY - Can be done later)

1. Create admin dashboard to view templates
2. Create interface to edit template text
3. Add UI for sending custom broadcasts
4. Add notification logs/history view

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Backend (4010)                      │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐   │
│  │ Order Service  │  │ Subscription   │  │ Wallet      │   │
│  │                │  │ Service        │  │ Service     │   │
│  └────────┬───────┘  └────────┬───────┘  └─────────┬───┘   │
│           │                   │                    │        │
│           └───────────────────┼────────────────────┘        │
│                               │                             │
│                        HTTP POST calls                      │
│                   /notifications/send                       │
│                               │                             │
└───────────────────────────────┼─────────────────────────────┘
                                │
                    ┌───────────▼──────────────┐
                    │  MailServices (4002)     │
                    │  Notification Module     │
                    │                          │
                    │  ┌──────────────────┐    │
                    │  │ Notification     │    │
                    │  │ Controller       │    │
                    │  └────────┬─────────┘    │
                    │           │              │
                    │  ┌────────▼──────────┐   │
                    │  │ Notification      │   │
                    │  │ Service           │   │
                    │  └────┬─────────┬────┘   │
                    │       │         │        │
                    │   ┌───▼──┐   ┌─▼───┐    │
                    │   │ FCM  │   │ Email    │
                    │   │Sender│   │ Sender   │
                    │   └───┬──┘   └─┬───┘    │
                    │       │        │        │
                    └───────┼────────┼────────┘
                            │        │
                    ┌───────▼─┐   ┌─▼─────────┐
                    │Firebase │   │ SMTP      │
                    │Admin    │   │ Server    │
                    │SDK      │   │ (Gmail)   │
                    └─────────┘   └───────────┘

Database (MySQL):
┌──────────────────────────────────────┐
│  notification_templates              │
│  - id (UUID)                         │
│  - type (ENUM)                       │
│  - recipientType (ENUM)              │
│  - channel (ENUM)                    │
│  - title, subject, pushTitle/Body    │
│  - emailTemplate (HTML)              │
│  - variables (JSON)                  │
│  - isMandatory, isActive (BOOL)      │
└──────────────────────────────────────┘
```

---

## Testing Checklist

### Phase 1: Local Testing (Before Integration)

- [ ] TypeScript compiles without errors
- [ ] `pnpm install` succeeds in mailServices
- [ ] MailServices starts on port 4002
- [ ] `/admin/notifications/templates` returns 8 templates
- [ ] `/admin/notifications/templates/test` renders with variables
- [ ] Database has `notification_templates` table

### Phase 2: Integration Testing

- [ ] Backend can call `/notifications/send` successfully
- [ ] Email notifications appear (with test SMTP server)
- [ ] Template variables are properly substituted
- [ ] Bulk sending works for 50+ recipients
- [ ] Error handling works (invalid template type, etc.)

### Phase 3: End-to-End Testing (With Firebase)

- [ ] FCM push notifications appear on mobile devices
- [ ] Email fallback works when FCM fails
- [ ] Admin can send custom broadcasts
- [ ] Notification logs are tracked

---

## Deployment Steps (Production)

1. **Build mailServices:**
   ```bash
   cd mailServices
   pnpm run build
   ```

2. **Setup database migration:**
   - TypeORM will auto-create `notification_templates` table
   - Mandatory templates will auto-seed

3. **Set environment variables:**
   ```bash
   DB_HOST=production-mysql-host
   FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccount.json
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=production-email@gmail.com
   ```

4. **Start mailServices:**
   ```bash
   pnpm start
   ```

5. **Verify APIs:**
   ```bash
   curl http://production-mailservice/admin/notifications/templates
   ```

---

## Known Limitations & Future Improvements

1. **FCM Token Storage**: Currently using placeholder logic. Need database integration for actual tokens.
2. **Recipient Email/Phone**: Admin broadcasts need email/phone lookup from database.
3. **Notification History**: No audit log of sent notifications (can add later).
4. **Template Editor**: Admin can't edit template text yet (will require UI).
5. **Scheduled Notifications**: No support for delayed/scheduled sends.
6. **Notification Preferences**: Users can't opt-out of certain notification types yet.
7. **Multi-language Support**: Templates are currently English only.

---

## Quick Reference - Integration Points

### 1. When to Send Notifications

| Event | Template | Recipient |
|-------|----------|-----------|
| Customer creates order | ORDER_PLACED | Customer |
| Order assigned to partner | NEW_ORDER_ASSIGNED | Partner |
| Order out for delivery | ORDER_OUT_FOR_DELIVERY | Customer |
| Order delivered | ORDER_DELIVERED | Customer |
| Subscription ends soon | SUBSCRIPTION_ENDING_ALERT | Customer |
| New subscription assigned | NEW_SUBSCRIPTION_ASSIGNED | Partner |
| Wallet low | LOW_WALLET_BALANCE | Customer |

### 2. API Endpoint Template

```typescript
// Call from backend service
const response = await fetch('http://localhost:4002/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientId: userId,
    recipientType: 'CUSTOMER',
    templateType: 'ORDER_PLACED',
    variables: { /* variable values */ },
    channel: 'BOTH'
  })
});
```

### 3. Template Variable Substitution

Templates use `{{variableName}}` syntax. Just pass the values in the `variables` object - substitution is automatic.

---

## Support & Troubleshooting

**Templates not seeding?**
- Check database connection in .env
- Verify TypeORM can reach MySQL
- Check mailServices logs for errors

**Notifications not sending?**
- Verify recipient ID format
- Check template type spelling (case-sensitive)
- Ensure MailServices is running on port 4002

**Email not working?**
- Verify SMTP credentials in .env
- Check SMTP server is accepting connections
- Gmail requires "App Password" if 2FA enabled

**FCM not working?**
- Verify serviceAccount.json is present
- Check Firebase project settings
- Ensure FCM tokens are stored in database

---

## Files Created/Modified

### New Files Created:
- `mailServices/src/notification/notification.module.ts`
- `mailServices/src/notification/entities/notification-template.entity.ts`
- `mailServices/src/notification/dto/notification.dto.ts`
- `mailServices/src/notification/services/notification-template.service.ts`
- `mailServices/src/notification/services/notification.service.ts`
- `mailServices/src/notification/services/notification-seeder.service.ts`
- `mailServices/src/notification/controllers/notification.controller.ts`
- `mailServices/src/notification/controllers/admin-notification.controller.ts`
- `mailServices/src/common/enums/notification.enum.ts`
- `mailServices/src/common/interfaces/notification.interface.ts`
- `mailServices/src/common/templates/notification-templates.ts`

### Modified Files:
- `mailServices/package.json` (added typeorm, class-validator, mysql2)
- `mailServices/src/app.module.ts` (added TypeORM config, NotificationModule)
- `mailServices/src/main.ts` (added ValidationPipe)

### Documentation:
- `mailServices/NOTIFICATION_API.md` (API endpoint documentation)
- This file (implementation guide)
