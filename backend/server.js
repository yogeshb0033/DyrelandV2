require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the parent folder (dyreland_website)
const staticPath = path.join(__dirname, "..");
app.use(express.static(staticPath));

// Create Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail address from .env
    pass: process.env.EMAIL_PASS, // App password from .env
  },
});

// Helper function to generate themed HTML email
const generateEmailTemplate = (title, details) => {
  // Generate rows for the table
  const rows = Object.entries(details)
    .map(
      ([key, value]) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px; font-weight: bold; color: #555; width: 40%;">${key}</td>
            <td style="padding: 12px; color: #333;">${value || "-"}</td>
        </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .header { background-color: #0f172a; padding: 20px; text-align: center; border-bottom: 4px solid #d9534f; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .content { padding: 30px; }
            .title { color: #d9534f; margin-bottom: 20px; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            .footer { background-color: #f9f9f9; padding: 15px; text-align: center; color: #888; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Dyreland Transport</h1>
            </div>
            <div class="content">
                <div class="title">${title}</div>
                <table>
                    ${rows}
                </table>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Dyreland Transport, LLC. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};

// CONTACT US FORM HANDLER with customized HTML email
app.post("/contact", async (req, res) => {
  const {
    name,
    phone,
    email,
    company,
    service,
    subject,
    shipping,
    weight,
    pickup,
    destination,
    delivery,
    solutions,
  } = req.body;

  // Prepare data for the template
  const emailData = {
    Name: name,
    Phone: phone,
    Email: email,
    Company: company,
    "Service Type": service,
    Subject: subject,
    Cargo: shipping,
    Weight: weight,
    "Pickup Location": pickup,
    Destination: destination,
    "Delivery Date": delivery,
    "Interested Solutions": solutions,
  };

  const mailOptions = {
    from: email,
    to: "dyreland5455@gmail.com",
    subject: `New Inquiry: ${subject || "Contact Request"} from ${name}`,
    html: generateEmailTemplate(`New Contact Request from ${name}`, emailData),
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

// JOB APPLICATION FORM HANDLER with customized HTML email
app.post("/apply", async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    email,
    position,
    experience,
    drivingLocations,
    borderEligibility,
    employed,
    lastEmployment,
    howLearn,
    referralName,
    additionalInfo,
  } = req.body;

  const emailData = {
    "Applicant Name": `${firstName} ${lastName}`,
    Phone: phone,
    Email: email,
    Position: position,
    Experience: experience,
    "Preferred Locations": drivingLocations,
    "Border Eligibility": borderEligibility,
    "Currently Employed": employed,
    "Last Employment": lastEmployment,
    Referral: referralName,
    Source: howLearn,
    "Additional Info": additionalInfo,
  };

  const mailOptions = {
    from: email,
    to: "dyreland5455@gmail.com",
    subject: `Job Application: ${position} - ${firstName} ${lastName}`,
    html: generateEmailTemplate(`New Job Application: ${position}`, emailData),
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Job application submitted successfully!" });
  } catch (error) {
    console.error("Error sending job application:", error);
    res.status(500).json({ message: "Failed to send job application" });
  }
});

// GET route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
