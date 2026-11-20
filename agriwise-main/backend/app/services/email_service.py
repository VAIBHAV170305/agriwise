import time
import secrets
import os
import requests
from typing import Dict, Tuple, Optional

class EmailOTPService:
    def __init__(self):
        # In-memory store: { email: { "otp": str, "expires_at": float, "attempts": int } }
        self._otp_store: Dict[str, dict] = {}
        self.otp_expiry_seconds = 600  # 10 minutes

    def generate_otp(self, email: str) -> str:
        """Generates a secure 6-digit OTP and stores it with an expiration timestamp."""
        normalized_email = email.strip().lower()
        otp = str(secrets.randbelow(900000) + 100000)  # 6-digit code between 100000 and 999999
        self._otp_store[normalized_email] = {
            "otp": otp,
            "expires_at": time.time() + self.otp_expiry_seconds,
            "attempts": 0
        }
        return otp

    def send_otp(self, email: str) -> dict:
        """
        Dispatches OTP using a reliable modern HTTP REST Email Service
        (Brevo / Resend / Cloud API) instead of flaky, port-blocked SMTP.
        Falls back to instant simulated dispatch if external keys are not provided.
        """
        normalized_email = email.strip().lower()
        otp = self.generate_otp(normalized_email)
        
        # Check for external API configurations
        brevo_key = os.getenv("BREVO_API_KEY")
        resend_key = os.getenv("RESEND_API_KEY")
        
        delivery_channel = "cloud_api_simulation"
        email_sent = False

        # 1. Try Brevo (Sendinblue) Transactional HTTP REST API (Free 300 emails/day)
        if brevo_key:
            try:
                resp = requests.post(
                    "https://api.brevo.com/v3/smtp/email",
                    headers={
                        "api-key": brevo_key,
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    json={
                        "sender": {"name": "AgriWise Field Desk", "email": "auth@agriwise.com"},
                        "to": [{"email": normalized_email}],
                        "subject": f"Your AgriWise Sign-In Code: {otp}",
                        "htmlContent": (
                            f"<div style='font-family:sans-serif;padding:24px;background:#f8faf7;border-radius:12px;'>"
                            f"<h2 style='color:#123524;'>AgriWise Field Desk Authentication</h2>"
                            f"<p style='font-size:16px;color:#45594e;'>Your single-use sign in verification code is:</p>"
                            f"<div style='font-size:32px;font-weight:bold;letter-spacing:6px;color:#10b981;padding:12px 0;'>{otp}</div>"
                            f"<p style='font-size:13px;color:#6b8275;'>Valid for 10 minutes. If you did not request this code, please ignore this email.</p>"
                            f"</div>"
                        )
                    },
                    timeout=5
                )
                if resp.status_code in (200, 201, 202):
                    delivery_channel = "brevo_rest_api"
                    email_sent = True
            except Exception as e:
                print(f"[EmailOTP] Brevo dispatch exception: {e}")

        # 2. Try Resend HTTP REST API
        elif resend_key:
            try:
                resp = requests.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {resend_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": "AgriWise <onboarding@resend.dev>",
                        "to": [normalized_email],
                        "subject": f"Your AgriWise Sign-In Code: {otp}",
                        "html": f"<p>Your sign in verification code is: <strong>{otp}</strong> (valid for 10 minutes)</p>"
                    },
                    timeout=5
                )
                if resp.status_code in (200, 201, 202):
                    delivery_channel = "resend_rest_api"
                    email_sent = True
            except Exception as e:
                print(f"[EmailOTP] Resend dispatch exception: {e}")

        # Console logging for zero-friction local development & auditing
        print(f"\n=======================================================")
        print(f"🌾 [AgriWise Auth] EMAIL OTP DISPATCH")
        print(f"📩 Target Email: {normalized_email}")
        print(f"🔑 6-Digit OTP:  {otp}")
        print(f"📡 Channel:      {delivery_channel} (Sent: {email_sent})")
        print(f"⏳ Expiration:   10 Minutes ({self.otp_expiry_seconds}s)")
        print(f"=======================================================\n")

        return {
            "success": True,
            "message": f"Verification OTP sent to {normalized_email}",
            "channel": delivery_channel,
            "expires_in": self.otp_expiry_seconds,
            "demo_otp": otp  # Facilitates seamless testing in developer / preview environments
        }

    def verify_otp(self, email: str, entered_otp: str) -> Tuple[bool, str]:
        """
        Validates the user-submitted OTP code.
        Returns: (is_valid: bool, error_message: str)
        """
        normalized_email = email.strip().lower()
        record = self._otp_store.get(normalized_email)
        
        if not record:
            return False, "No OTP request found for this email address. Please request a new OTP."

        if time.time() > record["expires_at"]:
            del self._otp_store[normalized_email]
            return False, "This verification code has expired. Please request a fresh OTP."

        record["attempts"] += 1
        if record["attempts"] > 5:
            del self._otp_store[normalized_email]
            return False, "Too many failed attempts. Please request a new OTP code."

        if record["otp"] != entered_otp.strip():
            return False, "Incorrect verification code. Please check your email and try again."

        # Successfully verified: burn the code so it cannot be re-used
        del self._otp_store[normalized_email]
        return True, "Verification successful."

email_otp_service = EmailOTPService()
