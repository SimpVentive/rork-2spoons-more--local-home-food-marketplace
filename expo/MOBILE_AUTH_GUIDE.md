# Mobile Authentication Guide

## Overview

This guide documents the mobile number authentication flow with OTP (One-Time Password) and 2FA (Two-Factor Authentication) support.

## Features

✅ **Phone Number Login**
- 10-digit Indian phone number validation
- Real-time phone number formatting
- Clear error messaging

✅ **OTP Verification**
- 4-digit OTP input with auto-focus
- 60-second countdown timer
- Resend OTP functionality
- Smooth input experience

✅ **Two-Factor Authentication (2FA)**
- Additional security layer after OTP verification
- Optional 2FA for user accounts
- 4-digit code validation
- Recovery code fallback

## User Flow

```
Welcome Screen
    ↓
[Phone Number Entry] → [OTP Verification] → [2FA (if enabled)] → [Home]
         ↓                     ↓
    Validation Error      Invalid OTP Error
         ↓                     ↓
    Show Error            Show Error + Resend
```

## Components

### OTPInput Component
Located: `components/OTPInput.tsx`

A specialized input component for 4-digit OTP entry.

**Features:**
- Auto-focus to next field on digit entry
- Backspace to previous field
- Visual feedback for filled/error states
- Accessible and mobile-friendly

**Usage:**
```tsx
import OTPInput from '@/components/OTPInput';

<OTPInput
  length={4}
  value={otp}
  onChangeText={setOtp}
  error={otpError}
/>
```

### Mobile Login Screen
Located: `app/(auth)/mobile-login.tsx`

Complete authentication flow with three steps:

#### Step 1: Phone Number Entry
- Input validation (10 digits)
- Format display: +91 XXXXX XXXXX
- Clear error messages
- Send OTP button

#### Step 2: OTP Verification
- Display masked phone number
- 4-digit OTP input
- 60-second resend countdown
- Resend OTP link

#### Step 3: 2FA Verification
- 4-digit 2FA code input
- Recovery code fallback
- Success message and redirect

## Integration with Supabase

### Setup Required

1. **Enable Phone Auth in Supabase**
   ```
   Supabase Dashboard → Authentication → Providers → Phone
   - Enable SMS Provider
   - Configure Twilio or other SMS service
   - Set message templates
   ```

2. **Create Phone Auth API Functions**

   Location: `lib/supabase-auth.ts`

   ```typescript
   // Send OTP
   export const sendOTP = async (phoneNumber: string) => {
     // Format phone number with country code
     const formatted = `+91${phoneNumber}`;
     
     // Call Supabase phone auth
     const { error } = await supabase.auth.signInWithOtp({
       phone: formatted,
     });
     
     return error;
   };

   // Verify OTP
   export const verifyOTP = async (
     phoneNumber: string,
     otp: string
   ) => {
     const formatted = `+91${phoneNumber}`;
     
     const { data, error } = await supabase.auth.verifyOtp({
       phone: formatted,
       token: otp,
       type: 'sms',
     });
     
     return { data, error };
   };

   // Setup 2FA
   export const setupTwoFA = async (userId: string) => {
     // Generate TOTP secret using speakeasy or similar
     const secret = generateSecret();
     
     // Store in user_metadata
     const { error } = await supabase.auth.updateUser({
       data: {
         two_fa_secret: secret,
         two_fa_enabled: false,
       },
     });
     
     return secret;
   };

   // Verify 2FA Code
   export const verify2FA = async (userId: string, code: string) => {
     // Verify TOTP code
     const isValid = speakeasy.totp.verify({
       secret: userSecret,
       encoding: 'base32',
       token: code,
     });
     
     return isValid;
   };
   ```

