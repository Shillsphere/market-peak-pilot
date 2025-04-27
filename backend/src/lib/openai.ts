import OpenAI from "openai";

// TODO: It looks like process.env.OPENAI_API_KEY might be incorrect.
// Perhaps you meant OPENAI_SECRET_KEY?
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); 