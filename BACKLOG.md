# SafeSpace Teens – Backlog

This backlog tracks the project work in three sprints (6 weeks).

## Sprint 1 (Weeks 1–2) – Setup & Foundation
- [x] Create GitHub repo and initialize project structure (client/server)
- [x] Setup Next.js frontend (TypeScript + Tailwind)
- [x] Setup Express backend and folder structure
- [x] Connect MongoDB Atlas (Mongoose)
- [x] Implement authentication (register/login with bcrypt + JWT)
- [x] Add protected routes (JWT middleware)
- [x] Add interests update endpoint (`PUT /api/users/me/interests`)

## Sprint 2 (Weeks 3–4) – Real-time Chat (Core Feature)
- [x] Setup Socket.io backend
- [x] Secure Socket.io with JWT (only authenticated users can connect)
- [x] Implement room join/leave and room messaging
- [x] Persist chat messages in MongoDB
- [x] Add chat history endpoint (`GET /api/rooms/:roomId/messages`)
- [ ] Add rate limiting / basic spam protection (optional)
- [ ] Add reporting endpoint for messages (optional)

## Sprint 3 (Weeks 5–6) – Frontend Features & Polish
### Frontend
- [ ] Build chat UI (rooms list, history loading, real-time updates)
- [ ] Build reading hub UI (reviews list + create review)
- [ ] Build feeling journal UI (private entries + mood tracking)

### UX / Quality
- [ ] Accessibility checks (keyboard nav, labels, contrast, focus states)
- [ ] Basic content moderation (word filter + report UI)
- [ ] Responsive UI refinement (mobile-first)
- [ ] Testing (manual flows + basic automated tests)
- [ ] Deployment (Vercel frontend + Render/Railway backend + Atlas)
- [ ] Documentation polish (README + final report updates)

## Future Enhancements (After MVP)
- [ ] Forgot password flow (email-based reset token)
- [ ] AI assistant for study tips (safe version, server-side)
- [ ] More moderation tools (mute/timeout, flagged content queue)
