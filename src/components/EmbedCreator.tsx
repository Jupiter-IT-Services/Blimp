import config from "@/backend/config";
import { APIEmbed, APIEmbedAuthor } from "discord.js";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { EmbedVisualizer } from "embed-visualizer";
import {
  cn,
  createId,
  hexColorRegex,
  imageUrlRegex,
  resolveColor,
  urlRegex,
} from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export type EmbedCreatorProps = {
  state: APIEmbed | undefined;
  setState: Dispatch<SetStateAction<APIEmbed | undefined>>;
};

export type EmbedField = {
  name: string;
  value: string;
  inline: boolean;
  tId?: string;
};
export default function EmbedCreator(props: EmbedCreatorProps) {
  const [hexColor, setHexColor] = useState<string>(
    config.colors.default as string
  );

  const [title, setTitle] = useState("Title");
  const [titleURL, setTitleURL] = useState("");

  const [description, setDescription] = useState("Description");

  const [authorTitle, setAuthorTitle] = useState("");
  const [authorURL, setAuthorURL] = useState("");

  const [thumbnailURL, setThumbnailURL] = useState("");
  const [imageURL, setImageURL] = useState("");

  const [fields, setFields] = useState<EmbedField[]>([]);

  const [footerTitle, setFooterTitle] = useState("");
  const [footerURL, setFooterURL] = useState("");

  const buildEmbedObject = () => {
    return {
      title: title,
      description: description,
      author: authorTitle
        ? {
            name: authorTitle,
            icon_url: authorURL,
          }
        : undefined,
      footer: footerTitle
        ? {
            text: footerTitle,
            icon_url: footerURL,
          }
        : undefined,
      fields:
        fields.length > 0
          ? fields.map((f) => {
              return {
                name: f.name || "Required",
                inline: f.inline,
                value: f.value || "Required",
              } as Omit<EmbedField, "tId">;
            })
          : undefined,
      thumbnail: thumbnailURL ? { url: thumbnailURL } : undefined,
      image: imageURL ? { url: imageURL } : undefined,
      color: resolveColor(hexColor),
      url: titleURL ? titleURL : undefined,
    };
  };

  const handleSaveEmbed = () => {
    props.setState(buildEmbedObject());
  };

  const updateField = (
    updatedField: EmbedField,
    newData: Partial<EmbedField>
  ) => {
    const updatedFields = fields.map((r) => {
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
          valid={() => (title && title.length >= 1) as boolean}
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
        <div className={"flex flex-col gap-1"}>
          <p className="uppercase text-xs opacity-60 font-semibold">Color</p>
          <Popover>
            <PopoverTrigger className="flex flex-row gap-2 items-center justify-center">
              <div
                style={{
                  backgroundColor: `${hexColor}`,
                  height: "30px",
                  width: "36px",
                }}
                className="rounded-md"
              />
              <Input
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value as string)}
              />
            </PopoverTrigger>
            <PopoverContent className="mr-[3.5rem] w-fit flex flex-col items-center justify-center gap-[1rem]">
              <HexColorPicker color={hexColor} onChange={setHexColor} />
              <Input
                className={`w-[80%] ${hexColorRegex.test(hexColor) ? "border-green-500/20" : "border-red-500/20"}`}
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="uppercase text-xs opacity-60 font-semibold">
          DESCRIPTION*
        </p>
        <Textarea
          className={`${description && description.length >= 1 ? "border-green-500/20" : "border-red-500/20"}`}
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
              {fields.map((z, i) => (
                <div className="flex flex-col gap-2" key={i}>
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
                        onCheckedChange={() =>
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
                label="Footer Message"
                value={footerTitle}
                setValue={setFooterTitle}
              />
              <LabledInput
                className="w-[42%]"
                label="Footer Icon"
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
        className="cursor-pointer"
        onClick={handleSaveEmbed}
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
