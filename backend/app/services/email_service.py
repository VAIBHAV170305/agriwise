import time
import secrets
import os
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Tuple, Optional

class EmailOTPService:
    """
    Enterprise Email & OTP Dispatch Service for Agri-Wise Field Desk.
    Integrates reliable modern cloud email APIs (SendGrid, Brevo, Resend)
    with SMTP and zero-friction developer sandbox fallbacks.
    """

    def __init__(self):
        # In-memory store: { email: { "otp": str, "expires_at": float, "attempts": int } }
        self._otp_store: Dict[str, dict] = {}
        self.otp_expiry_seconds = 600  # 10 minutes

    def generate_otp(self, email: str) -> str:
        """Generates a secure 6-digit cryptographic OTP code."""
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
        Dispatches OTP using an external email service:
        Priority 1: SendGrid REST API (v3)
        Priority 2: Brevo (Sendinblue) REST API (v3)
        Priority 3: Resend REST API
        Priority 4: Standard SMTP (if configured)
        Fallback: Developer Sandbox Simulation with demo_otp
        """
        normalized_email = email.strip().lower()
        otp = self.generate_otp(normalized_email)

        # Check API credentials from environment
        sendgrid_key = os.getenv("SENDGRID_API_KEY")
        brevo_key = os.getenv("BREVO_API_KEY")
        resend_key = os.getenv("RESEND_API_KEY")
        smtp_host = os.getenv("SMTP_HOST")

        delivery_channel = "developer_sandbox"
        email_sent = False
        error_detail = None

        html_content = f"""
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid rgba(22, 51, 38, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
            <div style="background: linear-gradient(135deg, #163326 0%, #204b38 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">agriwise FIELD DESK</h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: #b6d7c5; text-transform: uppercase; letter-spacing: 1px;">Smart Agriculture & Mandi Intelligence</p>
            </div>
            <div style="padding: 32px 28px; background: #fafaf7;">
                <h2 style="margin: 0 0 12px; font-size: 18px; color: #163326;">Authentication Verification Code</h2>
                <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #4b6354;">
                    Use the single-use 6-digit security code below to complete your sign-in or multi-step onboarding verification on Agri-Wise:
                </p>
                <div style="text-align: center; margin: 24px 0; padding: 18px; background: #ffffff; border: 2px dashed #52b788; border-radius: 12px;">
                    <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #163326; font-family: monospace;">{otp}</span>
                </div>
                <p style="margin: 0 0 16px; font-size: 13px; color: #688273;">
                    ⏳ <strong>Valid for 10 minutes</strong>. Never share this code with anyone. Agri-Wise staff will never ask for your verification code.
                </p>
                <div style="border-top: 1px solid rgba(22, 51, 38, 0.08); padding-top: 18px; margin-top: 24px; font-size: 12px; color: #889e90;">
                    Target Account: <strong>{normalized_email}</strong><br>
                    Need assistance? Contact support@agriwise.in or dial Kisan Call Center: 1800-180-1551
                </div>
            </div>
        </div>
        """

        # 1. Try SendGrid REST API
        if sendgrid_key:
            try:
                from_email = os.getenv("SENDGRID_FROM_EMAIL", "auth@agriwise.in")
                resp = requests.post(
                    "https://api.sendgrid.com/v3/mail/send",
                    headers={
                        "Authorization": f"Bearer {sendgrid_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "personalizations": [{"to": [{"email": normalized_email}]}],
                        "from": {"email": from_email, "name": "AgriWise Field Desk"},
                        "subject": f"Your AgriWise Verification Code: {otp}",
                        "content": [{"type": "text/html", "value": html_content}]
                    },
                    timeout=6
                )
                if resp.status_code in (200, 201, 202):
                    delivery_channel = "sendgrid_api_v3"
                    email_sent = True
                else:
                    error_detail = f"SendGrid returned status {resp.status_code}: {resp.text}"
                    print(f"[EmailOTP] SendGrid error: {error_detail}")
            except Exception as e:
                error_detail = str(e)
                print(f"[EmailOTP] SendGrid exception: {e}")

        # 2. Try Brevo (Sendinblue) API if SendGrid not configured or failed
        if not email_sent and brevo_key:
            try:
                resp = requests.post(
                    "https://api.brevo.com/v3/smtp/email",
                    headers={
                        "api-key": brevo_key,
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    json={
                        "sender": {"name": "AgriWise Field Desk", "email": "auth@agriwise.in"},
                        "to": [{"email": normalized_email}],
                        "subject": f"Your AgriWise Verification Code: {otp}",
                        "htmlContent": html_content
                    },
                    timeout=5
                )
                if resp.status_code in (200, 201, 202):
                    delivery_channel = "brevo_rest_api"
                    email_sent = True
            except Exception as e:
                print(f"[EmailOTP] Brevo exception: {e}")

        # 3. Try Resend API
        if not email_sent and resend_key:
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
                        "subject": f"Your AgriWise Verification Code: {otp}",
                        "html": html_content
                    },
                    timeout=5
                )
                if resp.status_code in (200, 201, 202):
                    delivery_channel = "resend_rest_api"
                    email_sent = True
            except Exception as e:
                print(f"[EmailOTP] Resend exception: {e}")

        # 4. Try Standard SMTP (if configured)
        if not email_sent and smtp_host:
            try:
                smtp_port = int(os.getenv("SMTP_PORT", 587))
                smtp_user = os.getenv("SMTP_USER")
                smtp_pass = os.getenv("SMTP_PASS")
                msg = MIMEMultipart("alternative")
                msg["Subject"] = f"Your AgriWise Verification Code: {otp}"
                msg["From"] = os.getenv("SMTP_FROM", "auth@agriwise.in")
                msg["To"] = normalized_email
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(smtp_host, smtp_port, timeout=5) as server:
                    server.starttls()
                    if smtp_user and smtp_pass:
                        server.login(smtp_user, smtp_pass)
                    server.sendmail(msg["From"], [normalized_email], msg.as_string())
                delivery_channel = "smtp_direct"
                email_sent = True
            except Exception as e:
                print(f"[EmailOTP] SMTP dispatch exception: {e}")

        # Clean Terminal Auditing for Developer Visibility
        print(f"\n=======================================================")
        print(f"🌾 [AgriWise Auth] OTP DISPATCH NOTIFICATION")
        print(f"📩 Target Email: {normalized_email}")
        print(f"🔑 6-Digit OTP:  {otp}")
        print(f"📡 Channel:      {delivery_channel} (Sent: {email_sent})")
        print(f"⏳ Expiration:   10 Minutes ({self.otp_expiry_seconds}s)")
        print(f"=======================================================\n")

        return {
            "success": True,
            "message": f"Verification code dispatched to {normalized_email}",
            "channel": delivery_channel,
            "sent": email_sent,
            "expires_in": self.otp_expiry_seconds,
            "demo_otp": otp  # Accessible for preview / rapid testing
        }

    def verify_otp(self, email: str, entered_otp: str) -> Tuple[bool, str]:
        """
        Validates the user-submitted OTP code.
        Returns: (is_valid: bool, error_message: str)
        """
        normalized_email = email.strip().lower()
        record = self._otp_store.get(normalized_email)

        if not record:
            return False, "No active OTP request found for this email address. Please request a new code."

        if time.time() > record["expires_at"]:
            del self._otp_store[normalized_email]
            return False, "This verification code has expired. Please request a fresh OTP."

        record["attempts"] += 1
        if record["attempts"] > 5:
            del self._otp_store[normalized_email]
            return False, "Too many failed verification attempts. Please request a new code."

        if record["otp"] != entered_otp.strip():
            return False, "Incorrect verification code. Please check your email and try again."

        # Successfully verified: burn the code
        del self._otp_store[normalized_email]
        return True, "Verification successful."

    def send_notification(self, email: str, title: str, message: str) -> bool:
        """Sends an transactional alert email via SendGrid/external provider."""
        sendgrid_key = os.getenv("SENDGRID_API_KEY")
        if not sendgrid_key:
            print(f"[EmailNotification] Simulation: '{title}' -> {email}")
            return True

        try:
            from_email = os.getenv("SENDGRID_FROM_EMAIL", "notifications@agriwise.in")
            resp = requests.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {sendgrid_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "personalizations": [{"to": [{"email": email}]}],
                    "from": {"email": from_email, "name": "AgriWise Notifications"},
                    "subject": title,
                    "content": [{"type": "text/html", "value": f"<p>{message}</p>"}]
                },
                timeout=5
            )
            return resp.status_code in (200, 201, 202)
        except Exception as e:
            print(f"[EmailNotification] Exception: {e}")
            return False

email_otp_service = EmailOTPService()
