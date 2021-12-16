import { WebhookMgr } from "@helpers/WebhookMgr";

aha.on("circleCIHook", WebhookMgr.webhookHandler);
