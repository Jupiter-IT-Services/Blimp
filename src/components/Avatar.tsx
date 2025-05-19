import Image from "next/image";
import {
  Avatar as ShadAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { formatNameForAvatar } from "@/lib/utils";
type AvatarProps = {
  name: string;
  iconHash: string | null;
  id: string;
  className?: string;
  size?: number;
};

export function Avatar({
  name,
  id,
  iconHash,
  size = 50,
  ...props
}: AvatarProps) {
  return (
    <ShadAvatar
      className="bg-default-accent"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {iconHash && (
        <AvatarImage
          src={`https://cdn.discordapp.com/icons/${id}/${iconHash as string}.${(iconHash as string).startsWith("a_") ? "gif" : "png"}?size=4096`}
          alt={`${name} icon`}
          width={size}
          height={size}
        />
      )}
      <AvatarFallback className="bg-default-accent text-sm flex items-center justify-center">
        {formatNameForAvatar(name)}
      </AvatarFallback>
    </ShadAvatar>
  );
}
