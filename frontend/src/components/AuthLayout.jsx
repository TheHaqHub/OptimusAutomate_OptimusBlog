export default function AuthLayout({ tagline, children }) {
  return (
    <div className="min-h-[calc(100vh-65px)] grid lg:grid-cols-2 bg-bg">
      {/* Left: brand side - typography only, no illustration, per project UI rules */}
      <div className="hidden lg:flex flex-col justify-between bg-card px-12 py-12 border-r border-border">
        <span className="font-display text-2xl text-text">OptimusBlog</span>

        <div>
          <p className="font-heading font-bold text-text text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.15] max-w-md">
            {tagline}
          </p>
        </div>

        <p className="text-sm text-muted">
          A space for writing, reading, and conversation.
        </p>
      </div>

      {/* Right: form side */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[380px]">
          {/* Mobile-only brand mark, since the left panel is hidden below lg */}
          <span className="font-display text-xl text-text lg:hidden block mb-8">
            OptimusBlog
          </span>
          {children}
        </div>
      </div>
    </div>
  );
}