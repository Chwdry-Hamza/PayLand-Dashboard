# Required Backend API Endpoints

## Sign Up Flow (with Email OTP Verification)

### 1. Send Signup OTP
**Endpoint:** `POST /user/send-signup-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "msg": "OTP sent successfully"
}
```

**Purpose:** Sends a 6-digit OTP to the user's email for verification during signup.

---

### 2. Create Account (with OTP Verification)
**Endpoint:** `POST /user/signup`

**Request Body:**
```json
{
  "username": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "securepassword",
  "otp": "123456",
  "userType": "user"
}
```

**Response:**
```json
{
  "success": true,
  "msg": "Account created successfully"
}
```

**Purpose:** Creates a new user account after verifying the OTP sent to their email.

---

## Forgot Password Flow (with Email Check)

### 3. Check Email Exists
**Endpoint:** `POST /user/check-email`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "exists": true
}
```

**Purpose:** Checks if an email exists in the database before sending password reset OTP.

---

### 4. Send Password Reset OTP
**Endpoint:** `POST /user/send-reset-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "msg": "OTP sent to your registered email"
}
```

**Purpose:** Sends OTP to the registered email for password reset (only if email exists).

---

### 5. Verify Password Reset OTP
**Endpoint:** `POST /user/verify-reset-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "msg": "OTP verified successfully"
}
```

**Purpose:** Verifies the OTP before allowing password reset.

---

### 6. Reset Password
**Endpoint:** `POST /user/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newsecurepassword"
}
```

**Response:**
```json
{
  "success": true,
  "msg": "Password reset successfully"
}
```

**Purpose:** Resets the user's password after OTP verification.

---

## Notification System

### 7. Get Recent Contacts (Last 24 Hours)
**Endpoint:** `GET /contact/recent-contacts`

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "count": 2,
  "contacts": [
    {
      "_id": "contact123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "country": "US",
      "phone": "+1234567890",
      "jobTitle": "Manager",
      "website": "https://example.com",
      "businessType": "services",
      "companySize": "50-150",
      "countryHQ": "US",
      "interestedIn": "payments",
      "geographiesTargeting": "global",
      "hearAboutUs": "social",
      "consent": true,
      "newsletter": true,
      "createdAt": "2025-12-12T10:30:00.000Z"
    },
    {
      "_id": "contact124",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "country": "GB",
      "phone": "+447123456789",
      "jobTitle": "Director",
      "website": "https://example.org",
      "businessType": "marketplace",
      "companySize": "150+",
      "countryHQ": "GB",
      "interestedIn": "fraud",
      "geographiesTargeting": "eu",
      "hearAboutUs": "partner",
      "consent": true,
      "newsletter": false,
      "createdAt": "2025-12-12T14:45:00.000Z"
    }
  ]
}
```

**Purpose:** Retrieves all contacts who were added in the last 24 hours for the notification bell feature.

**Implementation Notes:**
- Requires authentication (Bearer token)
- Filter contacts where `createdAt >= (current time - 24 hours)`
- Sort by `createdAt` descending (newest first)
- Return contact's `_id`, `firstName`, `lastName`, `email`, and `createdAt` fields

---

## OTP Guidelines

- OTP should be 6 digits
- OTP should expire after a certain time (recommended: 5-10 minutes)
- Store OTP temporarily in database or cache (Redis recommended)
- Invalidate OTP after successful verification

## Flow Summary

### Sign Up Process:
1. User fills: username, email, password, phone number ✅
2. Click "Send OTP" → Backend sends OTP to email ✅
3. User enters OTP → Backend verifies OTP ✅
4. Account created after successful verification ✅

### Forgot Password Process:
1. User enters email ✅
2. Backend checks if email exists in database ✅
3. If exists → Send OTP to registered email ✅
4. User enters OTP → Backend verifies ✅
5. User creates new password → Password reset ✅
