<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-top: 40px;
            margin-bottom: 40px;
        }

        .header {
            background-color: #D2001A;
            padding: 30px 0;
            text-align: center;
        }

        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .content {
            padding: 40px;
            color: #333333;
            line-height: 1.6;
        }

        .greeting {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .message {
            margin-bottom: 30px;
            font-size: 16px;
        }

        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        .button {
            background-color: #D2001A;
            color: #ffffff !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            display: inline-block;
        }

        .button:hover {
            background-color: #b00016;
        }

        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #888888;
            border-top: 1px solid #eeeeee;
        }

        .warning {
            font-size: 14px;
            color: #666666;
            margin-top: 30px;
            font-style: italic;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>DANTE PROPOLIS</h1>
        </div>
        <div class="content">
            <div class="greeting">Halo,</div>
            <div class="message">
                Kami menerima permintaan untuk mereset kata sandi akun Anda. Jangan khawatir, Anda dapat membuat kata sandi baru dengan mengklik tombol di bawah ini:
            </div>

            <div class="button-container">
                <a href="{{ $url }}" class="button" target="_blank">Reset Password Saya</a>
            </div>

            <div class="message">
                Atau salin tautan berikut ke browser Anda:
                <br>
                <a href="{{ $url }}" style="color: #D2001A; word-break: break-all; font-size: 14px;">{{ $url }}</a>
            </div>

            <div class="warning">
                Jika Anda tidak merasa meminta reset password, silakan abaikan email ini. Akun Anda tetap aman.
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Dante Propolis. All rights reserved.
        </div>
    </div>
</body>

</html>