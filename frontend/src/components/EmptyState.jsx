export default function EmptyState({ image, emoji = '🐱', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-8 text-center animate-fade-up">
      {image
        ? <div className="relative mb-6">
            <img src={image} alt="" className="w-40 h-40 rounded-3xl object-cover shadow-image mx-auto" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-card flex items-center justify-center text-2xl animate-float">
              {emoji}
            </div>
          </div>
        : <div className="text-6xl mb-5 animate-float">{emoji}</div>
      }
      <h3 className="font-display text-2xl text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  )
}
