import { motion } from "motion/react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export type SaveChangesProps = {
  hasChanges: boolean;
  saveChanges: () => void;
  resetChanges: () => void;
};

export default function SaveChanges({
  hasChanges,
  resetChanges,
  saveChanges,
}: SaveChangesProps) {
  return (
    <motion.div
      initial={{
        y: 20,
        opacity: 0,
      }}
      animate={{
        y: hasChanges ? 0 : 20,
        opacity: hasChanges ? 1 : 0,
      }}
      className="fixed top-[85%] z-[5] bottom-0 left-[38.5%] right-0 w-[40%] h-[3rem]"
    >
      <Card className="flex flex-row justify-between p-[1rem] items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold">Changes Detected</h1>
          <p className="opacity-70 text-sm">
            Make sure to save your changes before quitting.
          </p>
        </div>
        <div className="flex flex-row gap-2">
          <Button
            variant={"red"}
            className="cursor-pointer"
            onClick={() => saveChanges()}
          >
            Save Changes
          </Button>
          <Button
            variant={"secondary"}
            className="cursor-pointer"
            onClick={() => resetChanges()}
          >
            Reset
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
