const items = [
  { key: 'scan', label: 'Scan', icon: 'photo_camera' },
  { key: 'insights', label: 'Insights', icon: 'leaderboard' },
  { key: 'profile', label: 'Profile', icon: 'person' },
];

export default function BottomDock({ activeView, onChangeView }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex justify-around items-center px-4 pb-6 pt-2 bg-background/90 backdrop-blur-md rounded-t-[24px] border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(46,50,48,0.04)]"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      aria-label="Main navigation"
    >
      {items.map(({ key, label, icon }) => {
        const isActive = activeView === key;
        return (
          <button
            key={key}
            id={`nav-${key}`}
            type="button"
            className={`flex flex-col items-center justify-center px-5 py-2 transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary rounded-2xl transform scale-105'
                : 'text-on-surface-variant hover:text-primary'
            }`}
            onClick={() => onChangeView(key)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
          >
            <span
              className="material-symbols-outlined mb-1 text-[24px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="font-label text-[11px] font-semibold tracking-wide">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
