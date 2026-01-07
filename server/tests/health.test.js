const request = require("supertest");
const app = require("../app");

describe("Health check", () => {
  it("GET / returns API running", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("SafeSpace Teens API running");
  });
});
