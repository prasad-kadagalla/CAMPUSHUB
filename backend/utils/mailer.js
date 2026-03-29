const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

exports.sendRegistrationEmail = async (user, event, qrCode) => {
  const transporter = createTransporter();
  if (!transporter) return;
  const dateStr = new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  await transporter.sendMail({
    from: `"CampusHub" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `✅ Registration Confirmed: ${event.title}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#5a4df5,#19e3cb);padding:30px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">🎓 CampusHub</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0">Registration Confirmed!</p>
        </div>
        <div style="padding:30px">
          <p style="font-size:16px">Hi <strong>${user.name}</strong>,</p>
          <p>You have successfully registered for:</p>
          <div style="background:#fff;border-radius:8px;padding:20px;margin:16px 0;border-left:4px solid #7c6ffc">
            <h2 style="margin:0 0 8px;color:#1a1a2e">${event.title}</h2>
            <p style="margin:4px 0;color:#555">📅 ${dateStr} at ${event.time}</p>
            <p style="margin:4px 0;color:#555">📍 ${event.venue}</p>
            <p style="margin:4px 0;color:#555">🏷️ ${event.category}</p>
          </div>
          <p>Your QR code for check-in is attached. Please show it at the event entrance.</p>
          <div style="text-align:center;margin:20px 0">
            <img src="${qrCode}" alt="QR Code" style="width:180px;height:180px;border:2px solid #7c6ffc;border-radius:8px">
          </div>
          <p style="color:#888;font-size:13px;margin-top:20px">This is an automated email from CampusHub. Please do not reply.</p>
        </div>
      </div>
    `,
  });
};

exports.sendEventApprovedEmail = async (event) => {
  const transporter = createTransporter();
  if (!transporter) return;
  await transporter.sendMail({
    from: `"CampusHub Admin" <${process.env.EMAIL_USER}>`,
    to: event.organizer.email,
    subject: `✅ Your event "${event.title}" has been approved!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#5a4df5,#19e3cb);padding:24px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0">🎉 Event Approved!</h1>
        </div>
        <div style="padding:24px;background:#f9f9f9;border-radius:0 0 12px 12px">
          <p>Hi <strong>${event.organizer.name}</strong>,</p>
          <p>Great news! Your event <strong>"${event.title}"</strong> has been approved by the admin and is now live on CampusHub.</p>
          <p>Students can now discover and register for your event.</p>
          <p style="color:#888;font-size:13px">CampusHub Team</p>
        </div>
      </div>
    `,
  });
};

exports.sendEventReminderEmail = async (user, event) => {
  const transporter = createTransporter();
  if (!transporter) return;
  await transporter.sendMail({
    from: `"CampusHub" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `⏰ Reminder: ${event.title} is tomorrow!`,
    html: `<p>Hi ${user.name}, just a reminder that <strong>${event.title}</strong> is happening tomorrow at ${event.time} in ${event.venue}. Don't forget your QR code!</p>`,
  });
};
