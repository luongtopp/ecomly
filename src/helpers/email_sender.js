const nodemailer = require('nodemailer')
exports.sendMail = async (email, subject, body, successMessage, errorMessage) => {

  return new Promise((resolve, reject) => {
    const transport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    })
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      text: body,
    }
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error)
        reject({
          message: errorMessage,
          statusCode: 500
        })
      } else {
        console.log('Email sent:', info.response)
        resolve({
          message: 'Password reset OTP sent to your email',
          statusCode: 200
        })
      }
    })
  })
}
