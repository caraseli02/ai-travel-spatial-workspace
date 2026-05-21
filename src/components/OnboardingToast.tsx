import { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';

export default function OnboardingToast() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to your Kyoto canvas',
      body: 'Everything from your inbox has been organized spatially. Cards are grouped by day.',
      icon: '🗾',
    },
    {
      title: 'Pan & zoom freely',
      body: 'Click and drag the canvas to explore. Use the zoom controls or scroll to zoom in.',
      icon: '🖱️',
    },
    {
      title: 'Cards connect automatically',
      body: 'Dashed lines show related items. Hover any card to see it lift off the canvas.',
      icon: '✨',
    },
  ];

  useEffect(() => {
    const completed = localStorage.getItem('wayfarer_onboarding_completed') === 'true';
    if (!completed) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const current = steps[step];

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem('wayfarer_onboarding_completed', 'true');
  };

  return (
    <div
      className="absolute bottom-28 right-4 z-30 w-72 rounded-xl transition-all duration-300"
      style={{
        backgroundColor: '#fefcf8',
        border: '1px solid #e7e3dc',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2"
        style={{ borderBottom: '1px solid #f5f3ef' }}>
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#92400e' }}>
          <Sparkles size={11} />
          Quick tip {step + 1}/{steps.length}
        </div>
        <button
          onClick={handleClose}
          className="text-stone-300 hover:text-stone-500 transition-colors"
          aria-label="Close onboarding tips"
        >
          <X size={13} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">{current.icon}</span>
          <div>
            <p className="font-semibold text-stone-800 text-sm mb-1">{current.title}</p>
            <p className="text-xs text-stone-500 leading-relaxed">{current.body}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 pb-3">
        {/* Dots */}
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ backgroundColor: i === step ? '#92400e' : '#e7e3dc' }} />
          ))}
        </div>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: '#92400e' }}
            aria-label="Next tip"
          >
            Next <ChevronRight size={11} />
          </button>
        ) : (
          <button
            onClick={handleClose}
            className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all"
            style={{ backgroundColor: '#92400e', color: 'white' }}
            aria-label="Acknowledge and close onboarding tips"
          >
            Got it!
          </button>
        )}
      </div>
    </div>
  );
}
