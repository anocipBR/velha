import React, { useState, useEffect } from 'react';
import { RefreshCw, Info, X as XIcon, Circle, AlertCircle } from 'lucide-react';

const App = () => {
  // Estado do jogo
  // history: Array de objetos { index: number, player: 'X' | 'O' }
  const [history, setHistory] = useState([]);
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [winningLine, setWinningLine] = useState([]);

  const currentPlayer = xIsNext ? 'X' : 'O';

  // Configuração das linhas de vitória
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
  ];

  // Verifica vencedor
  useEffect(() => {
    const checkWinner = () => {
      // Reconstruir o tabuleiro atual baseado no histórico
      const board = Array(9).fill(null);
      history.forEach(move => {
        board[move.index] = move.player;
      });

      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          setWinner(board[a]);
          setWinningLine([a, b, c]);
          return;
        }
      }
      setWinner(null);
      setWinningLine([]);
    };

    checkWinner();
  }, [history]);

  // Manipulador de clique na célula
  const handleClick = (i) => {
    // Se já houver vencedor ou a célula estiver ocupada, ignora
    const isOccupied = history.some(m => m.index === i);
    if (winner || isOccupied) return;

    let newHistory = [...history];
    const playerMoves = newHistory.filter(m => m.player === currentPlayer);

    // Lógica Efémera: Se o jogador já tiver 3 peças, remove a mais antiga
    if (playerMoves.length >= 3) {
      const oldestMove = playerMoves[0]; // O primeiro movimento feito é o mais antigo
      newHistory = newHistory.filter(m => m !== oldestMove);
    }

    // Adiciona o novo movimento
    newHistory.push({ index: i, player: currentPlayer });
    
    setHistory(newHistory);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setHistory([]);
    setXIsNext(true);
    setWinner(null);
    setWinningLine([]);
  };

  // Determinar qual peça vai desaparecer no próximo turno do jogador atual
  const getFadingIndex = () => {
    if (winner) return null;
    const moves = history.filter(m => m.player === currentPlayer);
    if (moves.length === 3) {
      return moves[0].index;
    }
    return null;
  };

  const fadingIndex = getFadingIndex();

  // Renderiza uma célula individual
  const renderSquare = (i) => {
    const move = history.find(m => m.index === i);
    const value = move ? move.player : null;
    const isWinningSquare = winningLine.includes(i);
    const isFading = i === fadingIndex;
    
    // Determinar a ordem da peça (1, 2 ou 3) para mostrar pequenos indicadores (opcional, mas útil)
    // Para simplificar a UI, vamos usar apenas o isFading para destaque crítico

    let cellContent = null;
    if (value === 'X') {
      cellContent = <XIcon size={48} className={isWinningSquare ? "text-white" : "text-cyan-400"} strokeWidth={2.5} />;
    } else if (value === 'O') {
      cellContent = <Circle size={40} className={isWinningSquare ? "text-white" : "text-rose-400"} strokeWidth={3} />;
    } else if (isFading === false && !winner && !value) {
        // Hover placeholder fantasma
        cellContent = (
            <div className="opacity-0 group-hover:opacity-20 transition-opacity">
                {xIsNext ? <XIcon size={32} /> : <Circle size={32} />}
            </div>
        )
    }

    // Estilos base
    const baseClasses = "h-24 w-24 sm:h-32 sm:w-32 rounded-xl flex items-center justify-center text-3xl transition-all duration-300 shadow-sm relative group";
    
    // Estilos condicionais
    let statusClasses = "bg-slate-800 hover:bg-slate-750 cursor-pointer border-b-4 border-slate-900 active:border-b-0 active:translate-y-1";
    
    if (isWinningSquare) {
      statusClasses = "bg-emerald-500 border-emerald-700 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10";
    } else if (isFading) {
      statusClasses = "bg-slate-800/50 border-red-500/50 border-2 opacity-60";
    } else if (value) {
      statusClasses = "bg-slate-800 border-b-4 border-slate-950";
    }

    return (
      <button
        className={`${baseClasses} ${statusClasses}`}
        onClick={() => handleClick(i)}
        disabled={!!winner || (!!value)}
      >
        {cellContent}
        
        {/* Indicador de "A desaparecer" */}
        {isFading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30">
      
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-rose-400 bg-clip-text text-transparent mb-2">
          Tic-Tac-Toe Efémero
        </h1>
        <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
          <span className="px-2 py-0.5 bg-slate-800 rounded text-xs font-mono">MODO INFINITO</span>
          <span>Máximo de 3 peças por jogador</span>
        </p>
      </div>

      {/* Área de Status */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 px-2">
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${currentPlayer === 'X' && !winner ? 'bg-cyan-950/50 ring-1 ring-cyan-500/50' : 'opacity-50'}`}>
          <XIcon size={24} className="text-cyan-400" />
          <span className="font-bold">JOGADOR X</span>
        </div>
        
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${currentPlayer === 'O' && !winner ? 'bg-rose-950/50 ring-1 ring-rose-500/50' : 'opacity-50'}`}>
          <span className="font-bold">JOGADOR O</span>
          <Circle size={20} className="text-rose-400" />
        </div>
      </div>

      {/* Mensagem de Vencedor */}
      {winner && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in zoom-in duration-300">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl text-center min-w-[300px]">
            <h2 className="text-2xl font-bold mb-2">Vitória!</h2>
            <div className="text-5xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-rose-400 bg-clip-text text-transparent">
              {winner === 'X' ? 'X Venceu' : 'O Venceu'}
            </div>
            <button
              onClick={resetGame}
              className="bg-white text-slate-950 hover:bg-slate-200 font-bold py-3 px-8 rounded-full transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={20} />
              Jogar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Tabuleiro */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 bg-slate-900 rounded-2xl shadow-xl border border-slate-800">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i}>{renderSquare(i)}</div>
        ))}
      </div>

      {/* Rodapé e Botões */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={resetGame}
          className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
          title="Reiniciar Jogo"
        >
          <RefreshCw size={24} />
        </button>
        
        <button
          onClick={() => setShowRules(!showRules)}
          className={`p-3 rounded-full transition-all ${showRules ? 'text-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="Regras"
        >
          <Info size={24} />
        </button>
      </div>

      {/* Modal de Regras */}
      {showRules && (
        <div className="mt-4 max-w-sm bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold">
            <AlertCircle size={16} />
            Como Jogar
          </div>
          <ul className="space-y-2 text-slate-300 list-disc list-inside">
            <li>Cada jogador tem apenas <strong>3 peças</strong> disponíveis.</li>
            <li>Quando colocas a tua <strong>4.ª peça</strong>, a tua <strong>1.ª peça desaparece</strong>.</li>
            <li>A peça que vai desaparecer fica marcada a vermelho/transparente.</li>
            <li>Vence quem alinhar 3 peças (horizontal, vertical ou diagonal).</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;