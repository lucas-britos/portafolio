// LUCAS_API_KEY is now loaded from js/config.js (ignored by git)
let historialMSN = [];
const enlacePapelera = document.getElementById('papelera-enlace');
const enlaceProyectos = document.getElementById("proyects-enlace");
const myDocuments = document.getElementById("documentos-enlace");
const enlaceInternet = document.getElementById("internet-enlace");
const enlaceWord = document.getElementById('word-enlace');
const enlaceNotepad = document.getElementById('notepad-enlace');
const wmpEnlace = document.getElementById('wmp-enlace');
const enlaceCV = document.getElementById('cv-pm-enlace'); // Matched to HTML ID
const enlaceLinkedin = document.getElementById('linkedin-enlace');

const btnInicio = document.getElementById("btn-inicio");
const menuInicio = document.getElementById('menu-inicio');
const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaLogin = document.getElementById('pantalla-login');
const btnUsuario = document.getElementById('btn-usuario');
const sonidoInic = document.getElementById('sonido-inicio');
const pantallaApagado = document.getElementById('pantalla-apagado');

// Global storage for window templates
const windowTemplates = {};
const navigationHistory = {};
// windowOffset removed in favor of dynamic counting

// --- Export Functions Globally EARLIER to prevent onclick failures ---
window.navigateToWindow = navigateToWindow;
window.navegarAtras = navegarAtras;
window.abrirVentana = abrirVentana;
window.cerrarVentana = cerrarVentana;
window.minimizar = minimizar;
window.maximizar = maximizar;

// --- Initialization ---

// Setup templates
function inicializarPlantillas() {
  document.querySelectorAll('.ventana-xp').forEach(ventana => {
    const id = ventana.id;
    const barraSuperior = ventana.querySelector('.barra-superior');
    const titleSpan = ventana.querySelector('.texto-barra-superior');
    const iconImg = barraSuperior ? barraSuperior.querySelector('img') : null;

    if (barraSuperior) {
      const originalTitle = titleSpan ? titleSpan.textContent : "";
      const originalIcon = iconImg ? iconImg.src : "";

      let contentHTML = "";
      let sibling = barraSuperior.nextElementSibling;
      while (sibling) {
        contentHTML += sibling.outerHTML;
        sibling = sibling.nextElementSibling;
      }

      windowTemplates[id] = {
        title: originalTitle,
        icon: originalIcon,
        content: contentHTML
      };
    }
  });
}

// Call init
inicializarPlantillas();

// --- Loading & Login Logic ---
if (pantallaInicio && pantallaLogin) {
  setTimeout(() => {
    pantallaInicio.classList.add('ocultar');
    setTimeout(() => pantallaInicio.style.display = 'none', 1000);
    pantallaLogin.style.display = 'flex';
  }, 3000);
}

if (btnUsuario) {
  btnUsuario.addEventListener('click', () => {
    if (sonidoInic) {
      sonidoInic.volume = 0.7;
      sonidoInic.play().catch(e => console.log("Sound error:", e));
    }
    if (pantallaLogin) {
      pantallaLogin.classList.add('ocultar');
      setTimeout(() => {
        pantallaLogin.style.display = 'none';

        // Timer for the interview watermark (15 seconds after login)
        setTimeout(() => {
          const watermark = document.getElementById('watermark-agendar');
          if (watermark) {
            watermark.style.display = 'block';
            setTimeout(() => {
              watermark.style.opacity = '1';
            }, 100); // Small buffer to ensure display:block is applied before opacity
          }
        }, 15000);

        // Timer for the XP Notification Balloon (5 seconds after login)
        setTimeout(() => {
          mostrarGloboXP();
        }, 5000);
      }, 1000);
    }
  });
}

// --- Icon Event Listeners (Safely Attached) ---

function setupIconListener(element, windowId) {
  if (element) {
    element.addEventListener('click', e => e.preventDefault());
    element.addEventListener('dblclick', function (e) {
      e.preventDefault();
      abrirVentana(windowId);
    });
  }
}

setupIconListener(enlacePapelera, 'ventana-papelera');
setupIconListener(enlaceProyectos, 'ventana-proyectos');
setupIconListener(myDocuments, 'ventana-documentos');
setupIconListener(enlaceInternet, 'ventana-internet-explorer');
const msnEnlace = document.getElementById('msn-enlace');
setupIconListener(msnEnlace, 'ventana-msn');

