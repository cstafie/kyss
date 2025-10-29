import * as nodemailer from "nodemailer";

const user = "crossable.puzzles";
const email = `${user}@outlook.com`;

interface Params {
  subject: string;
  textBody: string;
}

function sendEmail({ subject, textBody }: Params) {
  // TODO: enable this when ready
  throw new Error("Disabled for now");

  console.log("Trying to send email");

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: email,
      pass: process.env.OUTLOOK_PASSWORD,
    },
  });

  return transporter
    .sendMail({
      from: `"Crossable Feedback" <${email}>`,
      to: email,
      subject,
      text: textBody,
    })
    .then(() => console.log("Sent email success"))
    .catch((e) => console.log(e));
}

export default sendEmail;
