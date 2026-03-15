const Footer = () => {
  return (
    <footer className="relative mt-auto border-t border-white/[0.06]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="px-6 py-4 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          {/* Left - status indicators */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/30" />
            <div className="w-5 h-5 rounded bg-white/[0.08]" />
            <div className="w-5 h-5 rounded bg-white/[0.06]" />
          </div>

          {/* Right */}
          <p className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
            © 2024 BidRush // Sculpting_Future_Version_2.0
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
