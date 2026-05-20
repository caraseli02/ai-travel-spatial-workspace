import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Explorer',
    price: 'Free',
    period: '',
    desc: 'Perfect for solo travelers with one upcoming trip.',
    features: [
      '1 active trip canvas',
      'Up to 50 cards',
      'AI inbox processing (20/mo)',
      'Export to PDF',
      'Mobile view',
    ],
    cta: 'Get started free',
    highlighted: false,
    badge: null,
  },
  {
    name: 'Wanderer',
    price: '$9',
    period: '/mo',
    desc: 'For frequent travelers who plan multiple trips at once.',
    features: [
      'Unlimited trip canvases',
      'Unlimited cards',
      'AI inbox (unlimited)',
      'Collaborative planning (3 people)',
      'Export to PDF & Notion',
      'Priority support',
    ],
    cta: 'Start 14-day trial',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    name: 'Nomad',
    price: '$24',
    period: '/mo',
    desc: 'For travel agencies and power users managing group trips.',
    features: [
      'Everything in Wanderer',
      'Unlimited collaborators',
      'Custom branding',
      'API access',
      'Dedicated onboarding',
      'SLA guarantee',
    ],
    cta: 'Contact us',
    highlighted: false,
    badge: null,
  },
];

export default function PricingSection() {
  return (
    <section className="py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Pricing</p>
          <h2 className="font-serif text-4xl text-stone-800 mb-4">Simple, honest pricing.</h2>
          <p className="text-stone-500 max-w-md mx-auto">
            No per-seat pricing tricks. No surprise paywalls.<br />Pay for what you need.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="relative rounded-2xl flex flex-col"
              style={{
                backgroundColor: plan.highlighted ? '#1c1917' : '#fefcf8',
                border: plan.highlighted ? '2px solid #92400e' : '1px solid #e7e3dc',
                padding: '28px',
              }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#92400e', color: 'white' }}>
                    <Sparkles size={10} />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1"
                  style={{ color: plan.highlighted ? '#fef3c7' : '#1c1917' }}>
                  {plan.name}
                </h3>
                <p className="text-xs mb-4" style={{ color: plan.highlighted ? '#78716c' : '#a8a29e' }}>
                  {plan.desc}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold"
                    style={{ color: plan.highlighted ? 'white' : '#1c1917' }}>
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: plan.highlighted ? '#78716c' : '#a8a29e' }}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2.5 text-sm">
                    <Check size={14} className="mt-0.5 flex-shrink-0"
                      style={{ color: plan.highlighted ? '#92400e' : '#10b981' }} />
                    <span style={{ color: plan.highlighted ? '#d6cfc3' : '#57534e' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90"
                style={{
                  backgroundColor: plan.highlighted ? '#92400e' : '#f5f3ef',
                  color: plan.highlighted ? 'white' : '#57534e',
                  border: plan.highlighted ? 'none' : '1px solid #e7e3dc',
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
