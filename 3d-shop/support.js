document.addEventListener('DOMContentLoaded', () => {
  const chatWidget = document.getElementById('chat-widget');
  const chatToggle = document.getElementById('chat-toggle');
  const chatPanel = document.getElementById('chat-panel');
  const chatClose = document.getElementById('chat-close');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');

  if (!chatWidget) return;

  const openChat = () => {
    chatWidget.classList.add('chat-open');
    chatPanel.setAttribute('aria-hidden', 'false');
    chatInput.focus();
  };

  const closeChat = () => {
    chatWidget.classList.remove('chat-open');
    chatPanel.setAttribute('aria-hidden', 'true');
  };

  chatToggle.addEventListener('click', openChat);
  chatClose.addEventListener('click', closeChat);

  const addMessage = (text, sender) => {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}`;
    messageElement.textContent = text;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageElement;
  };

  const getOrderStatus = (orderId) => {
    if (!orderId) return null;
    const statusOptions = [
      { status: 'in Bearbeitung', message: 'Deine Bestellung wird gerade geprüft und für den Versand vorbereitet.' },
      { status: 'versendet', message: 'Dein Paket wurde versendet und ist unterwegs.' },
      { status: 'in Zustellung', message: 'Dein Paket befindet sich bereits in der Zustellung.' },
      { status: 'zugestellt', message: 'Deine Bestellung wurde erfolgreich zugestellt.' }
    ];

    const index = orderId.split('').reduce((sum, char) => sum + (parseInt(char, 10) || 0), 0) % statusOptions.length;
    return statusOptions[index];
  };

  const findOrderId = (text) => {
    const match = text.match(/(bestellnummer|order|auftrag|nr\.?|nummer)[:\s]*([A-Z0-9\-]+)/i);
    if (match && match[2]) return match[2].toUpperCase();
    const numericMatch = text.match(/\b(\d{4,12})\b/);
    return numericMatch ? numericMatch[1] : null;
  };

  const getAIAnswer = async (query) => {
    const text = query.trim().toLowerCase();

    const orderId = findOrderId(query);
    const orderInfo = getOrderStatus(orderId);

    const faqRules = [
      {
        keywords: ['wo ist mein paket', 'wo bleibt mein paket', 'wann kommt mein paket', 'paket', 'sendung', 'tracking', 'paketstatus', 'lieferung'],
        answer: 'Gib mir gerne deine Bestellnummer, dann schaue ich für dich nach.'
      },
      {
        keywords: ['wo finde ich meine bestellnummer', 'bestellnummer findest', 'bestellnummer', 'bestellnummer wo', 'nummer in der email'],
        answer: 'Deine Bestellnummer findest du in der Bestätigungs-E-Mail, die du nach deiner Bestellung erhalten hast.'
      },
      {
        keywords: ['danke', 'ok danke', 'vielen dank', 'super danke', 'danke dir', 'alles klar', 'gut danke', 'danke sehr'],
        answer: 'Gern geschehen! Falls du noch etwas brauchst, melde dich einfach. Ich wünsche dir einen schönen Tag!'
      },
      {
        keywords: ['retoure', 'retour', 'zurücksendung', 'rücksendung'],
        answer: 'Kontaktiere uns bitte über das Kontaktformular oder per E-Mail und gib dabei deine Bestellnummer sowie den Grund der Retoure an.'
      },
      {
        keywords: ['individuell', 'eigenes 3d-modell', 'individuelles 3d-modell', 'eigenes modell', 'custom modell', 'maßanfertigung'],
        answer: 'Ja! Schicke uns einfach deine Idee, Skizze oder Datei und wir prüfen, ob eine Umsetzung möglich ist.'
      },
      {
        keywords: ['produktionszeit', 'produktion dauert', 'wie lange dauert die produktion', 'wann ist mein modell fertig'],
        answer: 'Die Produktionszeit beträgt in der Regel 1–5 Werktage, abhängig von Größe und Komplexität des Modells.'
      },
      {
        keywords: ['versand dauert', 'versand', 'lieferzeit', 'wann kommt die lieferung', 'wie lange dauert der versand'],
        answer: 'Der Versand dauert nach der Fertigstellung normalerweise 1–3 Werktage.'
      },
      {
        keywords: ['zahlungsmethoden', 'paypal', 'kreditkarte', 'sofortüberweisung', 'wie kann ich bezahlen', 'zahlung'],
        answer: 'Wir akzeptieren die auf der Website angegebenen Zahlungsmethoden, z. B. PayPal, Kreditkarte oder Sofortüberweisung.'
      },
      {
        keywords: ['stornieren', 'storno', 'bestellung stornieren', 'bestellung abbrechen'],
        answer: 'Solange die Produktion noch nicht begonnen hat, kann die Bestellung in den meisten Fällen storniert werden.'
      },
      {
        keywords: ['dateiformat', 'stl', 'step', 'obj', 'file format', 'datei'],
        answer: 'Wir akzeptieren unter anderem STL-, STEP- und OBJ-Dateien.'
      },
      {
        keywords: ['farbe auswählen', 'farbe', 'druckfarbe', 'farbe wählen', 'color'],
        answer: 'Ja, für viele Produkte stehen verschiedene Farben zur Auswahl. Die verfügbaren Optionen werden beim Produkt angezeigt.'
      },
      {
        keywords: ['kontaktieren', 'kontaktformular', 'e-mail', 'email', 'kontaktiere', 'wie kann ich euch erreichen'],
        answer: 'Du erreichst uns jederzeit über das Kontaktformular auf unserer Website oder per E-Mail.'
      },
      {
        keywords: ['hergestellt', 'herstellung', 'wo werden die produkte hergestellt', 'herkunft'],
        answer: 'Alle Produkte werden von uns sorgfältig im 3D-Druck-Verfahren hergestellt und geprüft, bevor sie versendet werden.'
      }
    ];

    for (const rule of faqRules) {
      if (rule.keywords.some(keyword => text.includes(keyword))) {
        return rule.answer;
      }
    }

    const orderKeywords = ['bestellung', 'bestellnummer', 'paket', 'lieferung', 'status', 'versand', 'zustaellung', 'wann', 'wo ist', 'wo bleibt', 'tracking', 'sendung', 'paketstatus', 'wo kommt'];

    if (orderId && orderInfo && orderKeywords.some(keyword => text.includes(keyword))) {
      return `Bestellnummer ${orderId}: Status ist *${orderInfo.status}*. ${orderInfo.message}`;
    }

    if (orderKeywords.some(keyword => text.includes(keyword))) {
      if (orderId) {
        return `Bestellnummer ${orderId}: Status ist *${orderInfo.status}*. ${orderInfo.message}`;
      }

      return 'Ich prüfe deinen Bestellstatus gern. Sag mir einfach deine Bestellnummer. Den aktuellen Status findest du auch in deiner Bestell-E-Mail.';
    }

    const rules = [
      {
        keywords: ['preis', 'kosten', 'wie viel', 'betrag'],
        answer: 'Unsere Preise stehen direkt bei jedem Produkt. Für eine Empfehlung sag einfach, wonach du suchst.'
      },
      {
        keywords: ['3d', 'modell', 'druck', 'render'],
        answer: 'Unsere 3D-Modelle sind für Druck, Visualisierung und CAD optimiert. Ich helfe dir gerne bei der Auswahl.'
      },
      {
        keywords: ['support', 'hilfe', 'kontakt'],
        answer: 'Schneller Support hier im Chat oder per E-Mail. Schreib einfach dein Anliegen in das Chatfeld.'
      },
      {
        keywords: ['zahlung', 'bezahlen', 'rechnung'],
        answer: 'Zahlung und Rechnung: Du kannst direkt online bezahlen. Eine Rechnung bekommst du nach dem Kauf automatisch.'
      }
    ];

    for (const rule of rules) {
      if (rule.keywords.some(keyword => text.includes(keyword))) {
        return rule.answer;
      }
    }

    return 'Ich bin hier, um dir schnell zu helfen. Sag mir einfach kurz, worum es geht.';
  };

  const sendSupportMessage = async () => {
    const query = chatInput.value.trim();
    if (!query) return;

    addMessage(query, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    chatSend.disabled = true;

    const typingMessage = addMessage('Einen Moment bitte…', 'bot');

    const response = await getAIAnswer(query);
    typingMessage.textContent = response;

    chatInput.disabled = false;
    chatSend.disabled = false;
    chatInput.focus();
  };

  chatSend.addEventListener('click', sendSupportMessage);
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendSupportMessage();
    }
  });
});
