# 🧩 SOLUTION.md

## ✅ Overview

This solution focuses on improving scalability, performance, and maintainability, both on the backend and frontend. Below are the key improvements and technical decisions made during implementation.

---

## 🔧 Backend (Node.js)

### 1. **Non-blocking File Access**
Replaced `fs.readFileSync` with `fs.promises.readFile` in `src/routes/items.js` to convert file reading into a non-blocking asynchronous operation. This prevents event loop blocking and improves API scalability.

### 2. **Stats Caching**
Introduced a 5-minute caching strategy for `/api/stats` using the `cache-manager` library.  
The cache is automatically invalidated when items are created, updated, or deleted.

### 3. **Testing with Jest**
Added unit tests using Jest covering all use cases for the `items` endpoint, including:
- Successful GET and POST requests
- Handling of invalid input
- Error scenarios

---

## 💻 Frontend (React)

### 4. **Custom Hook with Cache**
Created a reusable custom React hook that manages the items list, supports caching, and triggers automatic invalidation after changes.

### 5. **Search, Pagination & Limit**
Implemented server-side filtering using `q`, `limit`, and pagination parameters, fully integrated into the UI and API.

### 6. **List Virtualization**
Used `react-window` to efficiently render long lists and improve scroll performance.

### 7. **UX Enhancements**
- Added loading indicators and skeleton states
- Handled error messages gracefully
- Improved accessibility (ARIA labels, focus management)
- Applied clean, responsive styling
- Integrated `react-hot-toast` for user feedback

---

## ⚙️ Technical Considerations

- The code follows idiomatic patterns for both React and Node.js.
- Responsibilities are clearly separated between API, hooks, and UI components.
- Focused on simplicity, reusability, and maintainability.
