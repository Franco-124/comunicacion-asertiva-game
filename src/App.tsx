import { useState } from 'react'
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Award,
  History,
  Trash2,
  Briefcase,
  GraduationCap,
  Users,
  Heart,
  ShoppingCart,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Trophy
} from 'lucide-react'
import { CHALLENGES, type Challenge } from './data/challenges'


// Interface definitions
interface EvaluationResult {
  communication_style: string;
  empathy_score: number;
  respect_score: number;
  clarity_score: number;
  assertiveness_subscore: number;
  assertiveness_score: number;
  issues: string[];
  improved_message: string;
  explanation: string;
}

interface GameHistoryItem {
  id: string;
  challenge: Challenge;
  user_rewrite: string;
  result: EvaluationResult;
  timestamp: number;
}

function App() {
  // Helper to load random challenge
  const getRandomChallenge = (excludeId?: number): Challenge => {
    let available = CHALLENGES;
    if (excludeId !== undefined && CHALLENGES.length > 1) {
      available = CHALLENGES.filter(c => c.id !== excludeId);
    }
    const idx = Math.floor(Math.random() * available.length);
    return available[idx];
  };

  // State Management
  const [currentChallenge, setCurrentChallenge] = useState<Challenge>(() => getRandomChallenge())
  const [userRewrite, setUserRewrite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [copied, setCopied] = useState(false)

  // Lazy load stats and history
  const [history, setHistory] = useState<GameHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('assertive_game_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('assertive_game_stats');
      return saved ? JSON.parse(saved) : { challenges_completed: 0, total_score: 0 };
    } catch {
      return { challenges_completed: 0, total_score: 0 };
    }
  });

  const CHARACTER_LIMIT = 1500;

  // Change challenge
  const handleNextChallenge = () => {
    const next = getRandomChallenge(currentChallenge.id);
    setCurrentChallenge(next);
    setUserRewrite('');
    setError(null);
    setResult(null);
  };

  // Evaluate message
  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedRewrite = userRewrite.trim();
    if (!trimmedRewrite) {
      setError('Por favor, escribe tu versión optimizada antes de enviar.');
      return;
    }

    if (trimmedRewrite.length > CHARACTER_LIMIT) {
      setError(`Tu mensaje excede el límite máximo de ${CHARACTER_LIMIT} caracteres.`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/improve-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_message: currentChallenge.original,
          user_rewrite: trimmedRewrite,
          context: currentChallenge.context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Algo salió mal. Por favor, intenta de nuevo.');
      }

      setResult(data);

      // Save game stats
      const newStats = {
        challenges_completed: stats.challenges_completed + 1,
        total_score: stats.total_score + data.assertiveness_score
      };
      setStats(newStats);
      localStorage.setItem('assertive_game_stats', JSON.stringify(newStats));

      // Save history
      const newHistoryItem: GameHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        challenge: currentChallenge,
        user_rewrite: trimmedRewrite,
        result: data,
        timestamp: Date.now()
      };
      const updatedHistory = [newHistoryItem, ...history.slice(0, 19)];
      setHistory(updatedHistory);
      localStorage.setItem('assertive_game_history', JSON.stringify(updatedHistory));

    } catch (err: unknown) {
      console.error('Error in evaluation:', err);
      const errMsg = err instanceof Error ? err.message : 'Error de conexión. Revisa tu configuración de OpenAI o intenta de nuevo.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Copy improved message
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Clear session history
  const handleClearHistory = () => {
    setHistory([]);
    const clearedStats = { challenges_completed: 0, total_score: 0 };
    setStats(clearedStats);
    try {
      localStorage.removeItem('assertive_game_history');
      localStorage.removeItem('assertive_game_stats');
    } catch (e) {
      console.error(e);
    }
  };

  // Score badge translator
  const getMotivationalBadge = (score: number) => {
    if (score >= 76) {
      return {
        name: 'Maestro de la Asertividad 🏆',
        desc: '¡Excelente! Lograste expresar la idea con empatía, claridad y manteniendo límites sanos y respetuosos.',
        wrapperClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100',
        iconClass: 'from-emerald-400 to-teal-400 text-slate-950',
        titleClass: 'text-emerald-400'
      };
    }
    if (score >= 51) {
      return {
        name: 'Comunicador Confidente 💪',
        desc: 'Buen trabajo. Expresaste el mensaje con respeto, aunque puedes afilar tu claridad y asertividad.',
        wrapperClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-100',
        iconClass: 'from-cyan-400 to-blue-400 text-slate-950',
        titleClass: 'text-cyan-400'
      };
    }
    if (score >= 26) {
      return {
        name: 'Comunicador en Desarrollo 🌱',
        desc: 'Vas por buen camino. Sin embargo, tu respuesta aún retiene rasgos acusatorios o pasivos.',
        wrapperClass: 'bg-amber-500/10 border-amber-500/20 text-amber-100',
        iconClass: 'from-amber-400 to-orange-400 text-slate-950',
        titleClass: 'text-amber-400'
      };
    }
    return {
      name: 'Explorador de la Comunicación 🔍',
      desc: 'Sigue practicando. El mensaje reescrito aún suena agresivo, pasivo o carece de una propuesta empática.',
      wrapperClass: 'bg-rose-500/10 border-rose-500/20 text-rose-100',
      iconClass: 'from-rose-400 to-orange-400 text-slate-950',
      titleClass: 'text-rose-400'
    };
  };

  // Context translation icons
  const getContextIcon = (ctx: string) => {
    switch (ctx.toLowerCase()) {
      case 'trabajo':
        return <Briefcase className="w-4 h-4 text-sky-400" />;
      case 'universidad':
      case 'university':
        return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      case 'familia':
      case 'family':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'amigos':
      case 'friends':
        return <Users className="w-4 h-4 text-teal-400" />;
      case 'servicio al cliente':
      case 'customer service':
        return <ShoppingCart className="w-4 h-4 text-amber-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  // Score progress bar color mapping
  const getScoreColor = (score: number) => {
    if (score >= 76) return 'bg-emerald-500';
    if (score >= 51) return 'bg-cyan-500';
    if (score >= 26) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // Style badge mapping
  const getStyleTheme = (style: string) => {
    switch (style.toLowerCase()) {
      case 'assertive':
      case 'asertivo':
        return { name: 'Asertivo', class: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
      case 'passive':
      case 'pasivo':
        return { name: 'Pasivo', class: 'bg-sky-500/10 border-sky-500/30 text-sky-400' };
      case 'aggressive':
      case 'agresivo':
        return { name: 'Agresivo', class: 'bg-rose-500/10 border-rose-500/30 text-rose-400' };
      case 'passive-aggressive':
      case 'pasivo-agresivo':
      default:
        return { name: 'Pasivo-Agresivo', class: 'bg-amber-500/10 border-amber-500/30 text-amber-400' };
    }
  };

  const avgScore = stats.challenges_completed > 0 ? Math.round(stats.total_score / stats.challenges_completed) : 0;
  const currentBadge = result ? getMotivationalBadge(result.assertiveness_score) : null;

  return (
    <div className="flex flex-col min-h-screen text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Trophy className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                Message Transformer ⚡
              </span>
            </div>
          </div>
          
          {/* Game Stats badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-900/60 py-1.5 px-3 rounded-full border border-slate-800">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Retos: <strong className="text-white">{stats.challenges_completed}</strong></span>
            </div>
            {stats.challenges_completed > 0 && (
              <div className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-900/60 py-1.5 px-3 rounded-full border border-slate-800">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span>Puntaje Promedio: <strong className="text-white">{avgScore}</strong></span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3 animate-fade-in">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-900/30">
            Juego de Entrenamiento Asertivo
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mt-2">
            Transformador de Mensajes
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            El coach te dará un mensaje mal redactado (agresivo, pasivo o hiriente). Escribe tu versión asertiva, empática y clara, ¡y deja que la Inteligencia Artificial evalúe tu nivel!
          </p>
        </div>

        {/* Layout: Input vs Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Challenge Card */}
          <div className="lg:col-span-7 space-y-6 animate-fade-in-up">
            <div className="glass-panel rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  Reto Actual
                </h2>
                <div className="flex gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/40 border border-indigo-900/40 text-indigo-300 font-bold flex items-center gap-1">
                    {getContextIcon(currentChallenge.context)}
                    {currentChallenge.context}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-medium">
                    Dificultad: {currentChallenge.difficulty}
                  </span>
                </div>
              </div>

              {/* Situation & Poor Message Box */}
              <div className="space-y-4 mb-6">
                <div className="p-3.5 bg-slate-900/30 border border-slate-850 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                    Situación o Escenario:
                  </span>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    {currentChallenge.situation}
                  </p>
                </div>

                <div className="p-5 bg-rose-950/15 border border-rose-500/15 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl"></div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase block tracking-wider">
                    Mensaje Original (Mal Redactado):
                  </span>
                  <p className="text-base md:text-lg font-black text-rose-100 italic mt-2 leading-relaxed">
                    "{currentChallenge.original}"
                  </p>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleEvaluate} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="rewrite-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Tu versión optimizada (asertiva y respetuosa)
                  </label>
                  <div className="relative">
                    <textarea
                      id="rewrite-input"
                      className="w-full h-36 bg-slate-950/60 rounded-2xl p-4 border border-slate-800 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-slate-650 text-slate-200 resize-none text-sm md:text-base leading-relaxed"
                      placeholder="Escribe aquí tu versión mejorada para convencer al coach..."
                      value={userRewrite}
                      onChange={(e) => {
                        setUserRewrite(e.target.value);
                        if (error) setError(null);
                      }}
                      maxLength={CHARACTER_LIMIT}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                      {userRewrite.length} / {CHARACTER_LIMIT}
                    </div>
                  </div>
                </div>

                {/* Submit and change buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    id="evaluate-button"
                    type="submit"
                    disabled={loading || !userRewrite.trim()}
                    className="flex-grow bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-900 disabled:to-slate-900 disabled:border-slate-800 disabled:text-slate-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-950/40 hover:shadow-indigo-950/60 flex items-center justify-center space-x-2 border border-indigo-400/20 disabled:border-none disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin"></div>
                        <span>Evaluando con IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4.5 h-4.5" />
                        <span>Evaluar mi Respuesta</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleNextChallenge}
                    disabled={loading}
                    className="sm:w-44 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:border-slate-900 text-slate-300 hover:text-white disabled:text-slate-600 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? '' : 'group-hover:rotate-45 transition-transform'}`} />
                    <span>Otro Mensaje</span>
                  </button>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start space-x-2 text-rose-400 text-xs md:text-sm animate-scale-in">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Panel: Results & Feedback */}
          <div className="lg:col-span-5 animate-fade-in-up">
            
            {/* Empty state */}
            {!result && !loading && (
              <div className="glass-panel rounded-3xl p-8 text-center border border-slate-850 h-[450px] flex flex-col items-center justify-center space-y-4 text-slate-400">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800/80 text-slate-500">
                  <Trophy className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">
                    Evaluación del Coach
                  </h3>
                  <p className="text-sm max-w-sm mx-auto leading-relaxed">
                    Escribe tu versión del mensaje a la izquierda y presiona <strong>Evaluar mi Respuesta</strong>. La IA te dará notas detalladas de Empatía, Respeto, Claridad y Asertividad.
                  </p>
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 h-[450px] flex flex-col justify-between animate-pulse">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-36 bg-slate-800 rounded-lg"></div>
                    <div className="h-6 w-20 bg-slate-800 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-800 rounded"></div>
                    <div className="h-2 w-5/6 bg-slate-800 rounded"></div>
                    <div className="h-2 w-2/3 bg-slate-800 rounded"></div>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-850 space-y-3">
                  <div className="h-4 w-40 bg-slate-800 rounded-lg"></div>
                  <div className="h-3 w-full bg-slate-800 rounded"></div>
                  <div className="h-3 w-5/6 bg-slate-800 rounded"></div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-800 rounded"></div>
                  <div className="h-2 w-4/5 bg-slate-800 rounded"></div>
                </div>
              </div>
            )}

            {/* Results output */}
            {result && currentBadge && !loading && (
              <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl animate-scale-in space-y-5">
                
                {/* Header score block */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Estilo de tu Respuesta
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${getStyleTheme(result.communication_style).class}`}>
                        {getStyleTheme(result.communication_style).name}
                      </span>
                    </div>
                  </div>

                  <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-slate-950 border border-slate-900 shadow-inner">
                    <div className="text-center">
                      <span className="text-xl font-black text-white">{result.assertiveness_score}</span>
                      <span className="text-[9px] text-slate-500 block -mt-1">/100</span>
                    </div>
                  </div>
                </div>

                {/* Subscores Grid */}
                <div className="space-y-2.5 bg-slate-900/40 p-4 rounded-2xl border border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Puntuación por Criterios
                  </span>
                  
                  {/* Empathy */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Empatía</span>
                      <span className="text-white font-bold">{result.empathy_score}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getScoreColor(result.empathy_score)}`} style={{ width: `${result.empathy_score}%` }}></div>
                    </div>
                  </div>

                  {/* Respect */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Respeto</span>
                      <span className="text-white font-bold">{result.respect_score}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getScoreColor(result.respect_score)}`} style={{ width: `${result.respect_score}%` }}></div>
                    </div>
                  </div>

                  {/* Clarity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Claridad</span>
                      <span className="text-white font-bold">{result.clarity_score}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getScoreColor(result.clarity_score)}`} style={{ width: `${result.clarity_score}%` }}></div>
                    </div>
                  </div>

                  {/* Assertiveness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Asertividad</span>
                      <span className="text-white font-bold">{result.assertiveness_subscore}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getScoreColor(result.assertiveness_subscore)}`} style={{ width: `${result.assertiveness_subscore}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Score badge details */}
                <div className={`p-4 rounded-2xl border ${currentBadge.wrapperClass} flex items-start space-x-3 shadow-inner`}>
                  <div className={`p-2 bg-gradient-to-br ${currentBadge.iconClass} rounded-xl shadow-md flex-shrink-0 mt-0.5`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Insignia Obtenida
                    </span>
                    <h4 className={`text-base font-extrabold ${currentBadge.titleClass}`}>
                      {currentBadge.name}
                    </h4>
                    <p className="text-xs text-slate-350 mt-1 leading-relaxed">
                      {currentBadge.desc}
                    </p>
                  </div>
                </div>

                {/* Details list scrollable */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  
                  {/* Feedback Explanation */}
                  <div className="space-y-1.5 bg-slate-900/60 p-4 rounded-2xl border border-slate-850">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Evaluación del Coach
                    </span>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>

                  {/* Issues */}
                  {result.issues && result.issues.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                        Detalles a mejorar
                      </span>
                      <ul className="space-y-1">
                        {result.issues.map((issue, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0"></span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Suggestion */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                        Sugerencia Óptima del Coach
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.improved_message)}
                        className={`flex items-center space-x-1.5 text-xs font-semibold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          copied
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/15 text-indigo-200 rounded-xl text-xs md:text-sm italic leading-relaxed select-all">
                      "{result.improved_message}"
                    </div>
                  </div>

                </div>

                {/* Footer buttons */}
                <div className="pt-3 border-t border-slate-850 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-500">Evaluado en tiempo real</span>
                  <button
                    onClick={handleNextChallenge}
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Siguiente Reto</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* History Log Section */}
        {history.length > 0 && (
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl mt-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                Bitácora de Entrenamiento ({history.length})
              </h3>
              <button
                onClick={handleClearHistory}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reiniciar Estadísticas</span>
              </button>
            </div>
            
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
              {history.map((item) => {
                const badge = getMotivationalBadge(item.result.assertiveness_score);
                const theme = getStyleTheme(item.result.communication_style);
                return (
                  <div key={item.id} className="p-4 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-850 hover:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                    <div className="space-y-1 min-w-0 flex-grow">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${theme.class}`}>
                          {theme.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-850 text-slate-400 font-medium flex items-center gap-1">
                          {getContextIcon(item.challenge.context)}
                          {item.challenge.context}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="text-xs text-rose-300 truncate w-full italic">
                        Original: "{item.challenge.original}"
                      </p>
                      <p className="text-xs text-slate-400 truncate w-full">
                        Tu reescritura: "{item.user_rewrite}"
                      </p>
                      <p className="text-xs text-indigo-300 font-medium truncate w-full">
                        Sugerido: "{item.result.improved_message}"
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
                      <div className="text-right">
                        <span className="text-xs font-bold text-white block">
                          Puntuación: {item.result.assertiveness_score}
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          {badge.name.split(' ')[0]} {badge.name.split(' ')[1] || ''}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.result.improved_message)}
                        className="p-1.5 bg-slate-950 hover:bg-indigo-950/20 border border-slate-850 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Copiar mensaje sugerido"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentChallenge(item.challenge);
                          setUserRewrite(item.user_rewrite);
                          setResult(item.result);
                          setError(null);
                        }}
                        className="p-1.5 bg-slate-950 hover:bg-indigo-950/20 border border-slate-850 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Ver detalle del reporte"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-500 text-xs">
            <span>© 2026 Message Transformer Asertivo.</span>
            <span>•</span>
            <span>Entrenando el diálogo respetuoso y claro.</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-500 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-850">4 Categorías de Notas</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-850">50 Retos Integrados</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-850">IA en Vivo</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
