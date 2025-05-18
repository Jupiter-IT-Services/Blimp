import React, { useEffect, useState } from "react";
import Commands from "./Commands";
import ReactionRoles from "./ReactionRoles";
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
  const [savedData, setSavedData] = useState(props.initalData);
  const [updatedData, setUpdatedData] = useState(props.initalData);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (props.initalData) {
      setSavedData(props.initalData);
      setUpdatedData(props.initalData);
    }
  }, [props.initalData]);

  const a = props.comparsionValues ? [...props.comparsionValues.flat()] : [];
  a.push(savedData, updatedData);

  useEffect(() => {
    let changesDetected = false;

    if (props.comparsionValues) {
      for (let i = 0; i < props.comparsionValues.length; i++) {
        const [first, second] = props.comparsionValues[i];
        if (first !== second) {
          changesDetected = true;
        }
      }
    }

    if (JSON.stringify(savedData) !== JSON.stringify(updatedData)) {
      changesDetected = true;
    }

    setHasChanges(changesDetected);
  }, [...a]);

  const resetChanges = () => {
    setUpdatedData(savedData);
    setHasChanges(false);
  };

  const saveChanges = () => {
    setSavedData(updatedData);
    setHasChanges(false);
  };

  return {
    Component: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => {
      const showSpinner = useSpinDelay(!updatedData, { delay: 3500 });
      if (showSpinner || !updatedData) return <Loader />;

      return (
        <div
          className={cn(
            "mx-[2rem]  w-full h-[95%] my-[2.25rem] flex flex-col gap-3"
          )}
        >
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-2xl">{capitlize(props.title)}</h1>
            <p className="opacity-60 text-sm">{props.description}</p>
          </div>
          <div className={cn("w-full h-full", className)}>{children}</div>
          <SaveChanges
            hasChanges={hasChanges}
            resetChanges={() => {
              resetChanges();
              if (props.extendedResetChanges) props.extendedResetChanges();
              return;
            }}
            saveChanges={() => {
              saveChanges();
              if (props.extendedSaveChanges)
                props.extendedSaveChanges(updatedData);
              return;
            }}
          />
        </div>
      );
    },
  };
}
