/**
 *
 * Have a look at nodemailer's config on how to set this up https://nodemailer.com/about/
 *
 */

var mail_config = {
    port: 587,
    host: 'smtp.example.com',
    auth: {
        user: 'ex@amp.le',
        pass: 'example'
    },
    secure: true,
    authMethod: 'PLAIN',
    tls: {
        ciphers:'SSLv3'
    },
    from: 'no-reply@zoff.me',
    to: 'contact@zoff.me'
    notify_mail: 'notify@mail.example',
};

module.exports = mail_config;
