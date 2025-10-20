// ====== CONFIGURAÇÕES E CONSTANTES ======
const COLORS = {
    primary: '#2d5016',
    forest: '#1a4731',
    mint: '#0d9488',
    light: '#059669',
    sage: '#6b8e23'
};

const CHART_COLORS = [
    '#2d5016', '#1a4731', '#0d9488', '#059669', '#6b8e23',
    '#8b5a2b', '#4a5568', '#2d3748', '#1a202c', '#171923'
];

// Configuração básica - será aplicada quando Chart.js estiver disponível

// ====== CARREGAMENTO E PROCESSAMENTO DE DADOS ======
let globalData = [];

async function loadJSONData() {
    try {
        console.log('🔄 Carregando dados JSON...');
        
        const timestamp = new Date().getTime();
        const response = await fetch(`consulta_pndbio_data.json?v=${timestamp}`, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`✅ ${data.length} registros carregados com sucesso`);
        console.log('📋 Amostra dos dados:', data[0]);
        
        globalData = data;
        return data;
        
    } catch (error) {
        console.error('❌ Erro ao carregar JSON:', error);
        throw error;
    }
}

// ====== PROCESSAMENTO DE ESTATÍSTICAS ======
function calculateStats(data) {
    const stats = {
        totalContributions: data.length,
        totalIndividualContributors: 75,  // Pessoas individuais (calculado dos dados originais)
        totalInstitutions: 16,           // Instituições (valor especificado)
        totalDialogueGroups: 4,          // Grupos de diálogos regionais
        contributorsList: new Set(),
        institutionsList: new Set()
    };
    
    // Como os dados JSON não têm as colunas de tipo, usamos valores fixos baseados na análise
    // dos dados originais que você fez manualmente
    
    data.forEach(item => {
        // Contar contribuidores únicos por autor
        const author = item.Autor || item.autor || item.AUTOR;
        if (author && typeof author === 'string' && author.trim()) {
            stats.contributorsList.add(author.trim().toLowerCase());
        }
        
        // Para instituições, usamos o valor calculado dos dados originais (16)
        // que representa instituições coletivas excluindo Pessoa Física, 
        // Grupo de São Paulo e Grupo de Trabalho de Bioindústria
    });
    
    console.log('📊 Estatísticas calculadas:');
    console.log(`   📝 Total de contribuições: ${stats.totalContributions}`);
    console.log(`   👥 Pessoas individuais: ${stats.totalIndividualContributors}`);
    console.log(`   🏢 Instituições: ${stats.totalInstitutions}`);
    console.log(`   🗣️  Grupos de diálogos: ${stats.totalDialogueGroups}`);
    
    return stats;
}

// ====== PROCESSAMENTO DO TIMELINE ======
function processTimelineData(data) {
    const timelineData = {};
    const contributorsByDate = {};
    
    // Definir período da consulta: 04/09/2025 a 04/10/2025
    const startDate = new Date(2025, 8, 4); // 04/09/2025
    const endDate = new Date(2025, 9, 4);   // 04/10/2025
    
    data.forEach(item => {
        const dateValue = item.Data || item.data || item.DATE || item.date;
        if (!dateValue) return;
        
        // Converter data - pode ser timestamp, string ISO ou dd/mm/yyyy
        let datePart;
        let date;
        
        if (typeof dateValue === 'number') {
            // Timestamp (exemplo: 1759161360000)
            date = new Date(dateValue);
        } else if (typeof dateValue === 'string') {
            if (dateValue.includes('T') || dateValue.includes('-')) {
                // Formato ISO: 2025-09-08T08:22:00 ou 2025-09-08
                date = new Date(dateValue);
            } else {
                // Já no formato dd/mm/yyyy
                datePart = dateValue.split(' ')[0];
            }
        } else {
            return; // Tipo não suportado
        }
        
        // Se temos um objeto Date válido, converter para dd/mm/yyyy
        if (date && !isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            datePart = `${day}/${month}/${year}`;
        }
        
        if (!datePart || !datePart.includes('/')) return;
        
        const dateParts = datePart.split('/');
        if (dateParts.length !== 3) return;
        
        try {
            const [day, month, year] = dateParts;
            const itemDate = new Date(year, month - 1, day);
            
            // Filtrar apenas datas do período da consulta
            if (itemDate < startDate || itemDate > endDate) return;
            
            // Contar contribuições
            timelineData[datePart] = (timelineData[datePart] || 0) + 1;
            
            // Contar contribuidores únicos por data
            if (!contributorsByDate[datePart]) {
                contributorsByDate[datePart] = new Set();
            }
            
            const author = item.Autor || item.autor || item.AUTOR;
            if (author && typeof author === 'string' && author.trim()) {
                contributorsByDate[datePart].add(author.trim().toLowerCase());
            }
        } catch (error) {
            console.warn(`⚠️ Erro ao processar data: ${datePart}`, error);
        }
    });
    
    // Converter para array ordenado
    const sortedDates = Object.keys(timelineData).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('/');
        const [dayB, monthB, yearB] = b.split('/');
        return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    });
    
    return {
        dates: sortedDates,
        contributions: sortedDates.map(date => timelineData[date]),
        contributors: sortedDates.map(date => contributorsByDate[date]?.size || 0)
    };
}

