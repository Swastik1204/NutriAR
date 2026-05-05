function getInitials(user, profile) {
  const source = profile?.name || user?.displayName || user?.email || 'C';
  return String(source)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
}

export default function TopNavbar({ user, profile, onProfileClick, onSettingsClick }) {
  const initials = getInitials(user, profile);

  return (
    <header className="fixed left-0 top-0 z-20 w-full bg-background/90 backdrop-blur-md border-b border-primary/10 shadow-terra">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Leading avatar */}
        <button
          id="nav-profile"
          type="button"
          className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-container-high transition-all hover:ring-2 hover:ring-primary/20"
          onClick={onProfileClick}
          aria-label="Open profile"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user?.displayName || 'Profile'}
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="material-symbols-outlined text-primary text-xl">person</span>
          )}
        </button>

        {/* Brand */}
        <h1
          className="font-headline text-xl font-bold text-primary tracking-tight cursor-pointer"
          onClick={onProfileClick}
        >
          NutriAR
        </h1>

        {/* Settings */}
        <button
          id="nav-settings"
          type="button"
          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full transition-colors active:scale-95"
          onClick={onSettingsClick}
          aria-label="Open settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
}
