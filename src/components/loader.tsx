import { LoaderPinwheel } from "lucide-react";

export default function Loader() {
  return (
    <div className="fixed z-[10] bg-background w-[100vw] top-0 left-0 right-0 bottom-0 h-[100vh]">
      <div className="w-full h-full flex items-center justify-center">
        <LoaderPinwheel className="animate-spin opacity-60" />
      </div>
    </div>
  );
}
