const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;

export function generateOtp(): string {
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

export async function sendSmsOtp(phoneNumber: string, otp: string): Promise<boolean> {
  const authKey = process.env.MSG91_AUTH_KEY;

  if (!authKey) {
    console.log(`[MOCK SMS] OTP for ${phoneNumber}: ${otp}`);
    return true;
  }

  try {
    // Assuming standard MSG91 OTP API format
    // You might need to update this URL and body based on your specific MSG91 template/setup
    const response = await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify({
        mobile: phoneNumber,
        otp: otp,
        // You might need a template_id here if you configured one:
        // template_id: "YOUR_TEMPLATE_ID",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("MSG91 API error:", JSON.stringify(data, null, 2));
      // Fallback to console log if API fails
      console.log(`[MOCK SMS] OTP for ${phoneNumber}: ${otp}`);
      return true;
    }

    console.log("MSG91 OTP sent successfully:", data.request_id);
    return true;
  } catch (error) {
    console.error("SMS send failed:", error);
    // Fallback to console log if API fails
    console.log(`[MOCK SMS] OTP for ${phoneNumber}: ${otp}`);
    return true;
  }
}
