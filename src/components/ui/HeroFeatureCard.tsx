export function HeroFeatureCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-[18px] pl-3 pr-7 py-3 shadow-md min-w-[168px]">
      <span className="grid place-items-center size-9 rounded-xl bg-pink-50 text-pink-500 shrink-0 [&>svg]:size-[18px] border border-pink-100">
        {icon}
      </span>
      <div className="leading-tight">
        <p className="font-bold text-[13.5px] text-ink-900 m-0">{title}</p>
        <p className="text-[12.5px] text-ink-400 m-0">{subtitle}</p>
      </div>
    </div>
  );
}
