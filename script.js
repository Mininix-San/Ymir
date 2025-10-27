// ===== CONFIGURÁVEIS ===== //
//
// ESTE É O ÚNICO LUGAR QUE VOCÊ PRECISA EDITAR
//
// - 'id': Deve ser o mesmo ID usado no seu HTML (ex: <input id="p1">)
// - 'valor': O valor em dólar do pacote (ex: 4, 9, 23)
// - 'desconto': O percentual de desconto (ex: 14)
// - 'grupo': O nome do grupo para o subtotal (ex: 'grupo1', 'grupo2')
//
const CONFIG_PACOTES = [
  // Usei 'valor: 3' como você testou
  { id: 'p1', valor: 5, desconto: 14, grupo: 'grupo1' }, 
  { id: 'p2', valor: 9, desconto: 17.3, grupo: 'grupo1' },

  { id: 'p3', valor: 23, desconto: 14, grupo: 'grupo2' },
  { id: 'p4', valor: 30, desconto: 14, grupo: 'grupo2' },

  { id: 'p5', valor: 40, desconto: 14, grupo: 'grupo3' },
  { id: 'p6', valor: 80, desconto: 14, grupo: 'grupo3' }
];
// ===== FIM DOS CONFIGURÁVEIS ===== //


// --- Variáveis Globais Geradas Dinamicamente --- //
// Não edite estas variáveis diretamente
let exchangeRate = 5.88; // Será atualizado pela API
const pacoteInfo = {};      // Armazena dados calculados (preços, descontos)
let pacoteQuantidades = {}; // Armazena a quantidade de cada pacote (ex: { p1: 0, p2: 0 })
const gruposPacotes = {};     // Organiza os pacotes por grupo (ex: { grupo1: ['p1', 'p2'] })


/**
 * Inicializa as variáveis globais a partir do CONFIG_PACOTES
 */
function inicializarPacotes() {
  CONFIG_PACOTES.forEach(config => {
    const id = config.id;
    const valorOriginal = config.valor;
    const desconto = config.desconto || 0;
    const valorComDesconto = valorOriginal * (1 - desconto / 100);

    // 1. Popula pacoteInfo
    pacoteInfo[id] = {
      id: id,
      original: valorOriginal,
      comDesconto: valorComDesconto,
      desconto: desconto,
      grupo: config.grupo
    };

    // 2. Inicializa pacoteQuantidades
    pacoteQuantidades[id] = 0;

    // 3. Organiza os grupos
    if (!gruposPacotes[config.grupo]) {
      gruposPacotes[config.grupo] = [];
    }
    gruposPacotes[config.grupo].push(id);
  });
}

/**
 * Atualiza os títulos e labels no HTML com os valores do CONFIG_PACOTES
 */
function atualizarTitulosPacotes() {
  // 1. Atualizar Títulos dos Grupos (Ex: "Pacotes de 3 e 9")
  // Garante que os pacotes existem antes de tentar acessá-los
  if (pacoteInfo['p1'] && pacoteInfo['p2']) {
    document.querySelector('[data-titulo-grupo="grupo1"]').textContent = `Pacotes de ${pacoteInfo['p1'].original} e ${pacoteInfo['p2'].original}`;
  }
  if (pacoteInfo['p3'] && pacoteInfo['p4']) {
    document.querySelector('[data-titulo-grupo="grupo2"]').textContent = `Pacotes de ${pacoteInfo['p3'].original} e ${pacoteInfo['p4'].original}`;
  }
  if (pacoteInfo['p5'] && pacoteInfo['p6']) {
    document.querySelector('[data-titulo-grupo="grupo3"]').textContent = `Pacotes de ${pacoteInfo['p5'].original} e ${pacoteInfo['p6'].original}`;
  }

  // 2. Atualizar Labels das Quantidades (Ex: "Quantidade de 3:")
  Object.keys(pacoteInfo).forEach(pacoteId => { 
    const info = pacoteInfo[pacoteId];
    document.querySelectorAll(`[data-label-pacote="${pacoteId}"]`).forEach(el => {
      el.textContent = `Quantidade de ${info.original}:`;
    });
  });
}

/**
 * Atualiza os preços com desconto no HTML
 */
function atualizarPrecosDesconto() {
  Object.keys(pacoteInfo).forEach(pacoteId => {
    const info = pacoteInfo[pacoteId];
    const inputElement = document.getElementById(pacoteId);
    if (inputElement) {
      // Encontra o elemento de preço dentro do .form-group pai
      const formGroup = inputElement.closest('.form-group');
      if (formGroup) {
        const priceElement = formGroup.querySelector('.pacote-price');
        if (priceElement) {
          priceElement.textContent = `$${info.comDesconto.toFixed(2)}`;
        }
      }
    }
  });
}