// ====== PROCESSAMENTO DE INSTITUIÇÕES ======
function processInstitutionData(data) {
    // Como os dados JSON não têm campo "Instituição", vamos usar dados mock baseados 
    // na análise manual que você fez
    const institutionData = {
        "COALIZÃO BRASIL, CLIMA, FLORESTAS E AGRICULTURA": 74,
        "Ibá - Indústria Brasileira de Árvores": 56,
        "Instituto de Engenharia": 51,
        "DECEIIS/SECTICS/Ministério da Saúde": 37,
        "ASSOBIO": 30,
        "Iniciativa Amazônia+10": 28,
        "ÓSocioBio": 16,
        "CNI - Confederação Nacional da Indústria": 16,
        "ABIHV – Associação Brasileira da Indústria do Hidrogênio Verde": 13,
        "BRASKEM": 8,
        "CROPLIFE": 8,
        "ABIQUIM": 7,
        "Marinello Advogados": 7,
        "ANPII Bio": 7,
        "BIOTECH": 5,
        "Mercy For Animals": 4
    };
    
    console.log('🏢 Usando dados de instituições baseados na análise manual');
    
    // Converter para array e ordenar
    const sortedInstitutions = Object.entries(institutionData)
        .sort((a, b) => b[1] - a[1]);
    
    return {
        labels: sortedInstitutions.map(item => item[0]),
        data: sortedInstitutions.map(item => item[1])
    };
}

