/* eslint-disable node/no-process-env */

import type { ZodObject, ZodRawShape } from "zod";

import { ZodError } from "zod";

export default function tryParseEnv<T extends ZodRawShape>(
  EnvSchema: ZodObject<T>,
  buildEnv: Record<string, string | undefined> = process.env,
) {
  try {
    return EnvSchema.parse(buildEnv);
  }
  catch (error) {
    if (error instanceof ZodError) {
      let message = "missing env variables: \n";
      error.issues.forEach((issue) => {
        message += `- ${issue.path.join(".")}: ${issue.message}\n`;
      });
      const e = new Error(message);
      e.stack = "";
      throw e;
    }
    else {
      console.error(error);
    }
  }
}
