// ✅ Enviar código de verificação por e-mail
router.post('/verificar-email', async (req, res) => {
    const { email } = req.body;

    const codigo = Math.floor(100000 + Math.random() * 900000); // 6 dígitos

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'projeto.artgallery@gmail.com',
            pass: 'tqjt tmwq rknx wguo', // Senha de app, não a senha normal
        },
    });

    const mailOptions = {
        from: 'ArtGallery <projeto.artgallery@gmail.com>',
        to: email,
        subject: 'Código de verificação - ArtGallery',
        text: `Seu código de verificação é: ${codigo}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        codigosVerificacao[email] = codigo;
        res.status(200).json({ sucesso: true, mensagem: 'Código enviado com sucesso.' });
    } catch (error) {
        console.error('Erro ao enviar código:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao enviar o código.' });
    }
});