// On window load
window.addEventListener('DOMContentLoaded', () => {
  inicializarPacotes();      // 1. Gera os dados dos pacotes
  atualizarTitulosPacotes(); // 2. Atualiza os títulos e labels no HTML
  atualizarPrecosDesconto(); // 3. Atualiza os preços com desconto no HTML
  animateOnScroll();

  // Set input event listeners
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
      const pacoteId = this.id; // Pega 'p1', 'p2', etc.
      
      // Verifica se o ID do input existe no nosso sistema de pacotes
      if (pacoteQuantidades.hasOwnProperty(pacoteId)) {
        const quantidade = parseInt(this.value) || 0;
        updatePacoteQuantidades(pacoteId, quantidade);
        
        // Add typing effect
        this.classList.add('typing-effect');
        setTimeout(() => {
          this.classList.remove('typing-effect');
        }, 1000);
      }
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

/**
 * Atualiza a quantidade de um pacote e recalcula os totais
 */
function updatePacoteQuantidades(pacoteId, quantidade) {
  if (pacoteQuantidades.hasOwnProperty(pacoteId)) {
    pacoteQuantidades[pacoteId] = parseInt(quantidade) || 0;
    updatePacoteTotals();
  }
}

/**
 * Calcula e exibe todos os totais e subtotais
 */
function updatePacoteTotals() {
  let totalR = 0;
  let totalD = 0; // Este será o total em Dólar ORIGINAL

  // Itera sobre os grupos definidos (ex: 'grupo1', 'grupo2')
  Object.keys(gruposPacotes).forEach(grupoId => {
    let subtotalR = 0;
    let subtotalD_original = 0;

    // Itera sobre os pacotes DENTRO de cada grupo (ex: 'p1', 'p2')
    gruposPacotes[grupoId].forEach(pacoteId => {
      const quantidade = pacoteQuantidades[pacoteId];
      if (quantidade > 0) {
        const info = pacoteInfo[pacoteId];
        subtotalR += quantidade * info.comDesconto * exchangeRate;
        subtotalD_original += quantidade * info.original; // Valor original em dólar
      }
    });

    totalR += subtotalR;
    totalD += subtotalD_original;

    // Atualiza subtotais no HTML (ex: 'totalRgrupo1', 'totalDgrupo1')
    animateCounter(`totalR${grupoId}`, subtotalR.toFixed(2));
    animateCounter(`totalD${grupoId}`, subtotalD_original.toFixed(2));
  });

  // Update grand totals
  animateCounter('totalRPacotes', totalR.toFixed(2));
  animateCounter('totalDPacotes', totalD.toFixed(2));
}

function animateCounter(elementId, finalValue) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const startValue = parseFloat(element.textContent.replace(/[^0-9.-]+/g,"")) || 0;
  const finalValueNum = parseFloat(finalValue);
  
  // Evita re-animar se o valor for o mesmo
  if (startValue === finalValueNum) {
    element.textContent = finalValueNum.toFixed(2); // Apenas garante a formatação
    return;
  }
  
  const duration = 500;
  const steps = 20;
  const increment = (finalValueNum - startValue) / steps;
  let currentStep = 0;
  
  const interval = setInterval(() => {
    currentStep++;
    const currentValue = startValue + (increment * currentStep);
    
    if (currentStep >= steps) {
      clearInterval(interval);
      element.textContent = finalValueNum.toFixed(2);
    } else {
      element.textContent = currentValue.toFixed(2);
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
    
    updatePacoteTotals(); // Recalcula tudo com a nova cotação
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
  let totalOriginalD = 0; // Valor total original em Dólar

  // Itera sobre a CONFIG_PACOTES para manter a ordem
  CONFIG_PACOTES.forEach(config => {
    const pacoteId = config.id;
    const quantidade = pacoteQuantidades[pacoteId];

    if (quantidade > 0) {
      const info = pacoteInfo[pacoteId];
      const valorPacote = info.original;
      const subtotalR = quantidade * info.comDesconto * exchangeRate;
      const subtotalD_com_desconto = quantidade * info.comDesconto;
      const subtotalD_original = quantidade * info.original;

      pacotesTexto += `💰 Pacote de ${valorPacote} (${info.desconto}% OFF): ${quantidade} un\n` +
                      `   ➤ Valor c/ desconto: $${(subtotalD_com_desconto).toFixed(2)}\n` +
                      `   ➤ Total em R$: R$${subtotalR.toFixed(2)}\n\n`;
      
      totalPacotesR += subtotalR;
      totalOriginalD += subtotalD_original;
    }
  });

  if (totalOriginalD > 0) {
    texto += `${pacotesTexto}`;
  } else {
    texto += `Nenhum pacote selecionado.\n\n`;
  }
  
  // Calcula o desconto total em R$
  const totalOriginalR = totalOriginalD * exchangeRate;
  const descontoTotalR = totalOriginalR - totalPacotesR;

  texto += `💲 RESUMO DOS PAGAMENTOS:\n` +
           `💰 Total em R$: R$${totalPacotesR.toFixed(2)}\n` +
           `💵 Total em $: $${totalOriginalD.toFixed(2)} (valor original)\n` +
           `🎉 Descontos aplicados: R$${descontoTotalR.toFixed(2)}\n\n` +

           `=== DADOS PARA PAGAMENTO ===\n\n` +
           `💠 PIX:\n📱 Chave: 14988231270\n🏦 Nome: DAOSHI TRADE\n\n` +
           `🔹 Valor total a pagar: R$${totalPacotesR.toFixed(2)}`;
           
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
