# Dashboard de Análise - Consulta Pública PNDBio

## 📋 Descrição do Projeto

Dashboard interativo desenvolvido para análise e visualização dos dados da **Consulta Pública do Plano Nacional de Desenvolvimento da Bioeconomia (PNDBio)**. O projeto processa e apresenta de forma visual e intuitiva as **575 contribuições** recebidas durante o processo de consulta pública.

## 🎯 Objetivos

- **Visualizar dados**: Apresentar as contribuições de forma clara e organizada
- **Análise temporal**: Mostrar a evolução das contribuições ao longo do tempo
- **Mapeamento institucional**: Identificar as principais instituições participantes
- **Análise de conteúdo**: Categorizar contribuições por capítulos, seções, missões, metas e ações
- **Interface responsiva**: Garantir acessibilidade em diferentes dispositivos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com CSS Grid e Flexbox
- **JavaScript ES6+**: Lógica de aplicação e manipulação de dados

### Bibliotecas
- **Chart.js v3.9.1**: Gráficos interativos para timeline e instituições
- **WordCloud2.js**: Geração de nuvem de palavras dinâmica
- **Font Awesome**: Ícones vetoriais para interface

### Estilo e Design
- **Fonte**: Inter (Google Fonts) para tipografia moderna
- **Paleta de cores**: Verde esmeralda (#0b6d65) como cor primária
- **Layout**: Design limpo com fundo bege e elementos bem estruturados

## 📊 Funcionalidades Principais

### 1. **Estatísticas Gerais**
- Total de contribuições (575)
- Período de consulta
- Número de instituições participantes
- Contadores animados para melhor experiência visual

### 2. **Visualizações Gráficas**

#### Timeline de Contribuições
- Gráfico de linha mostrando a evolução temporal das contribuições
- Identificação de picos de participação
- Interatividade com tooltips informativos

#### Análise Institucional
- Gráfico de barras das principais instituições participantes
- Nota explicativa sobre contribuições coletivas não identificadas
- Destaque para diversidade de participação

### 3. **Nuvem de Palavras**
- **75 palavras** mais relevantes extraídas das contribuições
- Tamanho de fonte variável (12-32px) baseado na frequência
- Canvas otimizado (1300x450px) para melhor visualização
- Cores harmoniosas seguindo a paleta do projeto

### 4. **Análise de Conteúdo Estruturada**

#### Categorização por:
- **Capítulos**: Principais seções do plano
- **Seções Específicas**: Detalhamento por área temática
- **Missões**: Objetivos estratégicos identificados
- **Metas**: Alvos específicos mencionados
- **Ações**: Propostas concretas de implementação

#### Sistema "Ver Mais"
- Exibição inicial de 5 itens por categoria
- Expansão sob demanda para visualizar todos os dados
- Interface intuitiva com contadores de itens restantes

## 🔧 Arquitetura Técnica

### Estrutura de Arquivos
```
/
├── index.html              # Página principal
├── styles-consolidated.css # Estilos consolidados
├── script-consolidated.js  # Lógica JavaScript
├── consulta_pndbio_data.json # Base de dados (575 registros)
└── README.md              # Documentação
```

### Processamento de Dados

#### 1. **Carregamento**
- Fetch assíncrono com cache busting
- Tratamento de erros robusto
- Validação de integridade dos dados

#### 2. **Processamento**
- Limpeza e normalização de dados
- Agregação por diferentes critérios
- Cálculo de estatísticas descritivas

#### 3. **Visualização**
- Renderização dinâmica de componentes
- Animações suaves para transições
- Responsividade automática

### Otimizações Implementadas

#### Performance
- Carregamento lazy de componentes pesados
- Debounce em redimensionamentos
- Reutilização de elementos DOM

#### Experiência do Usuário
- Animações de contadores
- Tooltips informativos
- Estados de loading
- Feedback visual consistente

#### Responsividade
- CSS Grid adaptativo
- Breakpoints otimizados
- Componentes flexíveis

## 📱 Design Responsivo

### Breakpoints
- **Desktop**: > 1024px - Layout completo com grid 2x2
- **Tablet**: 768px - 1024px - Adaptação de espaçamentos
- **Mobile**: < 768px - Layout em coluna única

### Componentes Adaptativos
- Cards de estatísticas empilháveis
- Gráficos redimensionáveis automaticamente
- Nuvem de palavras responsiva

## 🎨 Identidade Visual

### Paleta de Cores
- **Verde Esmeralda**: #0b6d65 (primária)
- **Beige Claro**: #f8f6f0 (fundo)
- **Branco**: #ffffff (cards e seções)
- **Cinza**: #666666 (textos secundários)

### Tipografia
- **Família**: Inter (sans-serif)
- **Hierarquia**: Títulos em bold, textos em regular
- **Tamanhos**: Sistema escalável de 0.9em a 2em

## 📈 Insights dos Dados

### Participação
- **575 contribuições** totais analisadas
- Participação diversificada de instituições
- Contribuições majoritariamente coletivas

### Conteúdo
- **75 palavras-chave** identificadas
- Distribuição equilibrada entre categorias
- Foco em aspectos estratégicos e implementação

### Temporal
- Período de consulta bem definido
- Picos de participação identificáveis
- Engajamento consistente ao longo do tempo

## 🚀 Implementação e Deploy

### Requisitos
- Navegador moderno com suporte a ES6+
- Conexão com internet (para CDNs das bibliotecas)
- Servidor web para servir arquivos estáticos

### Instalação Local
```bash
# Clonar ou baixar os arquivos
# Servir através de servidor HTTP local
python -m http.server 8000
# ou
npx serve .
```

### Deploy
- Compatível com GitHub Pages
- Hospedagem em qualquer servidor estático
- CDN-friendly para distribuição global

## 🔍 Próximas Melhorias

### Funcionalidades
- [ ] Filtros por período/instituição
- [ ] Export de dados em diferentes formatos
- [ ] Busca textual nas contribuições
- [ ] Comparações temporais avançadas

### Técnicas
- [ ] Progressive Web App (PWA)
- [ ] Lazy loading de dados
- [ ] Cache offline
- [ ] Testes automatizados

## 📞 Contato e Contribuições

Este projeto foi desenvolvido como parte da análise da Consulta Pública do PNDBio, visando democratizar o acesso aos dados e facilitar a compreensão das contribuições recebidas.

---

**Tecnologias**: HTML5, CSS3, JavaScript, Chart.js, WordCloud2.js  
**Dados**: 575 contribuições da Consulta Pública PNDBio  
**Tipo**: Dashboard de análise de dados públicos
