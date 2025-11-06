import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

export function InstallPromptBanner() {
  const { installPrompt, promptInstall, isInstalled } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('install-prompt-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  const handleInstall = async () => {
    await promptInstall();
    setDismissed(true);
  };

  // Don't show if already installed, no prompt available, or dismissed
  if (isInstalled || !installPrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary-200 bg-primary-50 p-4 shadow-lg md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-lg md:border">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-full bg-primary-600 p-2 text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">Install Travel Management</h3>
          <p className="mt-1 text-xs text-slate-600">
            Add to your home screen for quick access and offline functionality
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              className="rounded-md bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-md border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Not Now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
