import "./dotenv";
import "~commands";
import "~modules";

import { Vennie } from "./Client";

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

Vennie.connect().catch(console.error);