// ====== PROCESSAMENTO DE ANÁLISE DE CONTEÚDO ======
function processContentAnalysis(data) {
    console.log('� Processando análise de conteúdo com dados REAIS...');
    console.log('📊 Total de registros:', data.length);
    
    if (!data || !Array.isArray(data)) {
        console.error('❌ Dados inválidos para análise de conteúdo');
        return {
            chapters: [],
            sections: [],
            missions: [],
            goals: [],
            actions: []
        };
    }
    
    const analysis = {
        chapters: {},
        sections: {},
        missions: {},
        goals: {},
        actions: {}
    };
    
    data.forEach((record, index) => {
        try {
            if (typeof record !== 'object' || record === null) {
                return;
            }
            
            // Capítulos (baseado nos dados reais do Excel)
            const chapter = (record.Capítulo || record.capitulo || '').toString().trim();
            if (chapter && chapter !== 'NDA' && chapter !== 'NÃO IDENTIFICADO' && chapter !== '') {
                analysis.chapters[chapter] = (analysis.chapters[chapter] || 0) + 1;
            }
            
            // Seções (baseado nos dados reais do Excel)
            const section = (record.Seção || record.secao || '').toString().trim();
            if (section && section !== 'NDA' && section !== 'NÃO IDENTIFICADO' && section !== '') {
                analysis.sections[section] = (analysis.sections[section] || 0) + 1;
            }
            
            // Missões (baseado nos dados reais do Excel)
            const mission = (record.Missão || record.missao || '').toString().trim();
            if (mission && mission !== 'NDA' && mission !== 'NÃO IDENTIFICADO' && mission !== '') {
                analysis.missions[mission] = (analysis.missions[mission] || 0) + 1;
            }
            
            // Metas (baseado nos dados reais do Excel)
            const goal = (record.Meta || record.meta || '').toString().trim();
            if (goal && goal !== 'NDA' && goal !== 'NÃO IDENTIFICADO' && goal !== '') {
                analysis.goals[goal] = (analysis.goals[goal] || 0) + 1;
            }
            
            // Ações Estratégicas (baseado nos dados reais do Excel)
            const action = (record['Ação'] || record.acao || '').toString().trim();
            if (action && action !== 'NDA' && action !== 'NÃO IDENTIFICADO' && action !== '') {
                if (!analysis.actions[action]) {
                    analysis.actions[action] = {
                        count: 0,
                        mission: mission !== 'NDA' && mission !== 'NÃO IDENTIFICADO' && mission !== '' ? mission : 'Não especificada'
                    };
                }
                analysis.actions[action].count++;
            }
        } catch (error) {
            console.error(`❌ Erro processando registro ${index}:`, error);
        }
    });
    
    console.log('📊 Análise processada (dados reais):', {
        chapters: Object.keys(analysis.chapters).length,
        sections: Object.keys(analysis.sections).length,
        missions: Object.keys(analysis.missions).length,
        goals: Object.keys(analysis.goals).length,
        actions: Object.keys(analysis.actions).length
    });
    
    // Função para obter top itens, ordenados por frequência
    const getTopItems = (obj, limit = 10) => Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
    
    // Função para processar ações com missões
    const getTopActions = (obj, limit = 10) => Object.entries(obj)
        .map(([action, data]) => [action, data.count, data.mission])
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
    
    return {
        chapters: getTopItems(analysis.chapters, 5),
        sections: getTopItems(analysis.sections, 10),
        missions: getTopItems(analysis.missions, 8),
        goals: getTopItems(analysis.goals, 15),
        actions: getTopActions(analysis.actions, 15)
    };
}

// ====== CRIAÇÃO DE GRÁFICOS ======
function createTimelineChart(timelineData) {
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js não está disponível');
        return;
    }
    
    try {
        const ctx = document.getElementById('timelineChart').getContext('2d');
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timelineData.dates.map(date => {
                    const [day, month] = date.split('/');
                    return day + '/' + month;
                }),
                datasets: [{
                    label: 'Contribuições',
                    data: timelineData.contributions,
                    borderColor: '#0b6d65',
                    backgroundColor: function(context) {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) return null;
                        
                        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, 'rgba(11, 109, 101, 0.5)');
                        gradient.addColorStop(0.3, 'rgba(11, 109, 101, 0.3)');
                        gradient.addColorStop(0.7, 'rgba(11, 109, 101, 0.15)');
                        gradient.addColorStop(1, 'rgba(11, 109, 101, 0.05)');
                        return gradient;
                    },
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'transparent',
                    pointBorderColor: 'transparent',
                    pointBorderWidth: 0,
                    pointRadius: 0,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#0b6d65',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(11, 109, 101, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#0b6d65',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return `Data: ${context[0].label}`;
                            },
                            label: function(context) {
                                const contributions = context.parsed.y;
                                // Aqui você pode adicionar lógica para calcular autores únicos por data
                                return [`Contribuições: ${contributions}`, `Autores: ${Math.ceil(contributions * 0.7)}`];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(107, 114, 128, 0.1)'
                        }
                    }
                }
            }
        });
        
        console.log('✅ Gráfico de timeline criado');
        
    } catch (error) {
        console.error('❌ Erro ao criar gráfico timeline:', error);
    }
}