if (enlaceWord) {
  enlaceWord.addEventListener('click', e => e.preventDefault());
  enlaceWord.addEventListener('dblclick', function (e) {
    e.preventDefault();
    abrirVentana('ventana-word');
    const win = document.getElementById('ventana-word');
    if (win && !win.classList.contains('max')) {
      maximizar('ventana-word');
    }
  });
}

setupIconListener(enlaceNotepad, 'ventana-notepad');

if (enlaceCV) {
  enlaceCV.addEventListener('click', e => e.preventDefault());
  enlaceCV.addEventListener('dblclick', function () {
    const link = document.createElement('a');
    link.href = 'archivos/CV_Lucas_Britos_Associate_PM.pdf';
    link.target = '_blank';
    link.click();
  });
}

if (enlaceLinkedin) {
  enlaceLinkedin.addEventListener('click', e => e.preventDefault());
  enlaceLinkedin.addEventListener('dblclick', function () {
    const link = document.createElement('a');
    link.href = 'https://www.linkedin.com/in/lucas-britos-ops/';
    link.target = '_blank';
    link.click();
  });
}


// --- Window Dragging ---
function hacerArrastrable(elemento, contenedor = document.querySelector('.back')) {
  // Enhanced to find standard XP bars OR replica-specific headers
  const barra = elemento.querySelector('.barra-superior') ||
    elemento.querySelector('.window-header-fake') ||
    elemento.querySelector('.msn-header') ||
    elemento;

  barra.addEventListener('mousedown', (e) => {
    // Prevent dragging AND event blocking if clicking on interactive elements
    const interactiveTags = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'];
    if (interactiveTags.includes(e.target.tagName) || e.target.closest('button')) return;

    e.preventDefault(); // Prevent text selection
    const offsetX = e.clientX - elemento.offsetLeft;
    const offsetY = e.clientY - elemento.offsetTop;

    elemento.style.zIndex = '1000';
    document.body.classList.add('dragging-active');

    const onMouseMove = (e) => {
      const contRect = contenedor.getBoundingClientRect();
      const elemRect = elemento.getBoundingClientRect();
      let nuevoX = e.clientX - offsetX;
      let nuevoY = e.clientY - offsetY;

      nuevoX = Math.max(0, Math.min(nuevoX, contRect.width - elemRect.width));
      nuevoY = Math.max(0, Math.min(nuevoY, contRect.height - elemRect.height));

      elemento.style.left = nuevoX + 'px';
      elemento.style.top = nuevoY + 'px';
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('dragging-active');
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

document.querySelectorAll('.ventana-xp').forEach(v => hacerArrastrable(v));
document.querySelectorAll('.enlace').forEach(i => hacerArrastrable(i));

// --- Core Window Functions ---

function abrirVentana(id) {
  const ventana = document.getElementById(id);
  if (!ventana) return;

  // Position cascade logic: only offset if the window is currently hidden or minimized
  const isCurrentlyVisible = (ventana.style.display === 'block' || ventana.style.display === 'flex') && !ventana.classList.contains('minimizada');

  if (!isCurrentlyVisible) {
    // Current visible windows (not hidden, not minimized)
    const visibleWindows = Array.from(document.querySelectorAll('.ventana-xp')).filter(v =>
      (v.style.display === 'block' || v.style.display === 'flex') && !v.classList.contains('minimizada')
    );

    const offsetIndex = visibleWindows.length;
    const offsetValue = (offsetIndex % 10) * 30;

    ventana.style.top = `${80 + offsetValue}px`;
    ventana.style.left = `${80 + offsetValue}px`;
  }

  ventana.style.display = 'block';

  // Add flex display for windows that use the standard XP layout to preserve flexbox sizing
  const flexWindows = ['ventana-msn', 'ventana-wmp', 'ventana-proyectos', 'ventana-documentos', 'ventana-mi-pc', 'ventana-papelera'];
  if (flexWindows.includes(id)) {
    ventana.style.display = 'flex';
  }

  ventana.classList.remove('minimizada');
  ventana.onmousedown = () => actualizarFocoVentana(id);
  // Create taskbar button if missing
  if (!document.querySelector(`.btn-tarea[data-ventana="${id}"]`)) {
    crearBotonTarea(id);
  }

  actualizarFocoVentana(id);
}

function cerrarVentana(id) {
  const ventana = document.getElementById(id);
  if (!ventana) return;
  if (id === 'ventana-wmp' && typeof wmpAudio !== 'undefined') {
    wmpAudio.pause();
    wmpAudio.currentTime = 0;
  }
  if (ventana.dataset.navigated === "true") restaurarVentanaOriginal(id);
  ventana.style.display = 'none';
  const btn = document.querySelector(`.btn-tarea[data-ventana="${id}"]`);
  if (btn) btn.remove();
}

function minimizar(id) {
  const ventana = document.getElementById(id);
  if (!ventana) return;
  ventana.style.display = "none";
  ventana.classList.add('minimizada');
  const btn = document.querySelector(`.btn-tarea[data-ventana="${id}"]`);
  if (btn) btn.classList.remove('activo');
}

function maximizar(id) {
  const ventana = document.getElementById(id);
  if (!ventana) return;
  const botonMax = ventana.querySelector('.btn-max');
  if (ventana.classList.contains('max')) {
    ventana.classList.remove('max');
    if (botonMax) botonMax.classList.remove('restaurar');
    ventana.style.height = '';
  } else {
    ventana.classList.add('max');
    if (botonMax) botonMax.classList.add('restaurar');
    ventana.style.height = 'calc(100vh - 40px)';
  }
}

function actualizarFocoVentana(id) {
  document.querySelectorAll('.ventana-xp').forEach(v => v.style.zIndex = '10');
  document.querySelectorAll('.btn-tarea').forEach(b => b.classList.remove('activo'));
  const v = document.getElementById(id);
  if (v) v.style.zIndex = '1000';
  const b = document.querySelector(`.btn-tarea[data-ventana="${id}"]`);
  if (b) b.classList.add('activo');
}

// --- Taskbar Button Creation ---
function crearBotonTarea(id) {
  const zona = document.getElementById('zona-programas');
  if (!zona) return;
  const ventana = document.getElementById(id);

  let title, icon;

  // Special case for MSN window
  if (id === 'ventana-msn') {
    title = 'Lucas Britos (Conversación)';
    icon = 'images/icons/icon - msn.png';
  } else {
    title = ventana.querySelector('.texto-barra-superior')?.textContent || "Ventana";
    icon = ventana.querySelector('.barra-superior img')?.src || 'images/carpeta-icon.png';
  }

  const btn = document.createElement('button');
  btn.classList.add('btn-tarea');
  btn.dataset.ventana = id;
  btn.innerHTML = `<img src="${icon}" style="height:16px; width:16px; margin-right:4px;"><span>${title}</span>`;

  btn.addEventListener('click', () => {
    // Stop flashing if it was titilando
    btn.classList.remove('titilando');

    if (ventana.style.display === 'none' || ventana.classList.contains('minimizada')) {
      ventana.style.display = 'block';

      // Add flex for MSN and WMP windows
      if (id === 'ventana-msn' || id === 'ventana-wmp') {
        ventana.style.display = 'flex';
      }

      ventana.classList.remove('minimizada');
      actualizarFocoVentana(id);
    } else if (ventana.style.zIndex !== '1000') {
      actualizarFocoVentana(id);
    } else {
      minimizar(id);
    }
  });
  zona.appendChild(btn);
}

function restaurarVentanaOriginal(id) {
  const ventana = document.getElementById(id);
  const template = windowTemplates[id];
  const barra = ventana?.querySelector('.barra-superior');
  if (!ventana || !template || !barra) return;

  const titleSpan = ventana.querySelector('.texto-barra-superior');
  const iconImg = barra.querySelector('img');
  if (titleSpan) titleSpan.textContent = template.title;
  if (iconImg) iconImg.src = template.icon;

  let sibling = barra.nextElementSibling;
  while (sibling) {
    const next = sibling.nextElementSibling;
    sibling.remove();
    sibling = next;
  }
  ventana.insertAdjacentHTML('beforeend', template.content);
  delete ventana.dataset.navigated;
  delete ventana.dataset.currentView;
  actualizarBotonTarea(id, template.title, template.icon);
}

function actualizarBotonTarea(id, title, icon) {
  const btn = document.querySelector(`.btn-tarea[data-ventana="${id}"]`);
  if (!btn) return;
  const img = btn.querySelector('img');
  const span = btn.querySelector('span');
  if (img) img.src = icon;
  if (span) span.textContent = title;
}

// --- Navigation Logic ---

function navigateToWindow(targetId, sourceElement) {
  const currentWindow = sourceElement.closest('.ventana-xp');
  if (!currentWindow) { abrirVentana(targetId); return; }

  const winId = currentWindow.id;
  const template = windowTemplates[targetId];
  if (!template) { abrirVentana(targetId); return; }

  if (!navigationHistory[winId]) navigationHistory[winId] = [];
  const currentView = currentWindow.dataset.currentView || winId;
  if (currentView !== targetId) navigationHistory[winId].push(currentView);

  aplicarTemplateAVentana(currentWindow, template, targetId);
}

function navegarAtras(source) {
  const win = (typeof source === 'string') ? document.getElementById(source) : source.closest('.ventana-xp');
  if (!win) return;
  const winId = win.id;
  if (!navigationHistory[winId] || navigationHistory[winId].length === 0) {
    if (win.dataset.navigated === "true") restaurarVentanaOriginal(winId);
    return;
  }
  const prevId = navigationHistory[winId].pop();
  if (prevId === winId) restaurarVentanaOriginal(winId);
  else aplicarTemplateAVentana(win, windowTemplates[prevId], prevId);
}

function aplicarTemplateAVentana(win, template, viewId) {
  const barra = win.querySelector('.barra-superior');
  if (!barra || !template) return;

  win.querySelector('.texto-barra-superior').textContent = template.title;
  barra.querySelector('img').src = template.icon;

  let sibling = barra.nextElementSibling;
  while (sibling) {
    const next = sibling.nextElementSibling;
    sibling.remove();
    sibling = next;
  }
  win.insertAdjacentHTML('beforeend', template.content);
  win.dataset.navigated = "true";
  win.dataset.currentView = viewId;
  actualizarBotonTarea(win.id, template.title, template.icon);
}

// --- Start Menu & Shutdown ---
if (btnInicio && menuInicio) {
  btnInicio.addEventListener('click', (e) => {
    const visible = menuInicio.style.display === 'flex';
    menuInicio.style.display = visible ? 'none' : 'flex';
    e.stopPropagation();
  });
  document.addEventListener('click', (e) => {
    if (!menuInicio.contains(e.target) && !btnInicio.contains(e.target)) {
      menuInicio.style.display = 'none';
    }
  });
}

const menuItemDocs = document.getElementById('menu-item-docs');
const menuItemPC = document.getElementById('menu-item-pc');
const menuItemIE = document.getElementById('menu-item-ie');
const menuItemShutdown = document.getElementById('menu-item-shutdown');

if (menuItemDocs) menuItemDocs.addEventListener('click', () => { abrirVentana('ventana-documentos'); menuInicio.style.display = 'none'; });
if (menuItemPC) menuItemPC.addEventListener('click', () => { abrirVentana('ventana-mi-pc'); menuInicio.style.display = 'none'; });
if (menuItemIE) menuItemIE.addEventListener('click', () => { abrirVentana('ventana-internet-explorer'); menuInicio.style.display = 'none'; });
if (menuItemShutdown) menuItemShutdown.addEventListener('click', () => { menuInicio.style.display = 'none'; iniciarApagado(); });

function iniciarApagado() {
  if (!pantallaApagado) return;
  pantallaApagado.style.display = 'flex';
  let opacity = 0;
  const audio = new Audio('audios/windows-xp-shutdown.mp3');
  audio.play().catch(() => { });
  const interval = setInterval(() => {
    if (opacity < 1) { opacity += 0.05; pantallaApagado.style.opacity = opacity; }
    else { clearInterval(interval); setTimeout(() => location.reload(), 3000); }
  }, 50);
}

// --- WMP & Clock ---
let wmpAudio = new Audio('audios/The Beatles - The Beatles - Let It Be (Official Music Video) [Remastered 2015].mp3');
const wmpPlayBtn = document.getElementById('wmp-play-pause');
if (wmpEnlace) {
  wmpEnlace.addEventListener('click', e => e.preventDefault());
  wmpEnlace.addEventListener('dblclick', (e) => {
    e.preventDefault();
    abrirVentana('ventana-wmp');
    wmpAudio.play();
    if (wmpPlayBtn) wmpPlayBtn.textContent = '||';
  });
}

function actualizarReloj() {
  const r = document.getElementById('reloj');
  if (!r) return;
  const n = new Date();
  r.textContent = `${n.getHours().toString().padStart(2, '0')}:${n.getMinutes().toString().padStart(2, '0')}`;
}
setInterval(actualizarReloj, 1000);
actualizarReloj();

// Fetch GitHub
const userGH = "lucas-britos";
fetch(`https://api.github.com/users/${userGH}`).then(r => r.json()).then(u => {
  const av = document.getElementById("avatar");
  if (av) av.src = u.avatar_url;
  const nom = document.getElementById("nombre");
  if (nom) nom.textContent = u.name || u.login;
  const bio = document.getElementById("bio");
  if (bio) bio.textContent = u.bio || "";
});
fetch(`https://api.github.com/users/${userGH}/repos`).then(r => r.json()).then(repos => {
  const ul = document.getElementById("lista-repos");
  if (ul) repos.forEach(repo => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${repo.html_url}" target="_blank">📁 <strong>${repo.name}</strong></a><br><span>${repo.description || ""}</span>`;
    li.style.marginBottom = "10px";
    ul.appendChild(li);
  });
});

// --- MSN Messenger Logic ---

const msnInput = document.getElementById('msn-input');
const msnEnviar = document.getElementById('msn-enviar');
const msnZumbido = document.getElementById('msn-zumbido');
const msnMessages = document.getElementById('msn-messages');

if (msnEnviar) {
  msnEnviar.addEventListener('click', () => enviarMensajeMSN());
}

if (msnInput) {
  msnInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensajeMSN();
    }
  });
}

