// server.js - Serveur Express pour Render
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Servir les fichiers statiques

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour envoyer l'email
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, phone, country, service, otherService, message } = req.body;

    // Validation
    if (!name || !email || !phone || !country || !service || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez remplir tous les champs obligatoires.' 
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email invalide.' 
      });
    }

    // Service personnalisé si "Autre"
    let finalService = service;
    if (service === 'Autre' && otherService) {
      finalService = `Autre: ${otherService}`;
    }

    // Configuration de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // azizgroup99@gmail.com
        pass: process.env.EMAIL_PASS  // Mot de passe d'application Gmail
      }
    });

    // Contenu de l'email
    const emailContent = `
Nouvelle demande de service - Aziz Group International

═══════════════════════════════════════════

Nom: ${name}
Email: ${email}
Téléphone: ${phone}
Pays de destination: ${country}
Service souhaité: ${finalService}

═══════════════════════════════════════════

Message:
${message}

═══════════════════════════════════════════
Date: ${new Date().toLocaleString('fr-FR')}
    `.trim();

    // Options de l'email
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: 'Nouvelle demande de service - Aziz Group International',
      text: emailContent
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'Votre demande a été envoyée avec succès!' 
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi. Veuillez réessayer.' 
    });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;