3. **Update useAuth Hook**

   Location: `hooks/useAuth.tsx`

   ```typescript
   export const useAuth = () => {
     // ... existing code
     
     const signInWithPhone = async (phoneNumber: string) => {
       try {
         const error = await sendOTP(phoneNumber);
         if (error) throw error;
         return true;
       } catch (error) {
         console.error('Phone auth error:', error);
         throw error;
       }
     };

     const verifyPhoneOTP = async (phoneNumber: string, otp: string) => {
       try {
         const { data, error } = await verifyOTP(phoneNumber, otp);
         if (error) throw error;
         
         // Sync user to store
         await syncProfile(
           data.user.id,
           data.user.email,
           data.user.user_metadata?.name,
           data.user.user_metadata?.picture
         );
         
         return true;
       } catch (error) {
         console.error('OTP verification error:', error);
         throw error;
       }
     };

     return {
       // ... existing methods
       signInWithPhone,
       verifyPhoneOTP,
     };
   };
   ```

## Phone Number Validation

**Format:** 10 digits (Indian standard)

**Accepted Formats:**
- `9876543210`
- `98765 43210`
- `98765-43210`
- `+91 9876543210`
- `+91-98765-43210`

**Validation Function:**
```typescript
const validatePhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};
```

## OTP Best Practices

1. **OTP Length:** 4 digits (mobile-friendly balance)
2. **Validity:** 10 minutes (configurable in Supabase)
3. **Rate Limiting:** Max 3 attempts, then cooldown
4. **Resend Limit:** Max 5 resends per request
5. **SMS Templating:** Include app name and OTP only

## 2FA Implementation

### Enabling 2FA

```typescript
// User initiates 2FA setup
const secret = await setupTwoFA(userId);

// Display QR code for authenticator app
// User scans with Google Authenticator, Authy, etc.

// Verify with backup code
const isValid = await verify2FA(userId, code);
if (isValid) {
  // Enable 2FA for account
}
```

### 2FA During Login

```
Phone OTP Verified ✓
  ↓
Check if 2FA enabled?
  ├─ No → Login successful
  └─ Yes → Show 2FA code input
            ↓
         Verify code
            ↓
         Login successful
```

## Security Considerations

✅ **Implemented:**
- OTP validation server-side
- Rate limiting on OTP requests
- Secure token storage in Supabase
- Phone number verification before access

⚠️ **TODO:**
- Implement IP-based rate limiting
- Add SMS spoofing detection
- Monitor for suspicious login attempts
- Add user notification for new logins
- Implement account lockout after failed attempts

## Error Handling

### Common Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid phone format | User entered wrong format | Show validation error + format example |
| OTP expired | >10 minutes passed | Show "Request new OTP" message |
| Invalid OTP | Wrong code entered | Allow 3 attempts, then cooldown |
| 2FA code invalid | Wrong 2FA code | Allow 3 attempts, then show recovery code |
| Network error | Connection lost | Show retry button + offline indicator |

## Testing

### Manual Testing Checklist

- [ ] Test with valid 10-digit phone number
- [ ] Test with invalid formats (9 digits, letters, etc.)
- [ ] Test OTP resend functionality
- [ ] Test countdown timer accuracy
- [ ] Test OTP expiration (>10 min)
- [ ] Test 2FA code entry
- [ ] Test recovery code fallback
- [ ] Test offline scenarios
- [ ] Test on iOS and Android
- [ ] Test with different screen sizes

### Unit Tests Required

```typescript
// OTPInput.test.tsx
describe('OTPInput', () => {
  test('should accept only single digits');
  test('should auto-focus next input on digit entry');
  test('should focus previous on backspace');
  test('should validate 4-digit requirement');
});

// mobile-login.test.tsx
describe('Mobile Login', () => {
  test('should validate phone number format');
  test('should send OTP with valid phone');
  test('should show error on invalid OTP');
  test('should handle 2FA flow');
  test('should redirect on successful auth');
});
```

## Future Enhancements

- [ ] Support multiple countries/formats
- [ ] Biometric 2FA (fingerprint, face)
- [ ] Hardware security key support
- [ ] Email as backup 2FA method
- [ ] SMS to email fallback
- [ ] Account recovery without 2FA
- [ ] Session management (logout on other devices)
- [ ] Geolocation verification

## Support & Troubleshooting

**OTP Not Received?**
- Check SMS provider status
- Verify phone number format
- Check spam/junk messages
- Request resend after 60 seconds

**Can't Verify 2FA?**
- Ensure authenticator app time sync
- Check for app update
- Use recovery code
- Contact support

**Locked Out?**
- Use recovery code if available
- Contact support with ID proof
- Implement account recovery flow
