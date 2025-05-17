import { Guild } from "discord.js"
import { Card } from "../ui/card"
import { Avatar } from "../Avatar"
import { ChevronsUp, Command, Hammer, Hand, House, SmilePlus } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Badge } from "../ui/badge"
import { capitlize } from "@/lib/utils"

export const TABS = {
    "essentials": [
        {
            name: "Commands",
            href: "/commands",
            icon: <Command width={20} height={20} />,
            pro: false
        },
        {
            name: "Welcome & Goodbye",
            href: "/welcome-and-goodbye",
            icon: <Hand width={20} height={20} />,
            pro: false
        },
        {
            name: "Leveling",
            href: "/leveling",
            icon: <ChevronsUp width={20} height={20} />,
            pro: false
        },
        {
            name: "Moderation",
            href: "/leveling",
            icon: <Hammer width={20} height={20} />,
            pro: false
        },
        {
            name: "Reaction Roles",
            href: "/reaction-roles",
            icon: <SmilePlus width={20} height={20} />,
            pro: false
        }
    ]
}

export type GuildSidebarProps = {
    guild: Guild
}

export default function GuildSidebar(props: GuildSidebarProps) {
    return <Card className="rounded-none flex h-screen flex-col gap-2 py-[2rem] px-[0.75rem] min-w-[17rem] max-w-[17rem] ">


        <Accordion type="multiple" defaultValue={[...Object.keys(TABS)]}>
            {Object.keys(TABS).map((k, i) => {
                return <AccordionItem key={i} value={k}>
                    <AccordionTrigger className="cursor-pointer bg-transparent hover:bg-gray-100/5 py-[0.5rem] px-[0.5rem] font-black text-xs">{k.toUpperCase()}</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-2 mt-[1rem]">
                        {TABS[k as keyof typeof TABS].map((tab, i) => {
                            return <a href={`/dashboard/${props.guild.id}${tab.href}`} key={i} className="flex flex-row justify-between px-[0.7rem] group bg-transparent hover:bg-gray-200/5 py-[0.7rem] rounded-md smooth_transition">
                                <div className="flex gap-2 opacity-65 group-hover:opacity-100 smooth_transition">{tab.icon}
                                    <p className="font-semibold text-md">
                                        {capitlize(tab.name)}
                                    </p>
                                </div>

                                {tab.pro && <div><Badge variant={"pro"}>Pro</Badge></div>}
                            </a>
                        })}
                    </AccordionContent>
                </AccordionItem>
            })}
        </Accordion>

    </Card>
}