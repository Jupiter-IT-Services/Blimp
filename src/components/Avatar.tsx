import Image from "next/image";
import { sha256 } from "js-sha256";
import {
  Avatar as ShadAvatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar"
type AvatarProps = {
  email: string;
  className?: string;
  size?: number;
};

export function Avatar({ email, size = 28, ...props }: AvatarProps) {
  const emailHash = sha256(email.toLowerCase().trim());
  const gravatarUrl = `https://gravatar.com/avatar/${emailHash}?s=${size}&d=mp`;

  return (
    <ShadAvatar>
      <AvatarImage src={gravatarUrl}
        alt={`${email}'s avatar`}
        width={size}
        height={size}
        className={`rounded-full ${props.className}`} />
      <AvatarFallback>{email.charAt(0)}</AvatarFallback>
    </ShadAvatar>

  );
}
