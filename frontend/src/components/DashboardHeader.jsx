{/* RIGHT SIDE */}
<div className="flex items-center gap-3">

  {/* Email + Sound — alerts page only */}
  {isAlertsPage && (
    <>
      {/* Email */}
      <div
        onClick={() => setShowEmail(true)}
        className="p-2 rounded-md cursor-pointer flex items-center justify-center group hover:bg-green-50 transition"
      >
        <svg
          className="w-6 h-6 text-gray-700 group-hover:text-green-600 transition-colors duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>

      {/* Sound */}
      <div
        onClick={onSoundClick}
        className="p-2 rounded-md cursor-pointer flex items-center justify-center group hover:bg-green-50 transition"
      >
        <svg
          className="w-6 h-6 text-gray-700 group-hover:text-green-600 transition-colors duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      </div>

      {/* MODAL */}
      {showEmail && (
        <EmailModal
          isOpen={showEmail}
          onClose={() => setShowEmail(false)}
          onSave={() => {
            setShowEmail(false);
            showToast("Email preferences saved!");
          }}
        />
      )}
    </>
  )}

  {/* Bell */}
  <div className="relative flex items-center justify-center">
    <Bell className="w-6 h-6 text-gray-700" />

    {criticalAlerts > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
        {criticalAlerts}
      </span>
    )}
  </div>

</div>