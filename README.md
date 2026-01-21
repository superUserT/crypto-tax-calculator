# Getting Started

## Backend

4. How to Run It

    Create your .env file inside backend/ with your MONGO_URL.

    Build and Run: From your root folder (where docker-compose.yml is):
    Bash

    docker-compose up --build

    Install Dependencies (First time only): If you haven't run composer install locally, the container needs to do it. Open a new terminal:
    Bash

    docker-compose exec backend composer install
    docker-compose exec backend composer dump-autoload

Test it: Go to http://localhost:8000/api/test. You should see your JSON success message.


## frontned 

Run

```
npm run dev
```