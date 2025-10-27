// Initialize variables
let exchangeRate = 5.88;
let pacoteQuantidades = {
  4: 0, 9: 0,
  23: 0, 30: 0,
  40: 0, 80: 0
};

const pacotePrecos = {
  4: 3.44, 9: 7.44,
  23: 19.78, 30: 25.80,
  40: 34.40, 80: 68.80
};

// On window load
window.addEventListener('DOMContentLoaded', () => {
  animateOnScroll();
// Set input event listeners
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
      const pacote = parseInt(this.id.replace('pacote', ''));
      const quantidade = parseInt(this.value) || 0;
      updatePacoteQuantidades(pacote, quantidade);
      
      // Add typing effect
      this.classList.add('typing-effect');
      setTimeout(() => {
        this.classList.remove('typing-effect');
      }, 1000);
    });
    
    // Clear zero on focus
    input.addEventListener('focus', function() {
      if (this.value === '0') this.value = '';
    });
    
    // Restore zero if empty
    input.addEventListener('blur', function() {
      if (this.value === '') this.value = '0';
    });
  });
  // Initialize exchange rate
  atualizarCotacaoDolar();
  // Add metalic hover effects to panels
  document.querySelectorAll('.panel').forEach(panel => {
    panel.addEventListener('mouseenter', () => {
      panel.style.borderColor = 'rgba(192, 192, 192, 0.8)';
    });
    panel.addEventListener('mouseleave', () => {
      panel.style.borderColor = 'rgba(192, 192, 192, 0.3)';
    });
  });
});

function updatePacoteQuantidades(pacote, quantidade) {
  pacoteQuantidades[pacote] = parseInt(quantidade) || 0;
  updatePacoteTotals();
}

function updatePacoteTotals() {
  let totalR = 0;
  let totalD = 0;

  const pacotesUnificados = [
    [4, 9],
    [23, 30],
    [40, 80]
  ];

  pacotesUnificados.forEach(grupo => {
    let subtotalR = 0;
    let subtotalD = 0;

    grupo.forEach(pacote => {
      const quantidade = pacoteQuantidades[pacote];
      const preco = pacotePrecos[pacote];
      subtotalR += quantidade * preco * exchangeRate;
      subtotalD += quantidade * preco;
    });

    totalR += subtotalR;
    totalD += subtotalD;

    // Update subtotals
    animateCounter(`totalR${grupo[0]}`, subtotalR.toFixed(2));
    animateCounter(`totalD${grupo[0]}`, subtotalD.toFixed(2));
  });

  // Update grand totals
  animateCounter('totalRPacotes', totalR.toFixed(2));
  animateCounter('totalDPacotes', totalD.toFixed(2));
}

function animateCounter(elementId, finalValue) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const startValue = parseFloat(element.textContent) || 0;
  const finalValueNum = parseFloat(finalValue);
  const duration = 500;
  const steps = 20;
  const increment = (finalValueNum - startValue) / steps;
  
  let currentStep = 0;
  
  const interval = setInterval(() => {
    currentStep++;
    const currentValue = startValue + (increment * currentStep);
    element.textContent = currentValue.toFixed(2);
    
    if (currentStep >= steps) {
      clearInterval(interval);
      element.textContent = finalValue;
    }
  }, duration / steps);
}

async function atualizarCotacaoDolar() {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTBRL');
    if(!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    const data = await response.json();
    exchangeRate = parseFloat(data.price);
    document.getElementById('cotacao').innerHTML = `Cotação USDT/BRL: <span class="text-silver-300 font-semibold">R$${exchangeRate.toFixed(2)}</span>`;
    
    updatePacoteTotals();
  } catch (error) {
    document.getElementById('cotacao').innerText = 'Erro ao carregar cotação';
    console.error('Erro ao buscar cotação:', error);
  }
}

function copiarInformacoes() {
  let login = document.getElementById('login').value;
  let password = document.getElementById('password').value;
  let nickname = document.getElementById('nickname').value;
  let level = document.getElementById('level').value;
  let server = document.getElementById('server').value;
  let metodoLogin = document.getElementById('metodoLogin').value;
  let texto = '=== INFORMAÇÕES DA CONTA ===\n\n';
  if (login) texto += `🔑 Login: ${login}\n`;
  if (password) texto += `🔒 Password: ${password}\n`;
  if (nickname) texto += `👤 Nickname: ${nickname}\n`;
  if (level) texto += `📊 Level: ${level}\n`;
  if (server) texto += `🌐 Server: ${server}\n`;
  if (metodoLogin) texto += `🔗 Método de Login: ${metodoLogin}\n\n`;

  let pacotesTexto = '=== PACOTES ===\n\n';
let totalPacotesR = 0;
  let totalPacotesD = 0;

  Object.keys(pacoteQuantidades).forEach(pacote => {
    if (pacoteQuantidades[pacote] > 0) {
      const subtotalR = pacoteQuantidades[pacote] * pacotePrecos[pacote] * exchangeRate;
      const subtotalD = pacoteQuantidades[pacote] * pacotePrecos[pacote];
      pacotesTexto += `Pacote de $${pacote}: ${pacoteQuantidades[pacote]} (Total R$${subtotalR.toFixed(2)})\n`;
      totalPacotesR += subtotalR;
      totalPacotesD += subtotalD;
    }
  });

  if (pacotesTexto) {
  texto += `${pacotesTexto}`;
  }

  texto += `💲 Total dos Pacotes:\n💰 Total em R$: ${totalPacotesR.toFixed(2)}\n💵 Total em $: ${totalPacotesD.toFixed(2)}\n\n`;

  // Add PIX details
  texto += `=== DADOS PARA PAGAMENTO ===\n\n💠 PIX:\n📱 Chave: 14988231270\n🏦 Nome: DAOSHI TRADE\n\n🔹 Valor total: R${totalPacotesR.toFixed(2)}`;
if (texto) {
    navigator.clipboard.writeText(texto).then(() => {
      showTooltip("Todas as informações + PIX copiados! ✅");
}).catch(() => {
      showTooltip("Falha ao copiar as informações.");
    });
  }
}
// Animate elements on scroll
function animateOnScroll() {
  // No animation, just static metal effect
}
// Copy Pix details
function copiarPix() {
  const pixData = `Chave PIX: 14988231270\nNome: DAOSHI TRADE`;
  navigator.clipboard.writeText(pixData).then(() => {
    showTooltip("Dados PIX copiados!");
  }).catch(() => {
    showTooltip("Falha ao copiar dados PIX");
  });
}

// Copy Binance email
function copiarBinance() {
  navigator.clipboard.writeText("daoshicashstore@gmail.com").then(() => {
    showTooltip("Email Binance copiado!");
  }).catch(() => {
    showTooltip("Falha ao copiar email");
  });
}

function showTooltip(message) {
const tooltip = document.createElement('div');
  tooltip.textContent = message;
  tooltip.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-silver-300 px-4 py-2 rounded-lg shadow-lg z-50 opacity-0 transition-opacity duration-300';
  document.body.appendChild(tooltip);
  
  setTimeout(() => {
    tooltip.classList.add('opacity-100');
  }, 10);
  
  setTimeout(() => {
    tooltip.classList.remove('opacity-100');
    setTimeout(() => tooltip.remove(), 300);
  }, 3000);
}