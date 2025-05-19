import React, { useEffect, useState, useMemo } from "react";
import Commands from "./Commands";
import SaveChanges from "../SaveChanges";
import ReactionRolesNew from "./ReactionRolesNew";
import { useSpinDelay } from "spin-delay";
import Loader from "@/components/loader";
import { capitlize, cn } from "@/lib/utils";

export const modules = {
  commands: <Commands />,
  "reaction-roles": <ReactionRolesNew />,
};

// this cant really be type safe ;-;
export type ModuleProvider = {
  comparsionValues?: any[][]; // literally any
  initalData: any;
  extendedSaveChanges?: (updatedData: any) => void;
  extendedResetChanges?: () => void;
  title: string;
  description?: string;
};

export function ModuleProvider(props: ModuleProvider) {
  const [savedData, setSavedData] = useState(() => props.initalData);
  const [updatedData, setUpdatedData] = useState(() => props.initalData);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (props.initalData !== undefined) {
      setSavedData(props.initalData);
      setUpdatedData(props.initalData);
    }
  }, [props.initalData]);

  const comparisonArray = useMemo(() => {
    const result = props.comparsionValues
      ? [...props.comparsionValues.flat()]
      : [];
    return result;
  }, [props.comparsionValues]);

  useEffect(() => {
    let changesDetected = false;

    if (props.comparsionValues) {
      for (let i = 0; i < props.comparsionValues.length; i++) {
        const [first, second] = props.comparsionValues[i];
        if (first !== second) {
          changesDetected = true;
          break;
        }
      }
    }

    if (!changesDetected && savedData !== updatedData) {
      try {
        changesDetected =
          JSON.stringify(savedData) !== JSON.stringify(updatedData);
      } catch (e) {
        changesDetected = true;
      }
    }

    setHasChanges(changesDetected);
  }, [savedData, updatedData, ...comparisonArray]);

  const resetChanges = () => {
    setUpdatedData(savedData);
    if (props.extendedResetChanges) props.extendedResetChanges();
    setHasChanges(false);
  };

  const saveChanges = () => {
    setSavedData(updatedData);
    if (props.extendedSaveChanges) props.extendedSaveChanges(updatedData);
    setHasChanges(false);
  };

  const Component = React.memo(
    ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => {
      const showSpinner = useSpinDelay(!updatedData, { delay: 3500 });

      if (showSpinner || updatedData === undefined) return <Loader />;

      return (
        <div
          className={cn(
            "mx-[2rem] w-full h-[95%] my-[2.25rem] flex flex-col gap-3"
          )}
        >
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-2xl">{capitlize(props.title)}</h1>
            <p className="opacity-60 text-sm">{props.description}</p>
          </div>
          <div className={cn("w-full h-full", className)}>{children}</div>
          <SaveChanges
            hasChanges={hasChanges}
            resetChanges={resetChanges}
            saveChanges={saveChanges}
          />
        </div>
      );
    }
  );

  Component.displayName = `ModuleProviderComponent_${props.title}`;

  return { Component };
}
