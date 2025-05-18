import config from "@/backend/config";
import { APIEmbed, APIEmbedAuthor } from "discord.js";
import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "./ui/input";
import { cn, createId, imageUrlRegex, resolveColor, urlRegex } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";

export type EmbedCreatorProps = {
  state: APIEmbed | null;
  setState: Dispatch<SetStateAction<APIEmbed | null>>;
};

export type EmbedField = {
  name: string;
  value: string;
  inline: boolean;
  tId: string;
};
export default function EmbedCreator(props: EmbedCreatorProps) {
  const [hexColor, setHexColor] = useState(config.colors.default);

  const [title, setTitle] = useState("");
  const [titleURL, setTitleURL] = useState("");

  const [description, setDescription] = useState("");

  const [authorTitle, setAuthorTitle] = useState("");
  const [authorURL, setAuthorURL] = useState("");

  const [thumbnailURL, setThumbnailURL] = useState("");
  const [imageURL, setImageURL] = useState("");

  const [fields, setFields] = useState<EmbedField[]>([]);

  const [footerTitle, setFooterTitle] = useState("");
  const [footerURL, setFooterURL] = useState("");

  const updateField = (
    updatedField: EmbedField,
    newData: Partial<EmbedField>
  ) => {
    const updatedFields = fields.map((r, i) => {
      if (r.tId === updatedField.tId) {
        return { ...r, ...newData };
      }
      return r;
    });

    setFields(updatedFields);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-3">
        <LabledInput
          className="w-full"
          label="title*"
          value={title}
          setValue={setTitle}
        />
        <LabledInput
          className="w-[42%]"
          valid={() => urlRegex.test(titleURL)}
          label="title url"
          value={titleURL}
          placeHolder="https://jptr.cloud"
          setValue={setTitleURL}
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="uppercase text-xs opacity-60 font-semibold">
          DESCRIPTION*
        </p>
        <Textarea
          className={``}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Accordion type="multiple">
        <AccordionItem value="author">
          <AccordionTrigger>Author</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-row gap-3">
              <LabledInput
                className="w-full"
                label="Author Title"
                value={authorTitle}
                setValue={setAuthorTitle}
              />
              <LabledInput
                className="w-[42%]"
                label="Author Icon"
                value={authorURL}
                valid={() => imageUrlRegex.test(authorURL)}
                placeHolder="Enter URL"
                setValue={setAuthorURL}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="assets">
          <AccordionTrigger>Assets</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-row gap-3">
              <LabledInput
                className="w-full"
                label="Thumbnail URL"
                valid={() => imageUrlRegex.test(thumbnailURL)}
                value={thumbnailURL}
                setValue={setThumbnailURL}
              />
              <LabledInput
                className="w-full"
                label="Image URL"
                valid={() => imageUrlRegex.test(imageURL)}
                value={imageURL}
                placeHolder="Enter URL"
                setValue={setImageURL}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="fields">
          <AccordionTrigger>Fields</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-[1.5rem] mb-[1rem]">
              {fields.map((z) => (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row justify-between gap-2">
                    <Input
                      className={``}
                      placeholder={"Name"}
                      value={z.name}
                      onChange={(e) => updateField(z, { name: e.target.value })}
                    />
                    <Input
                      className={``}
                      placeholder={"Value"}
                      value={z.value}
                      onChange={(e) =>
                        updateField(z, { value: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-row justify-between gap-4 items-center">
                    <div className="flex flex-row gap-2">
                      <Checkbox
                        checked={z.inline}
                        onCheckedChange={(e) =>
                          updateField(z, {
                            inline: !z.inline,
                          })
                        }
                      />
                      <p className="opacity-70 mt-[-2px]">Inline?</p>
                    </div>
                    <Button
                      className="cursor-pointer"
                      onClick={() => {
                        setFields(fields.filter((f) => z.tId !== f.tId));
                      }}
                      variant={"secondary"}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant={"red"}
              className="cursor-pointer"
              onClick={() => {
                setFields([
                  ...fields,
                  {
                    name: "",
                    inline: false,
                    value: "",
                    tId: createId(),
                  },
                ]);
              }}
            >
              Add Field
            </Button>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="footer">
          <AccordionTrigger>Footer</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-row gap-3">
              <LabledInput
                className="w-full"
                label="Footer Mesasge"
                value={footerTitle}
                setValue={setFooterTitle}
              />
              <LabledInput
                className="w-[42%]"
                label="Footer URL"
                valid={() => imageUrlRegex.test(footerURL)}
                value={footerURL}
                placeHolder="Enter URL"
                setValue={setFooterURL}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        variant={"red"}
        onClick={() => {
          const obj = {
            title: title,
            description: description,
            color: resolveColor(hexColor),
          } as APIEmbed;

          if (authorTitle) {
            const o = {
              name: authorTitle,
            } as APIEmbedAuthor;

            if (authorURL) {
              o["icon_url"] = authorURL;
            }

            obj["author"] = o;
          }



          props.setState(obj);
        }}
      >
        Save Embed
      </Button>
    </div>
  );
}

export type LabledInputProps = {
  label: string;
  className?: string;
  valid?: () => boolean;
  value: string;
  placeHolder?: string;
  setValue: Dispatch<SetStateAction<string>>;
};
export function LabledInput(props: LabledInputProps) {
  return (
    <div className={cn("flex flex-col gap-1", props.className)}>
      <p className="uppercase text-xs opacity-60 font-semibold">
        {props.label}
      </p>
      <Input
        className={`${props.valid ? (props.valid() ? "border-green-500/20" : "border-red-500/20") : ""}`}
        placeholder={props.placeHolder}
        value={props.value}
        onChange={(e) => props.setValue(e.target.value)}
      />
    </div>
  );
}
