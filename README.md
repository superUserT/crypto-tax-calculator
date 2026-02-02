# Crypto Tax Calculator – Backend API

This backend is a **PHP (Symfony) API** responsible for calculating cryptocurrency capital gains using the **First-In-First-Out (FIFO)** method.

It receives transaction data from the frontend, applies FIFO logic, and returns calculated gains and remaining balances.

---

## Technology Stack

- PHP 8.3
- Symfony Framework
- Composer
- Built-in PHP development server

---

## System Requirements

- Linux (Debian / Ubuntu-based)
- PHP 8.3
- Composer 2.x
- Required PHP extensions:
  - xml
  - intl
  - mbstring
  - curl
  - zip
  - pdo

---

## Project Structure

```
backend/
├── public/
│   └── index.php
├── src/
│   ├── Controller/
│   └── Service/
│       └── FifoCalculator.php
├── composer.json
├── composer.lock
└── README.md
```

---

## Running the Backend Server

### 1. Navigate to the Backend Directory

```bash
cd backend
```

---

### 2. Install Dependencies

```bash
composer install
```

This installs all required Symfony dependencies.

---

### 3. Start the Development Server

```bash
php -S localhost:8000 -t public
```

The API will be available at:

```
http://localhost:8000
```

---

## API Endpoint

### Calculate FIFO Tax

**URL**
```
POST /api/calculate
```

**Description**  
Processes cryptocurrency transactions and applies FIFO logic to calculate capital gains.

---

### Request Format

```json
{
  "transactions": [
    {
      "type": "BUY",
      "date": "2024-01-01",
      "buyCoin": "BTC",
      "buyAmount": 1,
      "buyPricePerCoin": 30000
    },
    {
      "type": "SELL",
      "date": "2024-02-01",
      "sellCoin": "BTC",
      "sellAmount": 0.5,
      "sellPricePerCoin": 40000
    }
  ]
}
```

---

### Response Format

```json
{
  "processedTransactions": [
    {
      "disposal": {
        "disposedAmount": 0.5,
        "cost": 15000,
        "proceeds": 20000,
        "gain": 5000
      }
    }
  ],
  "finalBalances": {
    "BTC": {
      "totalAmount": 0.5
    }
  }
}
```

---

## FIFO Logic Overview

- Each BUY transaction creates a **lot**
- Lots are stored chronologically
- SELL transactions consume the **oldest available lots first**
- Cost basis is calculated from consumed lots
- Gains are calculated as:

```
gain = proceeds − cost basis
```

The FIFO logic is implemented in:

```
src/Service/FifoCalculator.php
```

---

## Error Handling

- Invalid or missing input returns HTTP **400**
- Malformed requests return descriptive error messages

---

## Troubleshooting

**Composer install fails**
- Ensure required PHP extensions are installed

**Server not responding**
- Confirm port 8000 is free
- Ensure PHP version is 8.3

---

## License

Apache 2.0