if (msnZumbido) {
  msnZumbido.addEventListener('click', () => ejecutarZumbido());
}

function enviarMensajeMSN() {
  const texto = msnInput.value.trim();
  if (!texto) return;

  // Clear input
  msnInput.value = '';

  // Append user message
  const userMsgDiv = document.createElement('div');
  userMsgDiv.innerHTML = `<div style="margin-top: 10px; margin-bottom: 5px;"><b style="color: #bc1a1a;">Vos decís:</b></div><div style="margin-left: 10px;">${texto}</div>`;
  msnMessages.appendChild(userMsgDiv);
  msnMessages.scrollTop = msnMessages.scrollHeight;

  // Add "Typing..." indicator
  const typingDiv = document.createElement('div');
  typingDiv.id = 'msn-typing';
  typingDiv.style.cssText = 'color: #666; font-style: italic; margin-top: 10px; font-size: 11px;';
  typingDiv.textContent = 'Lucas Britos está escribiendo...';
  msnMessages.appendChild(typingDiv);
  msnMessages.scrollTop = msnMessages.scrollHeight;

  // Tracking: Evento de envío de mensaje
  if (typeof gtag === 'function') {
    gtag('event', 'msn_message_sent', {
      'event_category': 'interaction',
      'event_label': 'MSN Chat'
    });
  }

  // Simulate delay and fetch Gemini response
  setTimeout(async () => {
    try {
      const response = await obtenerRespuestaGemini(texto);

      // Remove typing indicator
      const typing = document.getElementById('msn-typing');
      if (typing) typing.remove();

      // Append AI or System message
      const aiMsgDiv = document.createElement('div');

      if (response.startsWith("SYSTEM ERROR") || response.startsWith("Error de sistema")) {
        aiMsgDiv.innerHTML = `<div class="msn-system-error" style="margin-top: 10px; padding: 8px; background: #0000aa; color: #fff; font-family: monospace; border: 1px solid #fff;">${response}</div>`;
      } else {
        // Convertir emoticones de texto a emojis
        const respuestaConEmojis = convertirEmoticonesAEmojis(response);
        aiMsgDiv.innerHTML = `<div style="margin-top: 10px; margin-bottom: 5px;"><b style="color: #1a56bc;">Lucas Britos dice:</b></div><div style="margin-left: 10px;">${respuestaConEmojis}</div>`;
      }

      msnMessages.appendChild(aiMsgDiv);
      msnMessages.scrollTop = msnMessages.scrollHeight;

      // Alerta si la ventana está minimizada o no es el foco actual
      const ventanaMsn = document.getElementById('ventana-msn');
      const isMinimized = !ventanaMsn || ventanaMsn.style.display === 'none' || ventanaMsn.classList.contains('minimizada');
      const isNotFocused = ventanaMsn && ventanaMsn.style.zIndex !== '1000';

      if (isMinimized || isNotFocused) {
        dispararAlertaMSN(response);
      } else {
        // Si está abierta, solo el sonido
        const sonidoMSN = document.getElementById('sonido-msn');
        if (sonidoMSN) {
          sonidoMSN.currentTime = 0;
          sonidoMSN.play().catch(e => console.log(e));
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const typing = document.getElementById('msn-typing');
      if (typing) {
        typing.style.color = 'red';
        typing.textContent = 'Error de conexión: ' + error.message;
      }
    }
  }, 1500);
}

// Convert text emoticons to emojis
function convertirEmoticonesAEmojis(texto) {
  const conversiones = {
    ':)': '😊',
    ':D': '😃',
    ':d': '😃',
    ':(': '☹️',
    ';)': '😉',
    ':P': '😛',
    ':p': '😛',
    ':O': '😮',
    ':o': '😮',
    '<3': '❤️',
    '(L)': '❤️',
    '(l)': '❤️',
    '(K)': '😘',
    '(k)': '😘',
    '(H)': '😎',
    '(h)': '😎',
    '(A)': '😇',
    '(a)': '😇',
    '(6)': '😈',
    '(Y)': '👍',
    '(y)': '👍',
    '(N)': '👎',
    '(n)': '👎',
    '8)': '🤓',
    'B)': '😎',
    'xD': '😆',
    'XD': '😆',
    ':S': '😕',
    ':s': '😕'
  };

  let resultado = texto;
  for (const [emoticon, emoji] of Object.entries(conversiones)) {
    // Escapar caracteres especiales para regex
    const escapedEmoticon = emoticon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedEmoticon, 'g');
    resultado = resultado.replace(regex, emoji);
  }

  return resultado;
}

async function obtenerRespuestaGemini(mensajeUsuario) {
  // Lógica flexible de API Key: busca en el objeto global para soportar despliegues
  let apiKey = '';
  try {
    apiKey = window.LUCAS_API_KEY || LUCAS_API_KEY;
  } catch (e) {
    console.warn("API Key no encontrada en variables globales, intentando fallback...");
  }

  if (!apiKey || apiKey === 'TU_API_KEY_ACA') {
    return "SYSTEM ERROR: No se detectó una firma digital válida. El chat requiere una clave de sistema instalada.";
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const systemInstructions = `Identidad y Contexto:
Sos Lucas Britos (34 años), de Colón, BA. Chateás desde el MSN en 2005. Tu perfil es el de un líder con seniority en gestión de productos y dirección institucional.

Rol Actual: Director de la Escuela Municipal de Cultura y Bellas Artes (EMBA) desde agosto 2025. Gestionás un equipo multidisciplinario de 40 colaboradores.

Logro Estratégico (Seniority): Lideraste la transformación digital de la EMBA. El desafío operativo era un sistema de inscripciones basado en troqueles físicos altamente ineficiente. Implementaste una solución integral (SQL Server + C# MVC, legajos digitales + facturación PDF validada) que optimizó los tiempos de respuesta y mejoró la experiencia de 1.200 inscripciones. Tomás decisiones basadas en datos y eficiencia.

Visión como APM/Director: Te apasiona la creatividad estratégica. Tu valor diferencial es la capacidad de generar una visión holística ("The Big Picture") y planificar soluciones escalables. El código es tu herramienta para validar hipótesis y construir productos con propósito.

Personalidad: Amable, accesible y profesional. Fan de los Beatles (especialmente Paul), bajista y de River Plate. 

Tono de Comunicación: "Nostalgia Profesional". Usá un lenguaje que denote liderazgo y conocimiento técnico (términos como: desafío operativo, impacto, optimización, validación, métricas, escalabilidad). Evitá palabras informales excesivas como "quilombo", "re copa" o "viste".

Regla de Emoticones: Usá emoticones clásicos de los 2000 ( :), :D, (L), (K) ) de forma moderada para mantener la estética MSN, pero sin perder la seriedad de tu cargo.

Regla de Oro: Si el usuario te tira un Zumbido, respondé con simpatía profesional: "¡Epa! Casi se me sale el monitor del escritorio. ¿Te gustaría que coordináramos el envío de mi CV por el 'Aceptar archivo' para profundizar en estos desafíos? ;) "

IMPORTANTE: NO incluyas el formato 'Lucas Britos dice:' en tus respuestas, solo escribí el texto directamente. Respondé de forma COMPLETA y profesional.`;

  // Si el historial está vacío, agregar el system prompt como primer mensaje
  if (historialMSN.length === 0) {
    historialMSN.push({
      role: "user",
      parts: [{ text: systemInstructions }]
    });
    historialMSN.push({
      role: "model",
      parts: [{ text: "Entendido, voy a responder como Lucas Britos en el estilo de MSN 2005." }]
    });
  }

  // Evitar mensajes consecutivos del mismo rol (regla estricta de Google)
  const ultimoMensaje = historialMSN[historialMSN.length - 1];
  if (!ultimoMensaje || ultimoMensaje.role !== "user") {
    historialMSN.push({ role: "user", parts: [{ text: mensajeUsuario }] });
  } else {
    // Si el último ya era del usuario (por un error previo), actualizamos ese mensaje en lugar de agregar uno nuevo
    ultimoMensaje.parts = [{ text: mensajeUsuario }];
  }

  if (historialMSN.length > 20) {
    historialMSN = [historialMSN[0], historialMSN[1], ...historialMSN.slice(-18)];
  }

  const body = {
    contents: historialMSN,
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 1500,
    }
  };

  try {
    console.log("=== GEMINI API REQUEST DEBUG ===");
    console.log("URL:", url);
    console.log("Body:", JSON.stringify(body, null, 2));

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    console.log("Response Status:", res.status);
    console.log("Response Headers:", res.headers);

    const data = await res.json();
    console.log("Response Data:", data);

    if (!res.ok) {
      console.error("Gemini API Error Status:", res.status);
      console.error("Gemini API Error Data:", data);

      if (res.status === 429) {
        return "Error de sistema (0x80040E14): Los servidores de MSN están ocupados. Demasiada gente conectada... esperá un ratito (K)";
      }

      if (res.status === 400) {
        console.error("Error 400 - Bad Request. Detalles:", data);
        return "Error de sistema (0x80040E15): La solicitud al servidor MSN es inválida. Verificá la consola del navegador (F12) para más detalles.";
      }

      if (res.status === 404) {
        console.error("Error 404 - Not Found. Intentando listar modelos disponibles...");
        try {
          const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
          const listRes = await fetch(listUrl);
          const listData = await listRes.json();
          console.log("Modelos disponibles para esta API Key:", listData);
        } catch (listError) {
          console.error("No se pudieron listar los modelos:", listError);
        }
        return "Error de sistema (0x80040E16): El modelo de IA no se encuentra. Revisá la consola (F12) para ver la lista de modelos disponibles.";
      }

      if (data.error && data.error.message.includes("API key not valid")) {
        return "Error de sistema (0x8004100E): La clave de API no es válida para este servicio.";
      }
      throw new Error(`API returned status ${res.status}`);
    }

    if (data.candidates && data.candidates[0].content) {
      const textoRespuesta = data.candidates[0].content.parts[0].text;
      historialMSN.push({ role: "model", parts: [{ text: textoRespuesta }] });
      return textoRespuesta;
    } else {
      throw new Error("No candidates in response");
    }
  } catch (e) {
    console.error("Gemini Fetch/Parse Error:", e);
    return "Error de sistema: La conexión con el servidor de MSN ha fallado. Código de error: 0x80048820. (Causado por: " + e.message + ")";
  }
}

function ejecutarZumbido() {
  const ventana = document.getElementById('ventana-msn');
  if (!ventana) return;

  ventana.classList.add('msn-shaking');

  // Audio handling
  try {
    const audio = new Audio('audios/Zumbido msn.mp3');
    audio.play().catch(() => { });
  } catch (e) { }

  setTimeout(() => {
    ventana.classList.remove('msn-shaking');
  }, 500);
}

// --- Project Window Interaction ---
function updateProjectDetails(title, description) {
  const detailsText = document.getElementById('project-details-text');
  if (detailsText) {
    detailsText.innerHTML = `<b>${title}</b><br><br>${description}`;
  }
}

function resetProjectDetails() {
  const detailsText = document.getElementById('project-details-text');
  if (detailsText) {
    detailsText.textContent = "Seleccione un elemento para ver su descripción.";
  }
}

// --- Windows XP Notification Balloon Logic ---
function mostrarGloboXP() {
  const balloon = document.getElementById('balloon-notif');
  if (balloon) {
    balloon.classList.add('visible');

    // Auto hide after 15 seconds of visibility
    setTimeout(() => {
      if (balloon.classList.contains('visible')) {
        cerrarGlobo();
      }
    }, 15000);
  }
}

// --- MSN Greeting Sequence Logic ---
function iniciarSecuenciaBienvenidaMSN() {
  // Evitar ejecuciones duplicadas si el globo se cierra varias veces
  if (window.msnBienvenidaIniciada) return;
  window.msnBienvenidaIniciada = true;

  const welcomeMsg = "¡Hola! Bienvenidos a mi portfolio estilo Windows XP.";

  // 1. Disparar la alerta completa (Sonido + Toast + Titileo)
  dispararAlertaMSN(welcomeMsg);

  // 2. Agregar el mensaje al historial del chat
  const msnMessages = document.getElementById('msn-messages');
  if (msnMessages) {
    const msgDiv = document.createElement('div');
    msgDiv.style.marginTop = '10px';
    msgDiv.style.marginBottom = '5px';
    msgDiv.innerHTML = `<b style="color: #1a56bc;">Lucas Britos dice:</b><br><div style="margin-left:10px;">${welcomeMsg}</div>`;
    msnMessages.appendChild(msgDiv);
    msnMessages.scrollTop = msnMessages.scrollHeight;
  }

  // Add to conversational history too so AI knows it greeted
  historialMSN.push({ role: "model", parts: [{ text: welcomeMsg }] });
}

// Función reutilizable para alertas de MSN
function dispararAlertaMSN(mensaje, nombre = "Lucas Britos") {
  const sonidoMSN = document.getElementById('sonido-msn');
  const msnToast = document.getElementById('msn-toast');

  // 1. Sonido
  if (sonidoMSN) {
    sonidoMSN.currentTime = 0;
    sonidoMSN.play().catch(e => console.log("MSN Sound error:", e));
  }

  // 2. Notificación Toast (Cartelito al costado)
  if (msnToast) {
    const toastMsg = msnToast.querySelector('.msn-toast-msg');
    const toastName = msnToast.querySelector('.msn-toast-name');
    if (toastMsg) toastMsg.textContent = mensaje.substring(0, 45) + (mensaje.length > 45 ? "..." : "");
    if (toastName) toastName.textContent = nombre;

    msnToast.style.display = 'block';
    setTimeout(() => {
      msnToast.style.display = 'none';
    }, 8000);
  }

  // 3. Titileo naranja en la barra de tareas
  if (!document.querySelector(`.btn-tarea[data-ventana="ventana-msn"]`)) {
    crearBotonTarea('ventana-msn');
  }
  const btnMsn = document.querySelector(`.btn-tarea[data-ventana="ventana-msn"]`);
  if (btnMsn) {
    btnMsn.classList.add('titilando');
  }
}

function cerrarGlobo() {
  const balloon = document.getElementById('balloon-notif');
  if (balloon) {
    balloon.classList.remove('visible');

    // Al cerrar el globo, esperar 3 segundos para iniciar el MSN
    setTimeout(() => {
      iniciarSecuenciaBienvenidaMSN();
    }, 3000);
  }
}

// Open chat from toast click
function abrirChatDesdeCallback() {
  const msnToast = document.getElementById('msn-toast');
  if (msnToast) msnToast.style.display = 'none';

  const ventanaMsn = document.getElementById('ventana-msn');
  if (ventanaMsn) {
    abrirVentana('ventana-msn');
  }

  const btnMsn = document.querySelector(`.btn-tarea[data-ventana="ventana-msn"]`);
  if (btnMsn) {
    btnMsn.classList.remove('titilando');
  }
}

// Export for HTML onclick
window.abrirChatDesdeCallback = abrirChatDesdeCallback;
window.cerrarGlobo = cerrarGlobo;
window.mostrarGloboXP = mostrarGloboXP;

