import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

const app = express();

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "risklens-api" });
});

describe("RiskLens health endpoint", () => {
  it("returns a healthy response", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.service).toBe("risklens-api");
  });
});
