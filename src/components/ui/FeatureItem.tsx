import type { ReactNode } from "react";

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="text-pink-500 shrink-0 [&>svg]:size-[26px]">
        {icon}
      </span>
      <div className="leading-tight">
        <h3 className="font-bold text-[14px] text-ink-900 m-0">{title}</h3>
        <p className="text-[12.5px] text-ink-500 m-0 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
