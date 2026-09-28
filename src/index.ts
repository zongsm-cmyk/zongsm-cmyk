// Both deployment roots start the same HTTP application.
import { startServer } from "../alfarouq-router-v1/src/index";
if (import.meta.main) startServer();
