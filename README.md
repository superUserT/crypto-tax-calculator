# Crypto Tax Calculator – Frontend Application

This frontend is a **React application** that allows users to submit cryptocurrency transaction data and view calculated capital gains produced by the backend FIFO API.

---

## Technology Stack

- React
- Node.js
- npm
- Fetch API

---

## System Requirements

- Windows 10 or later
- Node.js **18+** (LTS recommended)
- npm **9+**
- Web browser (Chrome, Edge, Firefox)
- Running backend API

---

## Project Structure

```
frontend/
├── src/
│   ├── App.js
│   └── components/
├── public/
├── package.json
├── package-lock.json
└── README.md
```

---

## Running the Frontend Application

### 1. Navigate to the Frontend Directory

```powershell
cd frontend
```

---

### 2. Install Dependencies

```powershell
npm install
```

This installs all required frontend dependencies.

---

### 3. Start the Development Server

```powershell
npm start
```

The application will be available at:

```
http://localhost:3000
```

---

## Backend Dependency

The frontend requires the backend API to be running at:

```
http://localhost:8000
```

If the backend is not running, calculations will not work.

---

## Frontend–Backend Communication

1. Transaction data is prepared in the frontend
2. Data is sent as JSON to the backend API
3. Backend applies FIFO calculations
4. Results are returned to the frontend
5. Calculated gains are displayed to the user

---

## API Endpoint Used

```
POST http://localhost:8000/api/calculate
```

---

## Testing Considerations

- The frontend supports unit testing using Jest or Jasmine
- API responses can be mocked for UI testing
- FIFO calculation results can be validated against known datasets

---

## Troubleshooting

**Frontend starts but shows no results**
- Ensure backend server is running
- Check browser console for API errors
- Confirm API endpoint URL

**npm command not found**
- Reinstall Node.js
- Restart terminal

---

## License

Apache 2.0

