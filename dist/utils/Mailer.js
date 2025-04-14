"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderConfirmationMail = exports.ActivateSendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const ActivateSendMail = async (options) => {
    const transport = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "5000"),
        service: process.env.SMTP_SERVICES,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const { email, subject, name, activationCode } = options;
    const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject,
        html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Activation Email</title>
    <style type="text/css">
      body {
        margin: 0;
        padding: 0;
        min-width: 100;
        font-size: 16px;
        background-color: #fafafa;
        color: #222222;
      }
      a {
        color: #000;
        text-decoration: none;
      }
      h5 {
        font-size: 24px;
        font-weight: 700;
        margin-top: 0;
        margin-bottom: 15px;
        text-align: center;
      }
      p {
        margin-top: 0;
        margin-bottom: 24px;
      }
      .email-wraper {
        max-width: 600px;
        margin: 0 auto;
      }
      .emailHeader {
        background-color: #0070f3;
        padding: 24px;
        color: #fff;
      }
      .email-body {
        padding: 24px;
        background-color: #fff;
      }
      .email-footer {
        padding: 24px;
        background-color: #f6f6f6;
      }
    </style>
  </head>
  <body>
    <div class="email-wraper">
      <h1 class="emailHeader">Welcome To Lms Website</h1>
      <div class="email-body">
        <p>Hello ${name}</p>
        <p>
          Thank You For Registering with lms,To Active Your Account,Please Use
          Following Activation Code:
        </p>
        <h2>${activationCode}</h2>
        <p>Please Enter This Code on the actiavtion page within 10 minutes</p>
        <p>
          If You Did Not Register for a lms account,Please ignore This email
        </p>
      </div>
      <div class="email-footer">
        <p>
          If You have any questions,please dont hesitate to contract us at
          <a href="messi10anondo@gmail.com">messi10anondo@gmail.com</a>
        </p>
      </div>
    </div>
  </body>
</html>
`,
    };
    const mailResponse = await transport.sendMail(mailOptions);
};
exports.ActivateSendMail = ActivateSendMail;
const OrderConfirmationMail = async (options) => {
    const transport = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "5000"),
        service: process.env.SMTP_SERVICES,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const { name, subject, price, date, email, id } = options;
    const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject,
        html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Conformation</title>
    <style>
      body {
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        height: 100vh;
        margin: 0 auto;
        padding: 20px;
        background-color: #4f5ef1;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 00.1);
        color: #fff;
      }
      .message {
        text-align: center;
        font-size: 18px;
        margin-bottom: 20px;
        padding-top: 50px;
      }
      .message-sn {
        text-align: center;
        font-size: 18px;
        margin-bottom: 20px;
        padding-top: 50px;
      }
      .message-sn > h1 {
        text-align: center;
        font-size: 25px;
        font-weight: 600;
      }
      .courese-info {
        margin: auto;
        padding: 20px 0px;
        width: 100%;
        background-color: #fff;
        border-radius: 18px;
        margin-bottom: 20px;
        box-shadow: 2px 2px 2px 2px rgba(200, 197, 197, 0.1);
        color: #000;
      }
      .courese-info h4 {
        color: #23bd70;
        font-size: 22px;
        font-weight: 500;
        text-align: center;
        padding: 0 !important;
        margin-top: 0 !important;
      }
      .course-name {
        font-size: 24px;
        margin-bottom: 10px;
      }
      .purchase-info {
        font-size: 16px;
      }
      .title {
        font-size: 16px !important;
      }
      .total {
        font-size: 18px;
        text-align: right;
        margin-top: 20px;
      }
      .footer {
        text-align: center;
        margin-top: 100px;
        color: #fff;
      }
      .flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #99993f;
      }
      .flex h4 {
        font-weight: 400;
        margin-bottom: 5px;
      }
      .flex-lg {
        width: 85%;
        margin: auto;
        margin-bottom: none;
      }
      .first-td {
        text-transform: upprercase;
        color: #0000006c;
        font-size: 16px;
        padding: 5px 0px;
        width: 1%;
        font-weight: 600 !important;
      }
      .seceond-td {
        color: #000000af;
        font-weight: 500 !important;
        font-size: 15px;
      }
      td {
        width: 100%;
        border-collapse: collapse;
      }
      td {
        padding: 10px;
        text-align: center;
        width: 28.33%;
      }
      td.col-2 {
        width: 100%;
        text-align: left;
        padding: 0p;
        margin: 0px;
      }
      .table-row {
        width: 70%;
        display: block;
        margin: auto;
        padding: 10px 0px;
      }
      .m-auto {
        width: 100%;
        margin: auto;
      }
      .table-row {
        width: 70px;
        display: block;
        margin: auto;
        padding: 10px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="message-sn">
        <h1>Your Lms Order is Confirmed</h1>
        <p>and we are just as excited as you are</p>
      </div>
      <br />
      <br />
      <div class="courese-info">
        <h4>Here What You Ordered :</h4>
        <table style="border-bottom: 1px solid #0000002f">
          <tr>
            <td>Order #: ${id}</td>
          </tr>
          <tr>
            <td>Order Date: ${date}</td>
          </tr>
        </table>
        <table style="width: 90%; margin: auto; display: block">
          <tr>
            <td class="first-td">Item</td>
            <td class="first-td">Qtn</td>
            <td class="first-td">Cost</td>
          </tr>
        </table>
        <table style="width: 90%; margin: auto; display: block">
          <tr>
            <td class="first-td">${name}</td>
            <td class="first-td">1</td>
            <td class="first-td">${price}</td>
          </tr>
        </table>

        <table class="table-row">
          <tr>
            <td class="col-2">Subtotal:</td>
            <td class="col-2">${price}</td>
          </tr>
        </table>

        <table class="table-row" style="margin-top: -20px">
          <tr>
            <td class="col-2">Total:</td>
            <td class="col-2">${price}</td>
          </tr>
        </table>
      </div>
      <div class="footer">
        If You Are Any Question Please Contact Our Support Team at
        <a href="messi10anondo@gmail.com">messi10anondo@gmail.com</a>
        <p>Copy;2025 Lms All Right Reseved</p>
      </div>
    </div>
  </body>
</html>
`,
    };
    const mailResponse = await transport.sendMail(mailOptions);
};
exports.OrderConfirmationMail = OrderConfirmationMail;
