# Stars API
API for hosting Stars packages

| Endpoint                      | HTTP Method | Description              |
| ----------------------------- | ----------- | ------------------------ |
| `/api/packages/:author`       | GET         | Get a package author by name    |
| `/api/packages/`              | POST        | Create a package author         |
| `/api/packages/`              | PATCH         | Update a package author         |
| `/api/packages/`              | DELETE      | Remove a package author         |
| `/api/packages/:author/:name` | GET         | Get a package by name    |
| `/api/packages/:author/`      | POST        | Upload a package         |
| `/api/packages/:author/`      | PATCH         | Update a package         |
| `/api/packages/:author/`      | DELETE      | Remove a package         |