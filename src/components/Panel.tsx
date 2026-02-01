import React from "react";
import Switch from "@/components/Switch";

export enum FeatureType {
  SWITCH = "switch",
  INPUT = "input",
}

interface FeatureBase<T> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  label?: string;
  child?: React.ReactNode;
}

interface SwitchType extends FeatureBase<boolean> {
  type: FeatureType.SWITCH;
  options?: { color?: string };
}

interface InputType extends FeatureBase<string> {
  type: FeatureType.INPUT;
}

type Feature = SwitchType | InputType;

interface PanelProps {
  features: Feature[];
}

const Panel = ({ features }: PanelProps) => {
  const featureComponent = (feature: Feature) => {
    switch (feature.type) {
      case FeatureType.SWITCH: {
        return (
          <Switch
            name={feature.name}
            checked={feature.value}
            onChange={() => feature.onChange(!feature.value)}
            trackColor={(feature.options as any)?.color}
          >
            <div className="flex items-center">{feature.child}</div>
          </Switch>
        );
      }
      case FeatureType.INPUT: {
        return <div className="flex-1">{feature.child}</div>;
      }
    }
  };
  return (
    <div className="w-full portrait:w-4/5">
      <div className="bg-star-100 md:mx-0.5 border-2 border-ocean-700 px-2 py-1 md:p-3 flex flex-col gap-1 ">
        {features.map((feature) => (
          <div key={feature.name} className="flex gap-1">
            {feature.label && (
              <div className="min-w-12 md:min-w-20 text-left">
                {feature.label ?? ""}
              </div>
            )}
            {featureComponent(feature)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Panel;
