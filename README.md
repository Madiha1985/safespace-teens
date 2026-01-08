# SafeSpace Teens

SafeSpace Teens is a social-learning platform designed for teenagers aged **12–17**.  
The platform provides a **safe digital environment** where teens can study together, chat in moderated rooms, share book reviews, express emotions through a private journal, and collaborate creatively.

This project was developed as a **Degree Project at Medieinstitutet**.

---

## ✨ Core Features (MVP)

- **User Authentication**
  - Secure registration and login using JWT
  - Age restriction enforced (12–17)
  - Password hashing with bcrypt

- **Real-time Chatrooms**
  - Topic-based rooms (study, reading, general)
  - Real-time messaging using Socket.io
  - Room join/leave system messages
  - Persistent chat history stored in MongoDB

- **Reading Hub**
  - Users can post book reviews
  - Peer comments on reviews
  - Star-based rating system

- **Feeling Journal**
  - Private mood and reflection entries
  - Only visible to the logged-in user

- **Drawing Board**
  - Real-time collaborative drawing inside chat rooms
  - Room-based synchronization using Socket.io

- **Profile Customization**
  - Preset avatar selection
  - Interest selection (used for dashboard recommendations)

---

## 🛠 Tech Stack

### Frontend
- Next.js (React, App Router)
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.io (real-time communication)

### Authentication & Security
- JSON Web Tokens (JWT)
- bcrypt password hashing
- Protected routes & socket authentication

### Testing
- Jest
- Supertest (backend API validation tests)

### Deployment
- Frontend: **Vercel**
- Backend: **Render / Railway**
- Database: **MongoDB Atlas**

---

## 🧪 Testing

- **Manual testing** was performed for all major user flows:
  - Registration & login
  - Chat messaging
  - Reading hub interactions
  - Journal entries
  - Profile updates

- **Automated backend tests** implemented using Jest and Supertest:
  - API health check
  - Registration validation (age and password rules)

Run backend tests locally:
```bash
cd server
npm test
## Live Demo
https://safespace-teens.vercel.app

## Repository
https://github.com/Madiha1985/safespace-teens
