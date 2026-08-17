package com.testing.springpractice.urlshortener.Service;

import com.testing.springpractice.urlshortener.DataTransferObjects.EmailDataTransferObjects.EmailRequest;
import com.testing.springpractice.urlshortener.DataTransferObjects.EmailDataTransferObjects.Receiver;
import com.testing.springpractice.urlshortener.DataTransferObjects.EmailDataTransferObjects.Sender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class EmailService {
    private final RestTemplate restTemplate;

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name:NotThatShort}")
    private String senderName;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void sendOtp(String username, String name, String otp) {
        String recipientName = (name != null && !name.isBlank() && !name.equalsIgnoreCase("user")) ? name : "Creator";
        String subject = "[NotThatShort] Your 6-Digit Fuel Key: " + otp;

        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>NotThatShort - Your Verification Key</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 15px;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="100%%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(11, 23, 54, 0.08); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
                                    <!-- Header Masthead -->
                                    <tr>
                                        <td style="background-color: #070d1e; padding: 36px 32px 30px; text-align: center;">
                                            <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                                                Not<span style="color: #60a5fa;">ThatShort</span>
                                            </div>
                                            <div style="font-size: 11px; font-weight: 700; color: #93c5fd; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px;">
                                                PROUDLY PROPORTIONED &bull; BIG LINK ENERGY
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Main Card Content -->
                                    <tr>
                                        <td style="padding: 36px 32px 28px;">
                                            <div style="font-size: 20px; font-weight: 700; color: #070d1e; margin-bottom: 12px; letter-spacing: -0.3px;">
                                                Never apologize for your length.
                                            </div>
                                            <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
                                                Hello <strong>%s</strong>,
                                            </p>
                                            <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
                                                Ready to stop overcompensating with clumsy 300-character URLs? Use your single-use power key below to authenticate and access your 100 free link trims:
                                            </p>

                                            <!-- OTP Code Block -->
                                            <div style="background-color: #0b1528; border: 2px solid #2563eb; border-radius: 12px; padding: 22px 16px; text-align: center; margin: 24px 0;">
                                                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #60a5fa; letter-spacing: 10px; display: inline-block; padding-left: 10px;">
                                                    %s
                                                </span>
                                            </div>

                                            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
                                                <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;">
                                                    <strong>Stamina Window:</strong> This verification key holds active stamina for <strong>5 minutes</strong> before expiring.
                                                </p>
                                            </div>

                                            <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
                                                If you did not request this key, someone may have mistyped their email. You can safely disregard this message.
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
                                            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                                                &copy; NotThatShort &bull; Big Link Energy &bull; Zero Overcompensation
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(recipientName, otp);

        Sender sender = Sender.builder()
                .name(senderName != null && !senderName.isBlank() ? senderName : "NotThatShort")
                .email(senderEmail)
                .build();

        Receiver receiver = Receiver.builder()
                .email(username)
                .build();

        EmailRequest request = EmailRequest.builder()
                .sender(sender)
                .to(List.of(receiver))
                .subject(subject)
                .htmlContent(html)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        HttpEntity<EmailRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.brevo.com/v3/smtp/email",
                    HttpMethod.POST,
                    entity,
                    String.class
            );
            System.out.println("Email sent successfully: " + response.getStatusCode());
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}
