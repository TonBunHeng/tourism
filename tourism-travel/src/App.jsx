import { useState } from 'react'
import { 
  Compass, 
  Sparkles, 
  Server, 
  CheckCircle2, 
  ArrowRight, 
  Code2
} from 'lucide-react'

function App() {
  const [count, setCount] = useState(0)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/travel'
  const aiChatUrl = import.meta.env.VITE_AI_CHAT_URL || 'http://127.0.0.1:8001'

  const features = [
    {
      title: 'React 19 & Vite 8',
      desc: 'Next-gen lightning-fast dev server with instantaneous HMR and modern JSX runtime.',
      badge: 'Core',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'Tailwind CSS v4',
      desc: 'High performance CSS engine using modern @theme tokens and full utility classes.',
      badge: 'Styling',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
    },
    {
      title: 'Docker Ready (:5175)',
      desc: 'Configured Dockerfile and network mapping matching the AngkorVerses docker-compose stack.',
      badge: 'Docker',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    },
    {
      title: 'API & Microservices',
      desc: 'Pre-wired environment variables for Laravel backend API and AI Chatbot endpoints.',
      badge: 'Integrated',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                AngkorVerses
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Travel Client
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Port: 5175
            </div>
            <a
              href="https://github.com/vitejs/vite"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Vite Repository"
            >
              <Code2 className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Fresh React Application Installed</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
              Tourism Travel
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            A brand-new, clean React 19 frontend configured with Tailwind CSS v4, Lucide icons, Docker support, and environment variables ready for building travel experiences.
          </p>

          {/* Interactive Counter Action */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setCount((c) => c + 1)}
              className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
              <span>Interactive Count: <strong className="ml-1 font-bold">{count}</strong></span>
            </button>

            <a
              href="#environment-info"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-800 shadow-sm transition"
            >
              <span>View Config</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Environment & Stack Inspector */}
        <div id="environment-info" className="p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 text-slate-900 dark:text-white font-semibold">
            <Server className="w-5 h-5 text-indigo-500" />
            <h3>Environment & Endpoints Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Backend API Target</div>
              <div className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
                {apiUrl}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">AI Chatbot Microservice</div>
              <div className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all">
                {aiChatUrl}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40">
        <p>Ready to start building components in <code className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">src/</code></p>
      </footer>
    </div>
  )
}

export default App
