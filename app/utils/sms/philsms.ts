export const philSms = async (phoneNumber: string, message: string, sender_id: string = "ToyexFix") => {
    try {
        const response = await fetch("https://dashboard.philsms.com/api/v3/sms/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.PHIL_SMS_API_KEY}`
            },
            body: JSON.stringify({
                recipient: phoneNumber,
                sender_id: sender_id,
                type: "plain",
                message: message,

            })
        })

        return response.json();
    } catch (error) {
        console.error('Error sending SMS:', error);
        return {
            success: false,
            message: "Failed to send SMS. Please try again.",
        };
    }
}

