# 🎮 Game Builder Pro

Construtor de jogos 2D mobile com 12 templates prontos para jogar!

![Game Builder](https://img.shields.io/badge/Games-12%20Templates-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌐 Acesso Online

**🚀 [Jogar Agora](https://dueuler.github.io/duGameBuilder/)** ← Clique aqui!

> **Nota**: Após fazer merge desta branch para `main`, o site será publicado automaticamente via GitHub Actions.

## 🚀 Templates Disponíveis

| Template | Descrição | Controles |
|----------|-----------|-----------|
| 🍄 Plataforma | Estilo Super Mario | ← → + Pulo |
| 🐦 Flappy | Voe entre os canos | Toque/Espaço |
| ⚔️ Top-Down | Estilo Zelda | 4 Direções |
| 🐍 Snake | Clássico cobra | D-pad Grid |
| 🧱 Breakout | Quebre os blocos | ← → + Lançar |
| 🏃 Runner | Endless runner | Pulo |
| 🚀 Space Shooter | Nave espacial | ↑ ↓ + Tiro |
| 🏎️ Racing | Corrida de carros | ← → |
| 🥊 Fighting | Luta 1v1 | ← → + Pulo + Soco |
| ⚽ Físico | Puzzle com física | Bounce |
| 💎 Match-3 | Combine gemas | Tap swap |

## 💻 Instalação e Uso

\\\ash
# Clone o repositório
git clone https://github.com/duEuler/duGameBuilder.git
cd duGameBuilder

# Instale as dependências
npm install

# Rode em desenvolvimento
npm start

# Build para produção
npm run build

# Deploy no GitHub Pages
npm run deploy
\\\

## 🎯 Funcionalidades

### Editor Visual
- ✅ Arraste e solte objetos
- ✅ Ajuste propriedades em tempo real
- ✅ Sistema de grid para posicionamento
- ✅ Duplicação e exclusão de objetos

### Engine de Jogo
- ✅ **60 FPS** - Performance otimizada com refs
- ✅ **Física realista** - Gravidade, colisão, bounce
- ✅ **Sistema de partículas** - Efeitos visuais
- ✅ **IA variada** - Patrulha, perseguição, sine wave
- ✅ **Controles responsivos** - Touch e teclado
- ✅ **Sistema de pontuação** - Score e vidas

### Mobile First
- 📱 Interface otimizada para touch
- 🎮 Botões virtuais por tipo de jogo
- 📐 Canvas responsivo
- ⚡ Performance nativa

## 🛠️ Tecnologias

- **React 18.2** - Framework UI
- **TypeScript 5** - Type safety
- **Canvas API** - Renderização de jogos 2D
- **Lucide React** - Ícones modernos
- **Tailwind CSS** - Estilização (inline)
- **GitHub Actions** - Deploy automático

## 📁 Estrutura do Projeto

```
duGameBuilder/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx         # Componente principal com game engine
│   ├── index.tsx       # Entry point
│   └── index.css       # Estilos globais
├── .github/
│   └── workflows/
│       └── deploy.yml  # Deploy automático
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 Como Criar um Jogo

1. **Escolha um template** na tela inicial
2. **Adicione objetos** usando o botão "+"
3. **Ajuste propriedades** clicando nos objetos
4. **Teste jogando** com o botão "▶ Jogar"
5. **Edite e refine** voltando ao modo editor

## 🔧 Customização

Cada objeto pode ser customizado:
- Tamanho (largura e altura)
- Física (gravidade, velocidade)
- Comportamento (IA, patrulha)
- Aparência (cores)

## 📝 Licença

MIT License - sinta-se livre para usar em seus projetos!

## 👨‍💻 Autor

**duEuler** - [GitHub](https://github.com/duEuler)

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças importantes, abra uma issue primeiro.

## ⭐ Mostre seu apoio

Se este projeto te ajudou, dê uma ⭐️!

---

**Desenvolvido com ❤️ e muito ☕**
