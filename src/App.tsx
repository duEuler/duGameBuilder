import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Plus, Trash2, Copy, Square, Circle, Triangle, User, Target, LucideIcon } from 'lucide-react';

interface GameObject {
  id?: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  velocityX?: number;
  velocityY?: number;
  controllable?: boolean;
  physics?: boolean;
  solid?: boolean;
  deadly?: boolean;
  collectible?: boolean;
  breakable?: boolean;
  broken?: boolean;
  points?: number;
  ai?: string;
  patrolStart?: number;
  patrolDistance?: number;
  speed?: number;
  jumpPower?: number;
  collected?: boolean;
  launched?: boolean;
  moving?: boolean;
  targetX?: number;
  targetY?: number;
  direction?: string;
  bounce?: number;
  health?: number;
  isRoad?: boolean;
  gemType?: string;
  label?: string;
}

interface GameTemplate {
  id: string;
  name: string;
  description: string;
  config: {
    gravity: number;
    canvasWidth: number;
    canvasHeight: number;
    controlScheme: string;
    scrollSpeed?: number;
    gridSize?: number;
  };
  initialObjects: GameObject[];
}

interface ObjectTemplate {
  type: string;
  icon: LucideIcon;
  color: string;
  physics?: boolean;
  controllable?: boolean;
  solid?: boolean;
  deadly?: boolean;
  collectible?: boolean;
  breakable?: boolean;
  ai?: string;
  points?: number;
  bounce?: number;
  gemType?: string;
  label: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const GameBuilder = () => {
  const [screen, setScreen] = useState<'templates' | 'editor'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showObjectMenu, setShowObjectMenu] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const gameObjectsRef = useRef<GameObject[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const touchControlsRef = useRef<{ left: boolean; right: boolean; jump: boolean; up: boolean; down: boolean }>({ left: false, right: false, jump: false, up: false, down: false });
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  const gameTemplates: GameTemplate[] = [
    {
      id: 'platformer',
      name: '🍄 Plataforma',
      description: 'Pule entre plataformas e colete moedas',
      config: {
        gravity: 0.6,
        canvasWidth: 800,
        canvasHeight: 400,
        controlScheme: 'platformer'
      },
      initialObjects: [
        { type: 'player', x: 50, y: 250, width: 40, height: 40, controllable: true, physics: true, color: '#3b82f6' },
        { type: 'platform', x: 0, y: 350, width: 800, height: 50, solid: true, color: '#10b981' },
        { type: 'platform', x: 200, y: 280, width: 120, height: 20, solid: true, color: '#10b981' },
        { type: 'platform', x: 400, y: 200, width: 120, height: 20, solid: true, color: '#10b981' },
        { type: 'coin', x: 250, y: 230, width: 30, height: 30, collectible: true, points: 10, color: '#fbbf24' },
        { type: 'coin', x: 450, y: 150, width: 30, height: 30, collectible: true, points: 10, color: '#fbbf24' },
        { type: 'enemy', x: 300, y: 240, width: 40, height: 40, ai: 'patrol', physics: true, deadly: true, color: '#ef4444' }
      ]
    },
    {
      id: 'flappy',
      name: '🐦 Flappy',
      description: 'Voe entre os canos',
      config: {
        gravity: 0.5,
        canvasWidth: 400,
        canvasHeight: 600,
        controlScheme: 'flappy'
      },
      initialObjects: [
        { type: 'player', x: 80, y: 300, width: 40, height: 40, controllable: true, physics: true, color: '#fbbf24' },
        { type: 'pipe-top', x: 300, y: 0, width: 60, height: 200, solid: true, deadly: true, color: '#10b981' },
        { type: 'pipe-bottom', x: 300, y: 400, width: 60, height: 200, solid: true, deadly: true, color: '#10b981' }
      ]
    },
    {
      id: 'topdown',
      name: '⚔️ Top-Down',
      description: 'Explore em todas direções',
      config: {
        gravity: 0,
        canvasWidth: 800,
        canvasHeight: 600,
        controlScheme: 'topdown'
      },
      initialObjects: [
        { type: 'player', x: 100, y: 100, width: 40, height: 40, controllable: true, physics: false, color: '#3b82f6' },
        { type: 'wall', x: 200, y: 200, width: 100, height: 20, solid: true, color: '#6b7280' },
        { type: 'wall', x: 500, y: 350, width: 20, height: 100, solid: true, color: '#6b7280' },
        { type: 'enemy', x: 400, y: 400, width: 40, height: 40, ai: 'chase', deadly: true, color: '#ef4444' },
        { type: 'coin', x: 600, y: 200, width: 30, height: 30, collectible: true, points: 10, color: '#fbbf24' }
      ]
    },
    {
      id: 'snake',
      name: '🐍 Snake',
      description: 'Coma frutas e cresça sem bater',
      config: {
        gravity: 0,
        canvasWidth: 600,
        canvasHeight: 600,
        controlScheme: 'snake',
        gridSize: 30
      },
      initialObjects: [
        { type: 'snake-head', x: 300, y: 300, width: 30, height: 30, controllable: true, physics: false, color: '#10b981' },
        { type: 'food', x: 150, y: 150, width: 30, height: 30, collectible: true, points: 10, color: '#ef4444' },
        { type: 'wall', x: 0, y: 0, width: 600, height: 30, solid: true, color: '#6b7280' },
        { type: 'wall', x: 0, y: 570, width: 600, height: 30, solid: true, color: '#6b7280' },
        { type: 'wall', x: 0, y: 0, width: 30, height: 600, solid: true, color: '#6b7280' },
        { type: 'wall', x: 570, y: 0, width: 30, height: 600, solid: true, color: '#6b7280' }
      ]
    },
    {
      id: 'breakout',
      name: '🧱 Breakout',
      description: 'Quebre todos os blocos',
      config: {
        gravity: 0,
        canvasWidth: 600,
        canvasHeight: 800,
        controlScheme: 'breakout'
      },
      initialObjects: [
        { type: 'paddle', x: 250, y: 750, width: 100, height: 20, controllable: true, color: '#3b82f6' },
        { type: 'ball', x: 290, y: 720, width: 20, height: 20, physics: true, color: '#fbbf24', launched: false },
        { type: 'brick', x: 50, y: 100, width: 70, height: 30, breakable: true, points: 10, color: '#ef4444' },
        { type: 'brick', x: 130, y: 100, width: 70, height: 30, breakable: true, points: 10, color: '#f97316' },
        { type: 'brick', x: 210, y: 100, width: 70, height: 30, breakable: true, points: 10, color: '#fbbf24' },
        { type: 'brick', x: 290, y: 100, width: 70, height: 30, breakable: true, points: 10, color: '#10b981' },
        { type: 'brick', x: 370, y: 100, width: 70, height: 30, breakable: true, points: 10, color: '#3b82f6' },
        { type: 'brick', x: 450, y: 100, width: 70, height: 30, breakable: true, points: 10, color: '#8b5cf6' }
      ]
    },
    {
      id: 'runner',
      name: '🏃 Endless Runner',
      description: 'Corra sem parar e desvie',
      config: {
        gravity: 0.6,
        canvasWidth: 800,
        canvasHeight: 400,
        controlScheme: 'runner',
        scrollSpeed: 5
      },
      initialObjects: [
        { type: 'player', x: 100, y: 260, width: 40, height: 60, controllable: true, physics: true, color: '#3b82f6' },
        { type: 'ground', x: 0, y: 350, width: 800, height: 50, solid: true, color: '#10b981' },
        { type: 'obstacle', x: 500, y: 290, width: 40, height: 60, deadly: true, color: '#ef4444' },
        { type: 'obstacle', x: 700, y: 290, width: 40, height: 60, deadly: true, color: '#ef4444' },
        { type: 'coin', x: 600, y: 200, width: 30, height: 30, collectible: true, points: 10, color: '#fbbf24' }
      ]
    },
    {
      id: 'shooter',
      name: '🚀 Space Shooter',
      description: 'Destrua inimigos espaciais',
      config: {
        gravity: 0,
        canvasWidth: 800,
        canvasHeight: 600,
        controlScheme: 'shooter',
        scrollSpeed: 2
      },
      initialObjects: [
        { type: 'player', x: 50, y: 275, width: 50, height: 50, controllable: true, physics: false, color: '#3b82f6' },
        { type: 'enemy', x: 400, y: 100, width: 40, height: 40, ai: 'sine', deadly: true, color: '#ef4444' },
        { type: 'enemy', x: 600, y: 400, width: 40, height: 40, ai: 'sine', deadly: true, color: '#ef4444' },
        { type: 'asteroid', x: 500, y: 250, width: 60, height: 60, deadly: true, color: '#78716c' }
      ]
    },
    {
      id: 'racing',
      name: '🏎️ Racing',
      description: 'Corra e desvie dos carros',
      config: {
        gravity: 0,
        canvasWidth: 400,
        canvasHeight: 600,
        controlScheme: 'racing',
        scrollSpeed: 3
      },
      initialObjects: [
        { type: 'player-car', x: 175, y: 450, width: 50, height: 80, controllable: true, color: '#3b82f6' },
        { type: 'road', x: 0, y: 0, width: 400, height: 600, isRoad: true, color: '#374151' },
        { type: 'enemy-car', x: 75, y: 100, width: 50, height: 80, deadly: true, ai: 'car', color: '#ef4444' },
        { type: 'enemy-car', x: 275, y: 250, width: 50, height: 80, deadly: true, ai: 'car', color: '#f97316' }
      ]
    },
    {
      id: 'fighting',
      name: '🥊 Fighting',
      description: 'Lute contra oponentes',
      config: {
        gravity: 0.6,
        canvasWidth: 800,
        canvasHeight: 500,
        controlScheme: 'fighting'
      },
      initialObjects: [
        { type: 'fighter-player', x: 100, y: 350, width: 50, height: 80, controllable: true, physics: true, health: 100, color: '#3b82f6' },
        { type: 'fighter-enemy', x: 650, y: 350, width: 50, height: 80, physics: true, health: 100, ai: 'fighter', deadly: true, color: '#ef4444' },
        { type: 'ground', x: 0, y: 450, width: 800, height: 50, solid: true, color: '#78716c' }
      ]
    },
    {
      id: 'physics',
      name: '⚽ Puzzle Físico',
      description: 'Use física para resolver',
      config: {
        gravity: 0.8,
        canvasWidth: 800,
        canvasHeight: 600,
        controlScheme: 'physics'
      },
      initialObjects: [
        { type: 'ball', x: 100, y: 100, width: 40, height: 40, physics: true, bounce: 0.7, color: '#3b82f6' },
        { type: 'platform', x: 200, y: 400, width: 200, height: 20, solid: true, color: '#10b981' },
        { type: 'platform', x: 500, y: 300, width: 150, height: 20, solid: true, color: '#10b981' },
        { type: 'goal', x: 650, y: 250, width: 50, height: 50, collectible: true, points: 100, color: '#fbbf24' }
      ]
    },
    {
      id: 'match3',
      name: '💎 Match-3',
      description: 'Combine 3 ou mais iguais',
      config: {
        gravity: 0,
        canvasWidth: 600,
        canvasHeight: 700,
        controlScheme: 'match3',
        gridSize: 60
      },
      initialObjects: [
        { type: 'gem-red', x: 120, y: 100, width: 50, height: 50, gemType: 'red', color: '#ef4444' },
        { type: 'gem-blue', x: 180, y: 100, width: 50, height: 50, gemType: 'blue', color: '#3b82f6' },
        { type: 'gem-green', x: 240, y: 100, width: 50, height: 50, gemType: 'green', color: '#10b981' },
        { type: 'gem-yellow', x: 300, y: 100, width: 50, height: 50, gemType: 'yellow', color: '#fbbf24' },
        { type: 'gem-purple', x: 360, y: 100, width: 50, height: 50, gemType: 'purple', color: '#8b5cf6' },
        { type: 'gem-red', x: 120, y: 160, width: 50, height: 50, gemType: 'red', color: '#ef4444' },
        { type: 'gem-green', x: 180, y: 160, width: 50, height: 50, gemType: 'green', color: '#10b981' },
        { type: 'gem-blue', x: 240, y: 160, width: 50, height: 50, gemType: 'blue', color: '#3b82f6' }
      ]
    }
  ];

  const objectTemplates: Record<string, ObjectTemplate[]> = {
    platformer: [
      { type: 'player', icon: User, color: '#3b82f6', physics: true, controllable: true, label: 'Jogador' },
      { type: 'platform', icon: Square, color: '#10b981', physics: false, solid: true, label: 'Plataforma' },
      { type: 'enemy', icon: Target, color: '#ef4444', physics: true, ai: 'patrol', deadly: true, label: 'Inimigo' },
      { type: 'coin', icon: Circle, color: '#fbbf24', physics: false, collectible: true, points: 10, label: 'Moeda' }
    ],
    flappy: [
      { type: 'player', icon: Circle, color: '#fbbf24', physics: true, controllable: true, label: 'Pássaro' },
      { type: 'pipe-top', icon: Square, color: '#10b981', physics: false, solid: true, deadly: true, label: 'Cano' }
    ],
    topdown: [
      { type: 'player', icon: User, color: '#3b82f6', physics: false, controllable: true, label: 'Herói' },
      { type: 'wall', icon: Square, color: '#6b7280', physics: false, solid: true, label: 'Parede' },
      { type: 'enemy', icon: Target, color: '#ef4444', physics: false, ai: 'chase', deadly: true, label: 'Inimigo' },
      { type: 'coin', icon: Circle, color: '#fbbf24', physics: false, collectible: true, points: 10, label: 'Moeda' }
    ],
    snake: [
      { type: 'snake-head', icon: Square, color: '#10b981', physics: false, controllable: true, label: 'Cabeça' },
      { type: 'food', icon: Circle, color: '#ef4444', physics: false, collectible: true, points: 10, label: 'Comida' },
      { type: 'wall', icon: Square, color: '#6b7280', physics: false, solid: true, label: 'Parede' }
    ],
    breakout: [
      { type: 'paddle', icon: Square, color: '#3b82f6', controllable: true, label: 'Raquete' },
      { type: 'ball', icon: Circle, color: '#fbbf24', physics: true, label: 'Bola' },
      { type: 'brick', icon: Square, color: '#ef4444', breakable: true, points: 10, label: 'Bloco' }
    ],
    runner: [
      { type: 'player', icon: User, color: '#3b82f6', physics: true, controllable: true, label: 'Corredor' },
      { type: 'obstacle', icon: Triangle, color: '#ef4444', deadly: true, label: 'Obstáculo' },
      { type: 'platform', icon: Square, color: '#10b981', solid: true, label: 'Plataforma' },
      { type: 'coin', icon: Circle, color: '#fbbf24', collectible: true, points: 10, label: 'Moeda' }
    ],
    shooter: [
      { type: 'player', icon: Triangle, color: '#3b82f6', physics: false, controllable: true, label: 'Nave' },
      { type: 'enemy', icon: Target, color: '#ef4444', physics: false, ai: 'sine', deadly: true, label: 'Inimigo' },
      { type: 'asteroid', icon: Circle, color: '#78716c', physics: false, deadly: true, label: 'Asteroide' }
    ],
    racing: [
      { type: 'player-car', icon: Triangle, color: '#3b82f6', controllable: true, label: 'Seu Carro' },
      { type: 'enemy-car', icon: Square, color: '#ef4444', deadly: true, ai: 'car', label: 'Carro Inimigo' }
    ],
    fighting: [
      { type: 'fighter-player', icon: User, color: '#3b82f6', physics: true, controllable: true, label: 'Lutador' },
      { type: 'fighter-enemy', icon: Target, color: '#ef4444', physics: true, ai: 'fighter', deadly: true, label: 'Oponente' },
      { type: 'platform', icon: Square, color: '#78716c', solid: true, label: 'Chão' }
    ],
    physics: [
      { type: 'ball', icon: Circle, color: '#3b82f6', physics: true, bounce: 0.7, label: 'Bola' },
      { type: 'platform', icon: Square, color: '#10b981', physics: false, solid: true, label: 'Plataforma' },
      { type: 'goal', icon: Target, color: '#fbbf24', physics: false, collectible: true, label: 'Objetivo' }
    ],
    match3: [
      { type: 'gem-red', icon: Circle, color: '#ef4444', gemType: 'red', label: 'Gema Vermelha' },
      { type: 'gem-blue', icon: Circle, color: '#3b82f6', gemType: 'blue', label: 'Gema Azul' },
      { type: 'gem-green', icon: Circle, color: '#10b981', gemType: 'green', label: 'Gema Verde' },
      { type: 'gem-yellow', icon: Circle, color: '#fbbf24', gemType: 'yellow', label: 'Gema Amarela' },
      { type: 'gem-purple', icon: Circle, color: '#8b5cf6', gemType: 'purple', label: 'Gema Roxa' }
    ]
  };

  const startFromTemplate = (template: GameTemplate) => {
    setSelectedTemplate(template);
    const initialObjects = template.initialObjects.map((obj, idx) => ({
      ...obj,
      id: Date.now() + idx,
      velocityX: 0,
      velocityY: 0,
      collected: false,
      patrolStart: obj.x,
      patrolDistance: 100,
      speed: obj.ai === 'patrol' ? 2 : 5,
      jumpPower: -12
    }));
    setObjects(initialObjects);
    gameObjectsRef.current = JSON.parse(JSON.stringify(initialObjects));
    setScreen('editor');
    setScore(0);
    setLives(3);
    scoreRef.current = 0;
    livesRef.current = 3;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const addObject = (template: ObjectTemplate) => {
    const newObject = {
      id: Date.now(),
      ...template,
      x: 200,
      y: 200,
      width: 40,
      height: 40,
      velocityX: 0,
      velocityY: 0,
      collected: false,
      patrolStart: 200,
      patrolDistance: 100,
      speed: 5,
      jumpPower: -12
    };
    setObjects(prev => [...prev, newObject]);
  };

  const updateObject = (id: number, updates: Partial<GameObject>) => {
    setObjects(objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj));
  };

  const deleteObject = (id: number) => {
    setObjects(objects.filter(obj => obj.id !== id));
    if (selectedObject?.id === id) setSelectedObject(null);
  };

  const duplicateObject = (obj: GameObject) => {
    const newObj = { ...obj, id: Date.now(), x: obj.x + 50, y: obj.y + 50 };
    setObjects([...objects, newObj]);
  };

  const createParticles = (x: number, y: number, color: string, count = 8) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 30,
        color
      });
    }
  };

  const checkCollision = (obj1: GameObject, obj2: GameObject) => {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  };

  useEffect(() => {
    if (!isPlaying || !selectedTemplate) return;
    
    gameObjectsRef.current = JSON.parse(JSON.stringify(objects));
    particlesRef.current = [];
    
    const config = selectedTemplate.config;
    const keys = keysRef;
    const touch = touchControlsRef;

    const gameLoop = () => {
      const gameObjects = gameObjectsRef.current;
      const player = gameObjects.find(o => o.controllable);

      // Atualizar objetos
      for (let i = 0; i < gameObjects.length; i++) {
        const obj = gameObjects[i];
        if (obj.collected) continue;

        // CONTROLES
        if (obj.controllable) {
          const moveSpeed = obj.speed || 5;

          if (config.controlScheme === 'platformer') {
            if (keys.current['ArrowLeft'] || keys.current['a'] || touch.current.left) {
              obj.velocityX = -moveSpeed;
            } else if (keys.current['ArrowRight'] || keys.current['d'] || touch.current.right) {
              obj.velocityX = moveSpeed;
            } else {
              obj.velocityX *= 0.8;
            }
            if ((keys.current['ArrowUp'] || keys.current[' '] || touch.current.jump) && Math.abs(obj.velocityY) < 0.1) {
              obj.velocityY = obj.jumpPower || -12;
            }
          }

          if (config.controlScheme === 'flappy') {
            if (keys.current[' '] || touch.current.jump) {
              obj.velocityY = -8;
              touch.current.jump = false;
            }
          }

          if (config.controlScheme === 'topdown') {
            const speed = moveSpeed;
            let newX = obj.x;
            let newY = obj.y;
            
            if (keys.current['ArrowUp'] || keys.current['w'] || touch.current.up) newY -= speed;
            if (keys.current['ArrowDown'] || keys.current['s'] || touch.current.down) newY += speed;
            if (keys.current['ArrowLeft'] || keys.current['a'] || touch.current.left) newX -= speed;
            if (keys.current['ArrowRight'] || keys.current['d'] || touch.current.right) newX += speed;
            
            // Verificar colisão antes de mover
            let canMove = true;
            const testObj = { ...obj, x: newX, y: newY };
            for (let j = 0; j < gameObjects.length; j++) {
              if (gameObjects[j].solid && i !== j && checkCollision(testObj, gameObjects[j])) {
                canMove = false;
                break;
              }
            }
            
            if (canMove) {
              obj.x = newX;
              obj.y = newY;
            }
          }

          if (config.controlScheme === 'snake') {
            const gridSize = config.gridSize || 30;
            if (!obj.moving) {
              if (keys.current['ArrowUp'] || touch.current.up) {
                obj.moving = true;
                obj.targetY = obj.y - gridSize;
                obj.direction = 'up';
              } else if (keys.current['ArrowDown'] || touch.current.down) {
                obj.moving = true;
                obj.targetY = obj.y + gridSize;
                obj.direction = 'down';
              } else if (keys.current['ArrowLeft'] || touch.current.left) {
                obj.moving = true;
                obj.targetX = obj.x - gridSize;
                obj.direction = 'left';
              } else if (keys.current['ArrowRight'] || touch.current.right) {
                obj.moving = true;
                obj.targetX = obj.x + gridSize;
                obj.direction = 'right';
              }
            }

            if (obj.moving) {
              const speed = 5;
              if (obj.targetX !== undefined) {
                if (Math.abs(obj.x - obj.targetX) < speed) {
                  obj.x = obj.targetX;
                  obj.moving = false;
                  obj.targetX = undefined;
                } else {
                  obj.x += obj.x < obj.targetX ? speed : -speed;
                }
              }
              if (obj.targetY !== undefined) {
                if (Math.abs(obj.y - obj.targetY) < speed) {
                  obj.y = obj.targetY;
                  obj.moving = false;
                  obj.targetY = undefined;
                } else {
                  obj.y += obj.y < obj.targetY ? speed : -speed;
                }
              }
            }
          }

          if (config.controlScheme === 'breakout') {
            if (keys.current['ArrowLeft'] || touch.current.left) {
              obj.x -= moveSpeed;
            }
            if (keys.current['ArrowRight'] || touch.current.right) {
              obj.x += moveSpeed;
            }
          }

          if (config.controlScheme === 'runner') {
            if ((keys.current['ArrowUp'] || keys.current[' '] || touch.current.jump) && Math.abs(obj.velocityY) < 0.1) {
              obj.velocityY = obj.jumpPower || -12;
            }
          }

          if (config.controlScheme === 'shooter') {
            if (keys.current['ArrowUp'] || touch.current.up) obj.y -= moveSpeed;
            if (keys.current['ArrowDown'] || touch.current.down) obj.y += moveSpeed;
          }

          if (config.controlScheme === 'racing') {
            if (keys.current['ArrowLeft'] || touch.current.left) obj.x -= moveSpeed;
            if (keys.current['ArrowRight'] || touch.current.right) obj.x += moveSpeed;
            obj.y -= 3;
          }

          if (config.controlScheme === 'fighting') {
            if (keys.current['ArrowLeft'] || keys.current['a'] || touch.current.left) {
              obj.velocityX = -moveSpeed;
            } else if (keys.current['ArrowRight'] || keys.current['d'] || touch.current.right) {
              obj.velocityX = moveSpeed;
            } else {
              obj.velocityX *= 0.8;
            }
            if ((keys.current['ArrowUp'] || keys.current['w'] || touch.current.jump) && Math.abs(obj.velocityY) < 0.1) {
              obj.velocityY = -10;
            }
          }
        }

        // BREAKOUT - Bola segue raquete
        if (obj.type === 'ball' && config.controlScheme === 'breakout') {
          const paddle = gameObjects.find(o => o.type === 'paddle');
          
          if (!obj.launched && paddle) {
            obj.x = paddle.x + paddle.width / 2 - obj.width / 2;
            obj.y = paddle.y - obj.height - 5;
            
            if (keys.current[' '] || touch.current.jump) {
              obj.launched = true;
              obj.velocityY = -8;
              obj.velocityX = 3;
            }
          } else if (obj.launched) {
            obj.x += obj.velocityX;
            obj.y += obj.velocityY;

            // Colisão com paddle
            if (paddle && checkCollision(obj, paddle) && obj.velocityY > 0) {
              obj.velocityY = -Math.abs(obj.velocityY);
              const hitPos = (obj.x - paddle.x) / paddle.width;
              obj.velocityX = (hitPos - 0.5) * 10;
            }

            // Colisão com blocos
            for (let j = 0; j < gameObjects.length; j++) {
              const brick = gameObjects[j];
              if (brick.breakable && !brick.broken && checkCollision(obj, brick)) {
                obj.velocityY *= -1;
                brick.broken = true;
                createParticles(brick.x + brick.width/2, brick.y + brick.height/2, brick.color);
                scoreRef.current += brick.points || 10;
              }
            }

            // Paredes
            if (obj.x <= 0 || obj.x >= config.canvasWidth - obj.width) {
              obj.velocityX *= -1;
            }
            if (obj.y <= 0) {
              obj.velocityY *= -1;
            }

            // Perder
            if (obj.y > config.canvasHeight) {
              livesRef.current = Math.max(0, livesRef.current - 1);
              obj.launched = false;
              obj.velocityX = 0;
              obj.velocityY = 0;
            }
          }
        }

        // FÍSICA COM BOUNCE
        if (obj.physics && obj.bounce) {
          obj.velocityY += config.gravity || 0.5;
          obj.y += obj.velocityY;
          obj.x += obj.velocityX;

          if (obj.y + obj.height >= config.canvasHeight) {
            obj.y = config.canvasHeight - obj.height;
            obj.velocityY = -obj.velocityY * obj.bounce;
            if (Math.abs(obj.velocityY) < 0.5) obj.velocityY = 0;
          }

          for (let j = 0; j < gameObjects.length; j++) {
            const platform = gameObjects[j];
            if (platform.solid && i !== j && checkCollision(obj, platform)) {
              if (obj.velocityY > 0) {
                obj.y = platform.y - obj.height;
                obj.velocityY = -obj.velocityY * obj.bounce;
              }
            }
          }
        }

        // IA SINE WAVE (Space Shooter)
        if (obj.ai === 'sine') {
          obj.x += 2;
          obj.y += Math.sin(obj.x * 0.05) * 3;
        }

        // IA CARRO (Racing)
        if (obj.ai === 'car') {
          obj.y += 4;
          if (obj.y > config.canvasHeight) {
            obj.y = -80;
            obj.x = 75 + Math.floor(Math.random() * 3) * 100;
          }
        }

        // IA FIGHTER
        if (obj.ai === 'fighter' && player) {
          const distance = player.x - obj.x;
          if (Math.abs(distance) > 60) {
            obj.x += distance > 0 ? 2 : -2;
          }
        }

        // RUNNER - Auto scroll
        if (config.controlScheme === 'runner' && config.scrollSpeed && !obj.controllable && !obj.solid) {
          obj.x -= config.scrollSpeed;
          
          if (obj.x < -100) {
            if (obj.deadly) {
              obj.x = config.canvasWidth + Math.random() * 200;
            } else if (obj.collectible) {
              obj.x = config.canvasWidth + Math.random() * 300;
              obj.collected = false;
            }
          }
        }

        // SHOOTER - Auto scroll
        if (config.controlScheme === 'shooter' && config.scrollSpeed && !obj.controllable) {
          obj.x += config.scrollSpeed;
          if (obj.x > config.canvasWidth) {
            obj.x = -obj.width;
            obj.y = Math.random() * config.canvasHeight;
          }
        }

        // FÍSICA
        if (obj.physics) {
          obj.velocityY += config.gravity || 0.5;
          obj.y += obj.velocityY;
          obj.x += obj.velocityX;

          // Chão
          if (obj.y + obj.height >= config.canvasHeight) {
            obj.y = config.canvasHeight - obj.height;
            obj.velocityY = 0;
          }

          // Plataformas
          for (let j = 0; j < gameObjects.length; j++) {
            const platform = gameObjects[j];
            if (platform.solid && i !== j && checkCollision(obj, platform)) {
              if (obj.velocityY > 0 && obj.y + obj.height - obj.velocityY <= platform.y + 5) {
                obj.y = platform.y - obj.height;
                obj.velocityY = 0;
              }
            }
          }
        }

        // COLETA
        if (player && obj.collectible && !obj.collected && checkCollision(player, obj)) {
          obj.collected = true;
          createParticles(obj.x + obj.width/2, obj.y + obj.height/2, obj.color);
          scoreRef.current += obj.points || 10;
        }

        // DEADLY
        if (player && obj.deadly && player.id !== obj.id && checkCollision(player, obj)) {
          createParticles(player.x + player.width/2, player.y + player.height/2, '#ef4444', 12);
          livesRef.current = Math.max(0, livesRef.current - 1);
          player.x = 50;
          player.y = 50;
          player.velocityX = 0;
          player.velocityY = 0;
        }

        // IA PATRULHA
        if (obj.ai === 'patrol') {
          const distance = Math.abs(obj.x - obj.patrolStart);
          if (distance > obj.patrolDistance) {
            obj.speed *= -1;
          }
          obj.x += obj.speed;
        }

        // IA PERSEGUIÇÃO
        if (obj.ai === 'chase' && player) {
          const dx = player.x - obj.x;
          const dy = player.y - obj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0 && dist < 200) {
            obj.x += (dx / dist) * 2;
            obj.y += (dy / dist) * 2;
          }
        }

        // LIMITES
        obj.x = Math.max(0, Math.min(obj.x, config.canvasWidth - obj.width));
        obj.y = Math.max(0, Math.min(obj.y, config.canvasHeight - obj.height));
      }

      // Atualizar partículas
      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.3,
          life: p.life - 1
        }))
        .filter(p => p.life > 0);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, selectedTemplate]);

  // Atualizar score e lives na UI a cada 100ms
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setScore(scoreRef.current);
      setLives(livesRef.current);
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  // RENDERIZAÇÃO DO CANVAS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTemplate) return;
    const ctx = canvas.getContext('2d');
    const config = selectedTemplate.config;

    const draw = () => {
      ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
      
      // Background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
      
      // Grid (modo editor)
      if (!isPlaying) {
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        for (let i = 0; i < config.canvasWidth; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, config.canvasHeight);
          ctx.stroke();
        }
        for (let i = 0; i < config.canvasHeight; i += 40) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(config.canvasWidth, i);
          ctx.stroke();
        }
      }

      // Objetos
      const objectsToRender = isPlaying ? gameObjectsRef.current : objects;
      objectsToRender.forEach(obj => {
        if (obj.collected) return;
        
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

        if (!isPlaying) {
          ctx.fillStyle = 'white';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(obj.type, obj.x + obj.width/2, obj.y - 5);
        }

        if (selectedObject?.id === obj.id && !isPlaying) {
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 3;
          ctx.strokeRect(obj.x - 2, obj.y - 2, obj.width + 4, obj.height + 4);
        }
      });

      // Partículas
      if (isPlaying) {
        particlesRef.current.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life / 30;
          ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
          ctx.globalAlpha = 1;
        });
      }

      // HUD
      if (isPlaying) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(10, 10, 200, 70);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Pontos: ${score}`, 20, 35);
        ctx.fillText(`❤️ x ${lives}`, 20, 60);
      }

      requestAnimationFrame(draw);
    };

    draw();
  }, [objects, selectedObject, isPlaying, score, lives, selectedTemplate]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPlaying || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const clicked = objects.find(obj => 
      x >= obj.x && x <= obj.x + obj.width &&
      y >= obj.y && y <= obj.y + obj.height
    );
    
    setSelectedObject(clicked || null);
    if (clicked) setShowProperties(true);
  };

  const renderControls = () => {
    if (!isPlaying || !selectedTemplate) return null;
    const scheme = selectedTemplate.config.controlScheme;

    const handleTouchStart = (key: keyof typeof touchControlsRef.current) => (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      touchControlsRef.current[key] = true;
    };

    const handleTouchEnd = (key: keyof typeof touchControlsRef.current) => (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      touchControlsRef.current[key] = false;
    };

    if (scheme === 'platformer') {
      return (
        <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4 z-10 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <button
              onMouseDown={handleTouchStart('left')}
              onMouseUp={handleTouchEnd('left')}
              onTouchStart={handleTouchStart('left')}
              onTouchEnd={handleTouchEnd('left')}
              className="w-16 h-16 bg-gray-700/90 rounded-full flex items-center justify-center active:bg-gray-600 text-2xl font-bold shadow-lg"
            >
              ←
            </button>
            <button
              onMouseDown={handleTouchStart('right')}
              onMouseUp={handleTouchEnd('right')}
              onTouchStart={handleTouchStart('right')}
              onTouchEnd={handleTouchEnd('right')}
              className="w-16 h-16 bg-gray-700/90 rounded-full flex items-center justify-center active:bg-gray-600 text-2xl font-bold shadow-lg"
            >
              →
            </button>
          </div>
          <button
            onMouseDown={handleTouchStart('jump')}
            onMouseUp={handleTouchEnd('jump')}
            onTouchStart={handleTouchStart('jump')}
            onTouchEnd={handleTouchEnd('jump')}
            className="w-20 h-20 bg-red-600/90 rounded-full flex items-center justify-center active:bg-red-700 pointer-events-auto text-sm font-bold shadow-lg"
          >
            PULO
          </button>
        </div>
      );
    }

    if (scheme === 'flappy') {
      return (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <button
            onMouseDown={handleTouchStart('jump')}
            onMouseUp={handleTouchEnd('jump')}
            onTouchStart={handleTouchStart('jump')}
            onTouchEnd={handleTouchEnd('jump')}
            className="w-32 h-32 bg-blue-600/90 rounded-full flex items-center justify-center active:bg-blue-700 pointer-events-auto text-4xl font-bold shadow-lg"
          >
            ↑
          </button>
        </div>
      );
    }

    if (scheme === 'topdown') {
      return (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="grid grid-cols-3 gap-2 pointer-events-auto">
            <div></div>
            <button
              onMouseDown={handleTouchStart('up')}
              onMouseUp={handleTouchEnd('up')}
              onTouchStart={handleTouchStart('up')}
              onTouchEnd={handleTouchEnd('up')}
              className="w-16 h-16 bg-gray-700/90 rounded-lg active:bg-gray-600 text-2xl font-bold shadow-lg"
            >
              ↑
            </button>
            <div></div>
            <button
              onMouseDown={handleTouchStart('left')}
              onMouseUp={handleTouchEnd('left')}
              onTouchStart={handleTouchStart('left')}
              onTouchEnd={handleTouchEnd('left')}
              className="w-16 h-16 bg-gray-700/90 rounded-lg active:bg-gray-600 text-2xl font-bold shadow-lg"
            >
              ←
            </button>
            <button
              onMouseDown={handleTouchStart('down')}
              onMouseUp={handleTouchEnd('down')}
              onTouchStart={handleTouchStart('down')}
              onTouchEnd={handleTouchEnd('down')}
              className="w-16 h-16 bg-gray-700/90 rounded-lg active:bg-gray-600 text-2xl font-bold shadow-lg"
            >
              ↓
            </button>
            <button
              onMouseDown={handleTouchStart('right')}
              onMouseUp={handleTouchEnd('right')}
              onTouchStart={handleTouchStart('right')}
              onTouchEnd={handleTouchEnd('right')}
              className="w-16 h-16 bg-gray-700/90 rounded-lg active:bg-gray-600 text-2xl font-bold shadow-lg"
            >
              →
            </button>
          </div>
        </div>
      );
    }

    if (scheme === 'snake') {
      return (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="grid grid-cols-3 gap-2 pointer-events-auto">
            <div></div>
            <button
              onMouseDown={handleTouchStart('up')}
              onMouseUp={handleTouchEnd('up')}
              onTouchStart={handleTouchStart('up')}
              onTouchEnd={handleTouchEnd('up')}
              className="w-16 h-16 bg-green-700/90 rounded-lg active:bg-green-600 text-2xl font-bold shadow-lg"
            >
              ↑
            </button>
            <div></div>
            <button
              onMouseDown={handleTouchStart('left')}
              onMouseUp={handleTouchEnd('left')}
              onTouchStart={handleTouchStart('left')}
              onTouchEnd={handleTouchEnd('left')}
              className="w-16 h-16 bg-green-700/90 rounded-lg active:bg-green-600 text-2xl font-bold shadow-lg"
            >
              ←
            </button>
            <button
              onMouseDown={handleTouchStart('down')}
              onMouseUp={handleTouchEnd('down')}
              onTouchStart={handleTouchStart('down')}
              onTouchEnd={handleTouchEnd('down')}
              className="w-16 h-16 bg-green-700/90 rounded-lg active:bg-green-600 text-2xl font-bold shadow-lg"
            >
              ↓
            </button>
            <button
              onMouseDown={handleTouchStart('right')}
              onMouseUp={handleTouchEnd('right')}
              onTouchStart={handleTouchStart('right')}
              onTouchEnd={handleTouchEnd('right')}
              className="w-16 h-16 bg-green-700/90 rounded-lg active:bg-green-600 text-2xl font-bold shadow-lg"
            >
              →
            </button>
          </div>
        </div>
      );
    }

    if (scheme === 'breakout') {
      return (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center p-4 z-10 pointer-events-none">
          <div className="flex gap-3 pointer-events-auto">
            <button
              onMouseDown={handleTouchStart('left')}
              onMouseUp={handleTouchEnd('left')}
              onTouchStart={handleTouchStart('left')}
              onTouchEnd={handleTouchEnd('left')}
              className="w-20 h-20 bg-gray-700/90 rounded-full flex items-center justify-center active:bg-gray-600 text-3xl shadow-lg"
            >
              ←
            </button>
            <button
              onMouseDown={handleTouchStart('right')}
              onMouseUp={handleTouchEnd('right')}
              onTouchStart={handleTouchStart('right')}
              onTouchEnd={handleTouchEnd('right')}
              className="w-20 h-20 bg-gray-700/90 rounded-full flex items-center justify-center active:bg-gray-600 text-3xl shadow-lg"
            >
              →
            </button>
            <button
              onMouseDown={handleTouchStart('jump')}
              onMouseUp={handleTouchEnd('jump')}
              onTouchStart={handleTouchStart('jump')}
              onTouchEnd={handleTouchEnd('jump')}
              className="w-20 h-20 bg-red-600/90 rounded-full flex items-center justify-center active:bg-red-700 text-xs font-bold shadow-lg"
            >
              LANÇAR
            </button>
          </div>
        </div>
      );
    }

    if (scheme === 'runner') {
      return (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center p-4 z-10 pointer-events-none">
          <button
            onMouseDown={handleTouchStart('jump')}
            onMouseUp={handleTouchEnd('jump')}
            onTouchStart={handleTouchStart('jump')}
            onTouchEnd={handleTouchEnd('jump')}
            className="w-40 h-24 bg-yellow-600/90 rounded-2xl flex items-center justify-center active:bg-yellow-700 text-2xl font-bold pointer-events-auto shadow-lg"
          >
            PULAR
          </button>
        </div>
      );
    }

    if (scheme === 'shooter' || scheme === 'racing') {
      return (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="grid grid-cols-3 gap-2 pointer-events-auto">
            <div></div>
            <button
              onMouseDown={handleTouchStart('up')}
              onMouseUp={handleTouchEnd('up')}
              onTouchStart={handleTouchStart('up')}
              onTouchEnd={handleTouchEnd('up')}
              className="w-16 h-16 bg-gray-700/90 rounded-lg active:bg-gray-600 text-2xl font-bold shadow-lg"
            >
              ↑
            </button>
            <div></div>
            <button
              onMouseDown={handleTouchStart('left')}
              onMouseUp={handleTouchEnd('left')}
              onTouchStart={handleTouchStart('left')}
              onTouchEnd={handleTouchEnd('left')}
              className="w-16 h-16 bg-gray-700/90 rounded-lg active:bg-gray-600 text-2xl font-bold shadow-lg"
            >
              ←
            </button>
            <button
              onMouseDown={handleTouchStart('down')}
              onMouseUp={handleTouchEnd('down')}
              onTouchStart={handleTouchStart('down')}
              onTouchEnd={handleTouchEnd('down')}
              className="w-16 h-16 bg-gray-700/90 rounded-lg active:bg-gray-600 text-2xl font-bold shadow-lg"
            >
              ↓
            </button>
            <button
              onMouseDown={handleTouchStart('right')}
              onMouseUp={handleTouchEnd('right')}
              onTouchStart={handleTouchStart('right')}
              onTouchEnd={handleTouchEnd('right')}
              className="w-16 h-16 bg-gray-700/90 rounded-lg active:bg-gray-600 text-2xl font-bold shadow-lg"
            >
              →
            </button>
          </div>
        </div>
      );
    }

    if (scheme === 'fighting') {
      return (
        <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4 z-10 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <button
              onMouseDown={handleTouchStart('left')}
              onMouseUp={handleTouchEnd('left')}
              onTouchStart={handleTouchStart('left')}
              onTouchEnd={handleTouchEnd('left')}
              className="w-16 h-16 bg-gray-700/90 rounded-full text-2xl font-bold active:bg-gray-600 shadow-lg"
            >
              ←
            </button>
            <button
              onMouseDown={handleTouchStart('right')}
              onMouseUp={handleTouchEnd('right')}
              onTouchStart={handleTouchStart('right')}
              onTouchEnd={handleTouchEnd('right')}
              className="w-16 h-16 bg-gray-700/90 rounded-full text-2xl font-bold active:bg-gray-600 shadow-lg"
            >
              →
            </button>
          </div>
          <div className="flex gap-2 pointer-events-auto">
            <button
              onMouseDown={handleTouchStart('jump')}
              onMouseUp={handleTouchEnd('jump')}
              onTouchStart={handleTouchStart('jump')}
              onTouchEnd={handleTouchEnd('jump')}
              className="w-16 h-16 bg-red-600/90 rounded-full text-sm font-bold active:bg-red-700 shadow-lg"
            >
              PULO
            </button>
            <button className="w-16 h-16 bg-orange-600/90 rounded-full text-sm font-bold active:bg-orange-700 shadow-lg">
              SOCO
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  if (screen === 'templates') {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 text-white">
        <div className="p-6 text-center border-b border-white/20">
          <h1 className="text-4xl font-bold mb-2">🎮 Game Builder Pro</h1>
          <p className="text-gray-300">Escolha um template para começar</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {gameTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => startFromTemplate(template)}
                className="bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700 hover:border-blue-500 rounded-xl p-6 text-left transition-all transform hover:scale-105"
              >
                <div className="text-6xl mb-4 text-center">{template.name.split(' ')[0]}</div>
                <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                <p className="text-gray-400 text-sm">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const config = selectedTemplate?.config || { canvasWidth: 800, canvasHeight: 400, gravity: 0, controlScheme: 'platformer' };
  const availableObjects = objectTemplates[selectedTemplate?.id || ''] || [];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setScreen('templates');
              setObjects([]);
              setSelectedTemplate(null);
              setIsPlaying(false);
            }}
            className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            ← Voltar
          </button>
          <h1 className="text-lg font-bold">{selectedTemplate?.name || 'Game'}</h1>
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-bold ${
            isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isPlaying ? <><Pause size={20} /> Parar</> : <><Play size={20} /> Jogar</>}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-950 p-4 relative">
        <canvas
          ref={canvasRef}
          width={config.canvasWidth || 800}
          height={config.canvasHeight || 400}
          onClick={handleCanvasClick}
          className="bg-gray-900 rounded-lg shadow-2xl max-w-full"
          style={{ maxHeight: '70vh', touchAction: 'none' }}
        />
        {renderControls()}
      </div>

      {selectedObject && !isPlaying && showProperties && (
        <div className="bg-gray-800 p-3 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">{selectedObject.label || selectedObject.type}</span>
            <div className="flex gap-2">
              <button onClick={() => duplicateObject(selectedObject)} className="p-2 bg-blue-600 rounded">
                <Copy size={16} />
              </button>
              <button onClick={() => deleteObject(selectedObject.id)} className="p-2 bg-red-600 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!isPlaying && (
        <div className="bg-gray-800 p-3 border-t border-gray-700">
          <button
            onClick={() => setShowObjectMenu(!showObjectMenu)}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
          >
            <Plus size={20} /> Adicionar Objeto
          </button>
          
          {showObjectMenu && availableObjects.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {availableObjects.map((template) => (
                <button
                  key={template.type}
                  onClick={() => addObject(template)}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg flex flex-col items-center gap-2"
                >
                  <template.icon size={24} color={template.color} />
                  <span className="text-xs">{template.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameBuilder;