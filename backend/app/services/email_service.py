import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "1025"))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@documentsignatureapp.local")


def send_signing_email(
    recipient_name: str,
    recipient_email: str,
    document_title: str,
    signing_link: str,
    sender_name: str = None,
    sender_email: str = None
) -> bool:
    host = EMAIL_HOST
    port = EMAIL_PORT
    username = EMAIL_USERNAME
    password = EMAIL_PASSWORD
    sender = EMAIL_FROM

    sender_info_text = f"<strong>{sender_name}</strong> ({sender_email})" if (sender_name and sender_email) else "A user"

    html_content = f"""
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); overflow: hidden;">
          <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.025em;">SignFlow</h1>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 16px; font-size: 18px; font-weight: 600; line-height: 1.4;">Signature Request</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              Hello <strong>{recipient_name}</strong>,
            </p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
              {sender_info_text} has requested you to review and sign the document: <br/>
              <strong style="color: #1e293b; font-size: 16px;">"{document_title}"</strong>.
            </p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
              Please click the button below to open the secure document viewer and sign it. No account creation is required to sign this document.
            </p>
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="{signing_link}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2); transition: background-color 0.2s;">Sign Document</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 24px;" />
            <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 8px;">
              If the button above does not work, copy and paste this URL into your web browser:
            </p>
            <p style="color: #4f46e5; font-size: 13px; line-height: 1.6; word-break: break-all; margin-top: 0; margin-bottom: 0;">
              {signing_link}
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              This is an automated request. Please do not reply directly to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Signature Request for \"{document_title}\""
    
    if sender_name:
        msg["From"] = f"{sender_name} via SignFlow <{sender}>"
    else:
        msg["From"] = sender

    if sender_email:
        msg["Reply-To"] = sender_email

    msg["To"] = recipient_email

    msg.attach(MIMEText(html_content, "html"))

    try:
        if port == 465:
            server = smtplib.SMTP_SSL(host, port, timeout=10)
        else:
            server = smtplib.SMTP(host, port, timeout=10)
            try:
                server.starttls()
            except Exception:
                pass

        if username and password:
            server.login(username, password)

        server.sendmail(sender, recipient_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        # log connection errors
        print(f"Error sending email to {recipient_email}: {e}")
        return False