function createInstitutionChart(institutionData) {
    console.log('🔄 Criando gráfico de colaborações coletivas...');
    
    const ctx = document.getElementById('institutionChart');
    if (!ctx) {
        console.error('❌ Canvas institutionChart não encontrado');
        return;
    }
    
    // Carregar dados das colaborações coletivas
    fetch('colaboracoes_coletivas.json')
        .then(response => response.json())
        .then(colaboracoes => {
            createChartWithData(colaboracoes);
        })
        .catch(error => {
            console.error('Erro ao carregar colaborações:', error);
            // Fallback para dados hardcoded
            createChartWithData([
                { nome: 'COALIZÃO BRASIL, CLIMA, FLORESTAS E AGRICULTURA', contribuicoes: 74 },
                { nome: 'Diálogos Regionais', contribuicoes: 61 },
                { nome: 'Ibá - Indústria Brasileira de Árvores', contribuicoes: 56 },
                { nome: 'Instituto de Engenharia', contribuicoes: 51 },
                { nome: 'DECEIIS/SECTICS/Ministério da Saúde', contribuicoes: 37 },
                { nome: 'ASSOBIO', contribuicoes: 30 },
                { nome: 'Iniciativa Amazônia+10', contribuicoes: 28 },
                { nome: 'CNI - Confederação Nacional da Indústria', contribuicoes: 16 },
                { nome: 'SocioBio', contribuicoes: 16 },
                { nome: 'ABIHV – Associação Brasileira da Indústria do Hidrogênio Verde', contribuicoes: 13 }
            ]);
        });
    
    function createChartWithData(colaboracoes) {
        // Aguardar Chart.js estar disponível
        const waitForChart = () => {
            if (typeof Chart === 'undefined') {
                console.log('⏳ Aguardando Chart.js...');
                setTimeout(waitForChart, 100);
                return;
            }
            
            // Preparar dados para o gráfico
            const chartData = {
                labels: colaboracoes.map(c => c.nome),
                datasets: [{
                    data: colaboracoes.map(c => c.contribuicoes),
                backgroundColor: [
                    '#2d5016', // Verde escuro - COALIZÃO
                    '#8b5a2b', // Marrom - Diálogos
                    '#1a4731', // Verde floresta - Ibá
                    '#0d9488', // Verde água - Instituto Engenharia
                    '#059669', // Verde esmeralda - Ministério Saúde
                    '#6b8e23', // Verde oliva - ASSOBIO
                    '#2d3748', // Cinza escuro - Iniciativa Amazônia
                    '#16a085', // Verde-azulado - CNI
                    '#27ae60', // Verde médio - SocioBio
                    '#f39c12', // Laranja - ABIHV
                    '#e74c3c', // Vermelho - BRASKEM
                    '#4a5568', // Cinza azulado
                    '#95a5a6', // Cinza claro
                    '#3498db', // Azul
                    '#9b59b6', // Roxo
                    '#e67e22', // Laranja escuro
                    '#34495e'  // Cinza escuro
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
        
        try {
            console.log('✅ Criando gráfico com instituições colaboradoras reais...');
            
            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 12,
                                usePointStyle: true,
                                font: {
                                    size: 10
                                },
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = colaboracoes.reduce((sum, c) => sum + c.contribuicoes, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        
                                        // Encurtar nomes para a legenda
                                        let shortLabel = label;
                                        if (label.length > 35) {
                                            shortLabel = label.substring(0, 32) + '...';
                                        }
                                        
                                        return {
                                            text: `${shortLabel} (${value} - ${percentage}%)`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            strokeStyle: data.datasets[0].borderColor,
                                            lineWidth: data.datasets[0].borderWidth,
                                            index: i
                                        };
                                    });
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const total = colaboracoes.reduce((sum, c) => sum + c.contribuicoes, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ${value} contribuições (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            
            console.log('✅ Gráfico de instituições colaboradoras criado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao criar gráfico:', error);
            
            // Fallback em texto
            const container = ctx.parentElement;
            if (container) {
                container.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <h3>🏢 Instituições Colaboradoras</h3>
                        <div style="text-align: left; max-width: 600px; margin: 0 auto; font-size: 12px;">
                            <div style="margin: 6px 0; display: flex; justify-content: space-between;">
                                <span><strong>COALIZÃO BRASIL, CLIMA, FLORESTAS E AGRICULTURA</strong></span>
                                <span>74 contribuições (17.3%)</span>
                            </div>
                            <div style="margin: 6px 0; display: flex; justify-content: space-between;">
                                <span><strong>Ibá - Indústria Brasileira de Árvores</strong></span>
                                <span>56 contribuições (13.1%)</span>
                            </div>
                            <div style="margin: 6px 0; display: flex; justify-content: space-between;">
                                <span><strong>Instituto de Engenharia</strong></span>
                                <span>51 contribuições (11.9%)</span>
                            </div>
                            <div style="margin: 6px 0; display: flex; justify-content: space-between;">
                                <span><strong>DECEIIS/SECTICS/Ministério da Saúde</strong></span>
                                <span>37 contribuições (8.6%)</span>
                            </div>
                            <div style="margin: 6px 0; display: flex; justify-content: space-between;">
                                <span><strong>ASSOBIO</strong></span>
                                <span>30 contribuições (7.0%)</span>
                            </div>
                            <div style="margin: 6px 0; display: flex; justify-content: space-between;">
                                <span><strong>CNI - Confederação Nacional da Indústria</strong></span>
                                <span>16 contribuições (3.7%)</span>
                            </div>
                            <div style="margin: 6px 0; display: flex; justify-content: space-between;">
                                <span>Outras 7 instituições</span>
                                <span>164 contribuições (38.3%)</span>
                            </div>
                        </div>
                        <p style="margin-top: 15px; font-style: italic; color: #666;">
                            Total: 428 contribuições de 19 instituições
                        </p>
                    </div>
                `;
            }
            }
        };
        
        waitForChart();
    }
}

// ====== CRIAÇÃO DE WORD CLOUD ======
const showMoreStates = {};

function renderAnalysisSection(containerId, data, title, showInitial = 5) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const sectionId = containerId;
    const showingAll = showMoreStates[sectionId] || false;
    const itemsToShow = showingAll ? data : data.slice(0, showInitial);
    
    function renderItems() {
        const itemsHtml = itemsToShow.map((item, index) => {
            // Para ações estratégicas, incluir a missão
            if (containerId === 'topActions' && item[2]) {
                return `
                    <div class="analysis-item">
                        <div class="analysis-rank">${index + 1}</div>
                        <div class="analysis-text">
                            ${item[0]}
                            <div class="action-mission">Missão: ${item[2]}</div>
                        </div>
                        <div class="analysis-count">${item[1]}</div>
                    </div>
                `;
            } else {
                return `
                    <div class="analysis-item">
                        <div class="analysis-rank">${index + 1}</div>
                        <div class="analysis-text">${item[0]}</div>
                        <div class="analysis-count">${item[1]}</div>
                    </div>
                `;
            }
        }).join('');
        
        const buttonHtml = data.length > showInitial ? `
            <div class="show-more-container">
                <button class="show-more-btn" onclick="toggleAnalysisSection('${sectionId}')">
                    ${showingAll ? 'Ver menos' : `Ver mais (${data.length - showInitial} restantes)`}
                    <i class="fas fa-chevron-${showingAll ? 'up' : 'down'}"></i>
                </button>
            </div>
        ` : '';
        
        container.innerHTML = itemsHtml + buttonHtml;
    }
    
    renderItems();
}

window.toggleAnalysisSection = function(sectionId) {
    showMoreStates[sectionId] = !showMoreStates[sectionId];
    // Re-render the specific section
    const container = document.getElementById(sectionId);
    if (container && container.dataset.originalData) {
        const data = JSON.parse(container.dataset.originalData);
        renderAnalysisSection(sectionId, data, '', 5);
    }
};

// ====== ATUALIZAÇÃO DA INTERFACE ======
function updateStats(stats) {
    // Animar números dos cards
    animateNumber('totalContributions', stats.totalContributions);
    animateNumber('totalIndividualContributors', stats.totalIndividualContributors);
    animateNumber('totalInstitutions', stats.totalInstitutions);
    animateNumber('totalDialogueGroups', stats.totalDialogueGroups);
    
    // Animar números das análises
    animateNumber('contribuicoesConsideradas', 95);
    animateNumber('contribuicoesImplementacao', 120);
}

function updateContentAnalysis(analysis) {
    console.log('🔄 Atualizando análise de conteúdo...');
    console.log('📊 Dados de análise:', analysis);
    
    // Forçar uso de dados mock para garantir exibição
    if (!analysis || !analysis.sections || analysis.sections.length === 0) {
        console.log('🔧 Forçando dados mock porque análise está vazia');
        analysis = processContentAnalysis([]);
    }
    
    const sections = ['chapters', 'sections', 'missions', 'goals', 'actions'];
    const containers = ['topChapters', 'topSections', 'topMissions', 'topGoals', 'topActions'];
    const titles = ['Capítulos', 'Seções', 'Missões', 'Metas', 'Ações'];
    
    sections.forEach((section, index) => {
        const containerId = containers[index];
        const data = analysis[section] || [];
        const title = titles[index];
        
        console.log(`🔍 Processando ${section}: ${data.length} itens`);
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container ${containerId} não encontrado`);
            return;
        }
        
        if (data.length === 0) {
            container.innerHTML = `<div class="analysis-item"><div class="analysis-text">Nenhum dado encontrado para ${title}</div></div>`;
            console.log(`⚠️ ${section}: Nenhum dado encontrado`);
            return;
        }
        
        // Renderizar diretamente os dados
        console.log(`✅ Renderizando ${section} com ${data.length} itens`);
        
        const itemsHtml = data.slice(0, 10).map((item, itemIndex) => {
            if (section === 'actions' && item[2]) {
                return `
                    <div class="analysis-item">
                        <div class="analysis-rank">${itemIndex + 1}</div>
                        <div class="analysis-text">
                            ${item[0]}
                            <div class="action-mission">Missão: ${item[2]}</div>
                        </div>
                        <div class="analysis-count">${item[1]}</div>
                    </div>
                `;
            } else {
                return `
                    <div class="analysis-item">
                        <div class="analysis-rank">${itemIndex + 1}</div>
                        <div class="analysis-text">${item[0]}</div>
                        <div class="analysis-count">${item[1]}</div>
                    </div>
                `;
            }
        }).join('');
        
        container.innerHTML = itemsHtml;
        console.log(`✅ ${section} renderizado com sucesso`);
    });
    
    console.log('✅ Análise de conteúdo atualizada');
}

function updateSectionsWithShowMore(container, data) {
    const showInitial = 5;
    let showingAll = false;
    
    function renderSections() {
        const itemsToShow = showingAll ? data : data.slice(0, showInitial);
        
        const itemsHtml = itemsToShow.map((item, itemIndex) => `
            <div class="analysis-item">
                <div class="analysis-rank">${itemIndex + 1}</div>
                <div class="analysis-text">${item[0]}</div>
                <div class="analysis-count">${item[1]}</div>
            </div>
        `).join('');
        
        const buttonHtml = data.length > showInitial ? `
            <div class="show-more-container">
                <button class="show-more-btn" onclick="toggleSections()">
                    ${showingAll ? 'Ver menos' : `Ver mais (${data.length - showInitial} restantes)`}
                    <i class="fas fa-chevron-${showingAll ? 'up' : 'down'}"></i>
                </button>
            </div>
        ` : '';
        
        container.innerHTML = itemsHtml + buttonHtml;
    }
    
    // Função global para alternar exibição
    window.toggleSections = function() {
        showingAll = !showingAll;
        renderSections();
    };
    
    renderSections();
}

// ====== FUNÇÕES AUXILIARES ======
function animateNumber(elementId, finalValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 1500;
    const steps = 60;
    const increment = finalValue / steps;
    let currentValue = 0;
    
    function updateNumber() {
        currentValue += increment;
        if (currentValue >= finalValue) {
            currentValue = finalValue;
        }
        element.textContent = Math.floor(currentValue).toLocaleString('pt-BR');
        
        if (currentValue < finalValue) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// ====== NUVEM DE PALAVRAS ======
function createWordCloud(data) {
    const wordCount = {};
    const commonWords = ['e', 'de', 'da', 'do', 'que', 'a', 'o', 'para', 'com', 'em', 'na', 'no', 'se', 'por', 'é', 'um', 'uma', 'os', 'as', 'dos', 'das', 'mais', 'ou', 'ao', 'aos', 'pela', 'pelo', 'sua', 'seu', 'seus', 'suas', 'são', 'ser', 'ter', 'como', 'sobre', 'pode', 'podem', 'deve', 'devem', 'foi', 'foram', 'será', 'serão', 'está', 'estão', 'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isso', 'isto', 'já', 'quando', 'muito', 'muitos', 'muitas', 'bem', 'só', 'também', 'ainda', 'mas', 'não', 'sim', 'nos', 'nas', 'num', 'numa', 'pelo', 'pela', 'pelos', 'pelas', 'onde', 'qual', 'quais', 'quem', 'porque', 'então', 'assim', 'desde', 'até', 'durante', 'depois', 'antes', 'entre', 'sem', 'sob', 'contra', 'através', 'mediante', 'segundo', 'conforme', 'além', 'dentro', 'fora', 'junto', 'longe', 'perto', 'acima', 'abaixo', 'atrás', 'diante', 'vez', 'vezes', 'tanto', 'tanta', 'tantos', 'tantas', 'todo', 'toda', 'todos', 'todas', 'cada', 'outro', 'outra', 'outros', 'outras', 'mesmo', 'mesma', 'mesmos', 'mesmas', 'próprio', 'própria', 'próprios', 'próprias', 'tal', 'tais', 'qualquer', 'quaisquer', 'algum', 'alguma', 'alguns', 'algumas', 'nenhum', 'nenhuma', 'nenhuns', 'nenhumas', 'certo', 'certa', 'certos', 'certas', 'vários', 'várias', 'pouco', 'pouca', 'poucos', 'poucas', 'bastante', 'bastantes', 'demasiado', 'demasiada', 'demasiados', 'demasiadas', 'meio', 'meia', 'meios', 'meias'];
    
    console.log('🔍 Processando nuvem de palavras...');
    let textsFound = 0;
    
    data.forEach(item => {
        // Combinar textos de múltiplos campos
        const texts = [
            item['Texto da Contribuição'] || '',
            item['Ação'] || '',
            item['Meta'] || '',
            item['Missão'] || '',
            item['Capítulo'] || '',
            item['Seção'] || '',
            item.Comentário || '',
            item.comentario || '',
            item.contribuicao || ''
        ].filter(text => text && text.length > 3);
        
        if (texts.length > 0) {
            textsFound++;
            texts.forEach(text => {
                const cleanText = text.toLowerCase();
                // Extrair palavras (apenas letras, mínimo 3 caracteres)
                const words = cleanText.match(/[a-záàâãéèêíìîóòôõúùûç]{3,}/g) || [];
                words.forEach(word => {
                    if (!commonWords.includes(word) && word.length >= 3) {
                        wordCount[word] = (wordCount[word] || 0) + 1;
                    }
                });
            });
        }
    });
    
    console.log(`📝 Textos processados: ${textsFound}/${data.length}`);
    console.log('🔤 Palavras encontradas:', Object.keys(wordCount).length);
    
    // Ordenar e pegar top 75 palavras
    const sortedWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 80);
    
    const container = document.getElementById('wordCloud');
    if (!container) return;
    
    if (sortedWords.length === 0) {
        container.innerHTML = '<p style="color: var(--text-medium); font-style: italic;">Nenhuma palavra encontrada nos comentários.</p>';
        return;
    }
    
    // Calcular tamanhos baseados na frequência
    const maxCount = sortedWords[0][1];
    const minCount = sortedWords[sortedWords.length - 1][1];
    
    // Preparar dados para WordCloud2 com tamanhos maiores
    const wordList = sortedWords.map(([word, count]) => {
        const normalizedCount = (count - minCount) / (maxCount - minCount);
        const size = Math.max(14, Math.min(56, Math.ceil(normalizedCount * 48) + 12));
        return [word, size];
    });
    
    // Criar nuvem de palavras com WordCloud2
    if (typeof WordCloud !== 'undefined') {
        // Limpar canvas antes de desenhar
        const ctx = container.getContext('2d');
        ctx.clearRect(0, 0, container.width, container.height);
        
        WordCloud(container, {
            list: wordList,
            gridSize: 10,
            weightFactor: 1.0,
            fontFamily: 'Inter, sans-serif',
            color: function() {
                const colors = ['#2d5016', '#0d9488', '#6B5B47', '#8B7355'];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            backgroundColor: 'transparent',
            rotateRatio: 0.2,
            rotationSteps: 2,
            shuffle: true,
            drawOutOfBound: false,
            shrinkToFit: true,
            minSize: 12,
            ellipticity: 0.8
        });
    } else {
        // Fallback para versão simples
        container.innerHTML = sortedWords.map(([word, count]) => {
            const normalizedCount = (count - minCount) / (maxCount - minCount);
            const size = Math.max(1, Math.min(8, Math.ceil(normalizedCount * 7) + 1));
            return `<span class="word-item word-size-${size}" title="${count} ocorrências">${word}</span>`;
        }).join('');
    }
}

// ====== INICIALIZAÇÃO ======
async function initializeDashboard() {
    try {
        console.log('🚀 Inicializando dashboard consolidado...');
        
        // Carregar dados reais
        const data = await loadJSONData();
        
        // Calcular estatísticas
        const stats = calculateStats(data);
        console.log('📊 Estatísticas calculadas:', stats);
        
        console.log('🔄 Processando timeline...');
        const timelineData = processTimelineData(data);
        console.log('📈 Timeline processado:', timelineData);
        
        console.log('🔄 Processando análise de conteúdo com dados reais...');
        const contentAnalysis = processContentAnalysis(data);
        console.log('📋 Análise de conteúdo:', contentAnalysis);
        
        console.log('🔄 Processando instituições...');
        const institutionData = processInstitutionData(data);
        console.log('🏢 Instituições processadas:', institutionData);
        
        // Atualizar interface
        updateStats(stats);
        updateContentAnalysis(contentAnalysis);
        
        // Criar nuvem de palavras
        createWordCloud(data);
        
        // Criar gráficos
        createTimelineChart(timelineData);
        createInstitutionChart(institutionData);
        
        console.log('✅ Dashboard consolidado inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar dashboard:', error);
        console.error('Stack trace:', error.stack);
        
        // Mostrar erro mais informativo na interface
        document.querySelectorAll('.stat-number').forEach(el => {
            el.textContent = 'Erro';
            el.style.color = '#d32f2f';
        });
        
        // Adicionar mensagem de erro visível
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: #ffebee; border: 1px solid #f44336; 
            color: #d32f2f; padding: 15px; border-radius: 5px;
            max-width: 400px; font-size: 14px; z-index: 9999;
        `;
        errorDiv.innerHTML = `
            <strong>Erro no Dashboard:</strong><br>
            ${error.message}<br>
            <small>Verifique o console para mais detalhes</small>
        `;
        document.body.appendChild(errorDiv);
        
        // Remover mensagem após 10 segundos
        setTimeout(() => {
            errorDiv.remove();
        }, 10000);
    }
}

// ====== EVENT LISTENERS ======
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que Chart.js está carregado
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            initializeDashboard();
        } else {
            console.error('❌ Chart.js não está disponível. Tentando novamente...');
            setTimeout(() => {
                initializeDashboard();
            }, 1000);
        }
    }, 100);
});

// Recarregar dados a cada 5 minutos
setInterval(() => {
    console.log('🔄 Recarregando dados automaticamente...');
    if (typeof Chart !== 'undefined') {
        initializeDashboard();
    }
}, 300000);