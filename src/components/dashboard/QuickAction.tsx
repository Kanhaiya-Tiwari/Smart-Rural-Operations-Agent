import { LucideIcon } from "lucide-react";

interface QuickActionProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

const QuickAction = ({ label, icon: Icon, onClick }: QuickActionProps) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-accent hover:bg-primary hover:text-primary-foreground transition-colors group"
  >
    <Icon className="w-6 h-6 text-accent-foreground group-hover:text-primary-foreground" />
    <span className="text-xs font-medium text-accent-foreground group-hover:text-primary-foreground text-center leading-tight">
      {label}
    </span>
  </button>
);

export default QuickAction;
