import { json, type RequestHandler } from '@sveltejs/kit';
import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private'; // define in your .env file
import { PUBLIC_FEEDBACK_EMAIL } from '$env/static/public'; // define in your .env file

const resend = new Resend(RESEND_API_KEY);
const recipientEmail = PUBLIC_FEEDBACK_EMAIL;

export const POST: RequestHandler = async ({ request }) => {
	if (request.method !== 'POST') {
		return json({ error: 'Method not allowed' }, { status: 405 });
	}

	try {
		const { name, email, message } = await request.json();

		// Validate inputs
		if (!message) {
			return json({ error: 'Missing required field: message' }, { status: 400 });
		}

		// 1. Send email via Resend to me
		const result = await resend.emails.send({
			from: `Follow Your Focus <fyf@nodes.ruivo.xyz>`,
			to: `${recipientEmail}`,
			replyTo: email,
			subject: `New Note from Follow Your Focus`,
			html: `
                <h2>New Feedback Submission</h2>
                <p><strong>Name:</strong> ${name || 'Anonymous'}</p>
                <p><strong>Email:</strong> ${email || 'Anonymous'}</p>
                <h3>Message:</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
		});

		if (result.error) {
			console.error('Resend error:', result.error);
			return json({ error: 'Failed to send feedback' }, { status: 500 });
		}

		// 2. Optionally, send a confirmation email to the user if they provided an email
		if (email) {
			await resend.emails.send({
				from: `Follow Your Focus <fyf@nodes.ruivo.xyz>`,
				to: email,
				replyTo: recipientEmail,
				subject: `Thank you for your feedback!`,
				html: `
                    <h2>Thank you for your feedback!</h2>
                    <p>Hi ${name || 'there'},</p>
                    <p>I've received your Note. I really appreciate you taking the time to share your thoughts with me.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>What you sent:</strong></p>
                        <p style="white-space: pre-wrap; margin: 10px 0;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>
                    </div>

                    <p>I'll review it and get back to you if I need any clarification. You can reply directly to this email to continue the conversation.</p>
                    
                    <p>Best regards,<br>Diogo</p>
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;" />
                    <p style="color: #999; font-size: 12px;">
                        You're receiving this email because you submitted a note through Follow Your Focus. 
                        If you have any questions, feel free to reach out by replying to this email.
                    </p>
                `
			});
		}

		return json({ success: true, id: result.data?.id, confirmationSent: !!email });
	} catch (error) {
		console.error('Error sending feedback:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
