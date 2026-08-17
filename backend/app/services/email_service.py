import smtplib
import asyncio
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("intrasphere.email")


def _build_activation_html(employee_name: str, activation_url: str) -> str:
    first_name = employee_name.strip().split()[0] if employee_name else "Employee"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activate Your IntraSphere Account</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
            color: #1e293b;
        }}
        .container {{
            max-width: 580px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }}
        .header {{
            background: linear-gradient(135deg, #1e293b 0%, #2563eb 100%);
            padding: 32px 40px;
            text-align: center;
        }}
        .header h1 {{
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }}
        .content {{
            padding: 40px;
        }}
        .greeting {{
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #0f172a;
        }}
        .message {{
            font-size: 15px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 32px;
        }}
        .btn-wrapper {{
            text-align: center;
            margin: 32px 0;
        }}
        .btn {{
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }}
        .btn:hover {{
            background-color: #1d4ed8;
        }}
        .expiry-note {{
            font-size: 13px;
            color: #64748b;
            background-color: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 24px;
        }}
        .footer {{
            background-color: #f8fafc;
            padding: 24px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 13px;
            color: #94a3b8;
        }}
        .link-fallback {{
            word-break: break-all;
            font-size: 12px;
            color: #64748b;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>IntraSphere</h1>
        </div>
        <div class="content">
            <div class="greeting">Hello {first_name},</div>
            <div class="message">
                Your employee account has been created for the <strong>IntraSphere Smart Office Management System</strong>.
                <br><br>
                To activate your account and create your password, click the button below:
            </div>
            <div class="btn-wrapper">
                <a href="{activation_url}" class="btn" target="_blank">Activate My Account</a>
            </div>
            <div class="expiry-note">
                ⏱️ <strong>Important:</strong> This activation link will expire in <strong>24 hours</strong>.
            </div>
            <div class="message">
                If you did not expect this invitation, please contact your HR department or system administrator.
            </div>
            <div class="link-fallback">
                If the button above doesn't work, copy and paste this URL into your web browser:
                <br>
                <a href="{activation_url}" style="color: #2563eb;">{activation_url}</a>
            </div>
        </div>
        <div class="footer">
            Regards,<br>
            <strong>IntraSphere Smart Office Management System</strong>
        </div>
    </div>
</body>
</html>
"""


def _send_smtp_sync(recipient_email: str, subject: str, html_content: str) -> tuple[bool, str]:
    from app.core.config import Settings
    current_settings = Settings()

    if not current_settings.SMTP_HOST or not current_settings.SMTP_USERNAME:
        msg = "SMTP is not fully configured (missing SMTP_HOST or SMTP_USERNAME)"
        logger.warning(msg)
        return False, msg

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{current_settings.SMTP_FROM_NAME} <{current_settings.SMTP_FROM_EMAIL}>"
        msg["To"] = recipient_email

        # Attach HTML body
        html_part = MIMEText(html_content, "html", "utf-8")
        msg.attach(html_part)

        if current_settings.SMTP_SSL:
            server = smtplib.SMTP_SSL(current_settings.SMTP_HOST, current_settings.SMTP_PORT, timeout=10)
        else:
            server = smtplib.SMTP(current_settings.SMTP_HOST, current_settings.SMTP_PORT, timeout=10)
            if current_settings.SMTP_TLS:
                server.starttls()

        if current_settings.SMTP_USERNAME and current_settings.SMTP_PASSWORD:
            server.login(current_settings.SMTP_USERNAME, current_settings.SMTP_PASSWORD)

        server.sendmail(current_settings.SMTP_FROM_EMAIL, [recipient_email], msg.as_string())
        server.quit()
        logger.info(f"Activation email sent successfully to {recipient_email}")
        return True, "Email sent successfully"
    except Exception as e:
        error_msg = f"Failed to send email to {recipient_email}: {str(e)}"
        logger.error(error_msg)
        return False, str(e)


async def send_employee_activation_email(recipient_email: str, employee_name: str, activation_url: str) -> tuple[bool, str]:
    """
    Sends account activation email asynchronously using asyncio.to_thread to avoid blocking main event loop.
    Returns (success: bool, message: str)
    """
    subject = "Welcome to IntraSphere – Activate Your Employee Account"
    html_content = _build_activation_html(employee_name, activation_url)
    
    return await asyncio.to_thread(_send_smtp_sync, recipient_email, subject, html_content)
