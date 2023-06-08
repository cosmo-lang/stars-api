# Stars API
API for hosting Stars packages

| Endpoint                | HTTP Method | Description              | Notes                           |
| ----------------------- | ----------- | ------------------------ | ------------------------------- |
| `/api/packages/:name`   | GET         | Get a package by name    | `action` paramater is required  |
| `/api/packages`         | POST        | Upload a package         | -                                |
| `/api/packages/:name`   | PUT         | Update a package         | -                                |
| `/api/packages/:name`   | DELETE      | Remove a package         | -                                |