import { getCurrentLanguage } from "./getLanguage";
import { msgIn, type MsgKey } from "./serverMsgs";

/** A message for the person using the app now, in their language. For server actions. */
export async function msg(key: MsgKey, vars: Record<string, string | number> = {}): Promise<string> {
  return msgIn(await getCurrentLanguage(), key, vars);
}
