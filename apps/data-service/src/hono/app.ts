import { Hono } from "hono";

export const App = new Hono<{ Bindings: Env }>();

App.get("/health", (c) => c.json({ status: "ok" }));
