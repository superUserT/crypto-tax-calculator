# React Frontend Installation & Usage Documentation (Linux)

This document describes how to **install**, **configure**, and **run** the React frontend that connects to the PHP backend server.  
These instructions are intended for **Linux (Debian/Ubuntu-based)** systems.

The frontend is responsible for:
- Loading transaction data from a CSV file
- Sending the data to the PHP backend
- Displaying calculated **capital gains tax results** to the user

---

## System Requirements

- Linux (Debian/Ubuntu-based)
- Node.js **18+** (LTS recommended)
- npm **9+**
- Running PHP backend server

---

## Project Structure Assumption

```

project-root/
├── backend/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── test.csv
└── README.md

````

⚠️ **Important**  
The file **`test.csv` must exist in the root of the project**.  
This file is loaded by the frontend and used as the **input dataset** for capital gains tax calculations.

---

## Installing Node.js and npm

### 1. Install Node.js (Recommended via APT)

Update package lists:

```bash
sudo apt update
````

Install Node.js and npm:

```bash
sudo apt install nodejs npm
```

Verify installation:

```bash
node --version
npm --version
```

Ensure Node.js version is **18 or higher**.

---

## Frontend Installation

### 1. Navigate to the Frontend Directory

```bash
cd frontend
```

---

### 2. Install Dependencies

Install all frontend dependencies using npm:

```bash
npm install
```

This will create the `node_modules/` directory and lock dependency versions.

---

## Running the Frontend

### 1. Start the Development Server

using Create React App:

```bash
npm start
```

Expected output:

```
Local: http://localhost:3000
```

---

### 2. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

Ensure the **PHP backend server is already running**, typically on:

```
http://localhost:8000
```

---

## CSV Input File (`test.csv`)

### Purpose

* `test.csv` contains transaction data used to calculate **capital gains tax**
* The frontend loads this file automatically
* The parsed data is sent to the backend API for processing

---

### Requirements

* The file **must be named exactly**: `test.csv`
* The file **must be located in the project root**
* The frontend assumes the file exists on application load

Example location:

```
project-root/test.csv
```

---

### Usage Flow

1. Frontend loads `test.csv`
2. CSV data is parsed into structured records
3. Data is sent to the PHP backend API
4. Backend calculates capital gains tax
5. Results are returned and displayed to the user

If `test.csv` is missing or malformed, calculations will fail.

---

## Common Issues

### `npm: command not found`

Node.js or npm is not installed:

```bash
sudo apt install nodejs npm
```

---

### Frontend Loads but No Data Appears

* Confirm `test.csv` exists in the project root
* Verify backend server is running
* Check browser console for network or CORS errors

---

### Backend API Not Responding

Ensure the PHP server is running:

```bash
cd backend
php -S localhost:8000 -t public
```

---

## Notes

* These instructions are **Linux-only**
* The React development server is intended for **development use**
* For production, build the frontend using:

```bash
npm run build
```

and serve the static files using a proper web server.

---