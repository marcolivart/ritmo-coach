import type { LucideIcon } from "lucide-react";

export interface WidgetDatum {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "green" | "lime" | "ink" | "orange";
}

export default function WidgetRow({ widgets }: { widgets: WidgetDatum[] }) {
  return (
    <div className="widget-row">
      {widgets.map((widget) => {
        const Icon = widget.icon;
        return (
          <div key={widget.label} className={`widget-card widget-${widget.tone}`}>
            <Icon size={18} />
            <div className="widget-value">{widget.value}</div>
            <div className="widget-label">{widget.label}</div>
          </div>
        );
      })}
    </div>
  );
}
