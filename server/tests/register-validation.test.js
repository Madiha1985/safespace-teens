const request = require("supertest");
const app = require("../app");

describe("Register validation", () => {
  it("rejects age below 12", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "age9test",
      email: "age9test@example.com",
      password: "password123",
      age: 9,
      interests: [],
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/age must be between 12 and 17/i);
  });

  it("rejects password shorter than 8", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "shortpasstest",
      email: "shortpasstest@example.com",
      password: "123",
      age: 14,
      interests: [],
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/at least 8/i);
  });
});
