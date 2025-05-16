import chalk from "chalk";

export const log = (msg: string) =>
  console.log(`${chalk.magentaBright("log")} ${msg}`);
export const warn = (msg: string) =>
  console.log(`${chalk.yellowBright("warn")} ${msg}`);
export const err = (msg: string, exit?: number) => {
  console.log(`${chalk.redBright("err")} ${msg}`);
  if (exit) {
    process.exit(exit);
  }
};
export const info = (msg: string) =>
  console.log(`${chalk.blueBright("info")} ${msg}`);
export const success = (msg: string) =>
  console.log(`${chalk.greenBright("success")} ${msg}`);
