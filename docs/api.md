# Urbanspace API

> Автосгенерировано из OpenAPI `http://150.136.246.222:3000/docs-json`
> Urbanspace API v1.0.0 · base path `/api` · авторизация Bearer JWT (🔒)


## health

### `GET /api/health` 🔒
Проверить состояние сервиса

**Ответы:** `200`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `status` | string |  | пример: "ok" |

## auth

### `POST /api/auth/otp/request`
Вход: запросить OTP-код для существующего аккаунта

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `phone` | string | да | пример: "+77001234567" |


**Ответы:** `201`, `404`

_201 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `message` | string |  | пример: "OTP sent" |
| `phone` | string |  | пример: "+77001234567" |

### `POST /api/auth/otp/verify`
Вход: подтвердить OTP-код и получить JWT-токен доступа

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `phone` | string | да | пример: "+77001234567" |
| `code` | string | да | пример: "123456" |


**Ответы:** `200`, `401`, `404`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `accessToken` | string |  | пример: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." |
| `user` | object |  |  |

### `POST /api/auth/register`
Регистрация: начать регистрацию по телефону, имени и фамилии

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `phone` | string | да | пример: "+77001234567" |
| `name` | string |  | пример: "John" |
| `surname` | string |  | пример: "Doe" |


**Ответы:** `201`, `409`

_201 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `message` | string |  | пример: "OTP sent" |
| `phone` | string |  | пример: "+77001234567" |

### `POST /api/auth/register/confirm`
Регистрация: подтвердить OTP-код, создать пользователя и вернуть JWT

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `phone` | string | да | пример: "+77001234567" |
| `code` | string | да | пример: "123456" |


**Ответы:** `200`, `401`, `404`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `accessToken` | string |  | пример: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." |
| `user` | object |  |  |

## bookings

### `POST /api/bookings` 🔒
Создать бронирование и получить ссылку для оплаты

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `cabinetId` | string | да | пример: "11111111-1111-4111-8111-111111111111" |
| `slots` | BookingSlotDto[] | да | One or more time slots for the same cabinet. A single payment and confirmation covers all slots. |


**Ответы:** `201`, `401`, `403`, `404`, `409`

_201 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `booking` | object |  |  |
| `paymentUrl` | string |  | пример: "https://pay.kaspi.kz/pay/cdbkhvxw" |

### `GET /api/bookings` 🔒
Список бронирований

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `date` | query | string |  |
| `from` | query | string |  |
| `to` | query | string |  |
| `cabinetId` | query | string |  |
| `userId` | query | string |  |
| `status` | query | "PENDING" | "CONFIRMED" | "EXPIRED" | "CANCELLED" |  |
| `order` | query | "asc" | "desc" |  |
| `skip` | query | number |  |
| `take` | query | number |  |

**Ответы:** `200`, `401`, `403`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `total` | number |  | пример: 12 |
| `items` | object[] |  |  |

### `GET /api/bookings/{id}` 🔒
Детали бронирования (только ADMIN)

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Ответы:** `200`, `401`, `403`, `404`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "11111111-1111-4111-8111-111111111111" |
| `cabinetId` | string |  | пример: "22222222-2222-4222-8222-222222222222" |
| `userId` | string |  | пример: "33333333-3333-4333-8333-333333333333" |
| `status` | string |  | пример: "PENDING" |
| `paymentStatus` | string |  | пример: "INITIATED" |
| `totalAmount` | number |  | пример: 10000 |
| `startsAt` | string |  | Earliest slot start |
| `endsAt` | string |  | Latest slot end |
| `expiresAt` | string |  | пример: "2026-06-01T09:20:00.000Z" |
| `paymentInitiatedAt` | string |  | пример: null |
| `paidAt` | string |  | пример: null |
| `createdAt` | string |  | пример: "2026-06-01T09:00:00.000Z" |
| `confirmedAt` | string |  | пример: null |
| `deletedAt` | string |  | пример: null |
| `slots` | object[] |  |  |
| `user` | object |  |  |
| `cabinet` | object |  |  |

### `POST /api/bookings/{id}/confirm` 🔒
Подтвердить бронирование после оплаты (только ADMIN)

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Ответы:** `200`, `401`, `403`, `404`, `409`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "11111111-1111-4111-8111-111111111111" |
| `cabinetId` | string |  | пример: "22222222-2222-4222-8222-222222222222" |
| `userId` | string |  | пример: "33333333-3333-4333-8333-333333333333" |
| `status` | string |  | пример: "PENDING" |
| `paymentStatus` | string |  | пример: "INITIATED" |
| `totalAmount` | number |  | пример: 10000 |
| `startsAt` | string |  | Earliest slot start |
| `endsAt` | string |  | Latest slot end |
| `expiresAt` | string |  | пример: "2026-06-01T09:20:00.000Z" |
| `paymentInitiatedAt` | string |  | пример: null |
| `paidAt` | string |  | пример: null |
| `createdAt` | string |  | пример: "2026-06-01T09:00:00.000Z" |
| `confirmedAt` | string |  | пример: null |
| `deletedAt` | string |  | пример: null |
| `slots` | object[] |  |  |

### `PATCH /api/bookings/{id}/reschedule` 🔒
Перенести бронирование (только USER, только подтверждённые)

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `slots` | BookingSlotDto[] | да | New set of time slots. Must have identical total daytime (07:00–20:30) and nighttime hours as the original booking. |


**Ответы:** `200`, `401`, `403`, `404`, `409`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "11111111-1111-4111-8111-111111111111" |
| `cabinetId` | string |  | пример: "22222222-2222-4222-8222-222222222222" |
| `userId` | string |  | пример: "33333333-3333-4333-8333-333333333333" |
| `status` | string |  | пример: "PENDING" |
| `paymentStatus` | string |  | пример: "INITIATED" |
| `totalAmount` | number |  | пример: 10000 |
| `startsAt` | string |  | Earliest slot start |
| `endsAt` | string |  | Latest slot end |
| `expiresAt` | string |  | пример: "2026-06-01T09:20:00.000Z" |
| `paymentInitiatedAt` | string |  | пример: null |
| `paidAt` | string |  | пример: null |
| `createdAt` | string |  | пример: "2026-06-01T09:00:00.000Z" |
| `confirmedAt` | string |  | пример: null |
| `deletedAt` | string |  | пример: null |
| `slots` | object[] |  |  |

## files

### `POST /api/files/upload` 🔒
Загрузить файл в хранилище

**Тело запроса** (`multipart/form-data`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `file` | string | да |  |


**Ответы:** `200`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `bucket` | string |  | пример: "uploads" |
| `objectName` | string |  | пример: "uuid-file.png" |
| `url` | string |  | пример: "uploads/uuid-file.png" |

## locations

### `POST /api/locations` 🔒
Создать локацию (только SUPER_ADMIN)

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `name` | string | да | пример: "Downtown Hub" |
| `address` | string | да | пример: "123 Main St, Almaty" |
| `isActive` | boolean |  | пример: true |
| `sortOrder` | number |  | пример: 0 |


**Ответы:** `201`, `401`, `403`

_201 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `name` | string |  | пример: "Main Office" |
| `address` | string |  | пример: "123 Main St" |
| `isActive` | boolean |  | пример: true |
| `sortOrder` | number |  | пример: 0 |
| `createdAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `updatedAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `deletedAt` | string |  | пример: null |

### `GET /api/locations`
Получить список локаций

**Ответы:** `200`

### `PATCH /api/locations/{id}` 🔒
Обновить локацию (только SUPER_ADMIN)

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|


**Ответы:** `200`, `401`, `403`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `name` | string |  | пример: "Main Office" |
| `address` | string |  | пример: "123 Main St" |
| `isActive` | boolean |  | пример: true |
| `sortOrder` | number |  | пример: 0 |
| `createdAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `updatedAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `deletedAt` | string |  | пример: null |

### `DELETE /api/locations/{id}` 🔒
Удалить локацию (мягкое удаление, только SUPER_ADMIN)

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Ответы:** `200`, `401`, `403`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `name` | string |  | пример: "Main Office" |
| `address` | string |  | пример: "123 Main St" |
| `isActive` | boolean |  | пример: true |
| `sortOrder` | number |  | пример: 0 |
| `createdAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `updatedAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `deletedAt` | string |  | пример: null |

## categories

### `POST /api/categories` 🔒
Создать категорию (только SUPER_ADMIN)

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `name` | string | да | пример: "Переговорная" |


**Ответы:** `201`, `401`, `403`

_201 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `name` | string |  | пример: "Переговорная" |
| `isActive` | boolean |  | пример: true |
| `createdAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `updatedAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `deletedAt` | string |  | пример: null |

### `GET /api/categories`
Получить список категорий

**Ответы:** `200`

### `DELETE /api/categories/{id}` 🔒
Удалить категорию (мягкое удаление, только SUPER_ADMIN)

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Ответы:** `200`, `401`, `403`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `name` | string |  | пример: "Переговорная" |
| `isActive` | boolean |  | пример: true |
| `createdAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `updatedAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `deletedAt` | string |  | пример: null |

## cabinets

### `POST /api/cabinets` 🔒
Создать кабинет

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `locationId` | string | да | пример: "uuid-of-location" |
| `categoryIds` | string[] |  | Список идентификаторов категорий для кабинета |
| `name` | string | да | пример: "Cabinet A1" |
| `description` | string |  | пример: "A quiet workspace with a great view." |
| `priceDay` | number | да | пример: 2500 |
| `priceNight` | number | да | пример: 1500 |
| `sortOrder` | number |  | пример: 0 |
| `isActive` | boolean |  | пример: true |


**Ответы:** `201`, `401`, `403`

_201 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `locationId` | string |  | пример: "uuid" |
| `name` | string |  | пример: "Cabinet A1" |
| `description` | string |  | пример: "Quiet workspace" |
| `priceDay` | string |  | пример: "2500.00" |
| `priceNight` | string |  | пример: "1500.00" |
| `sortOrder` | number |  | пример: 0 |
| `isActive` | boolean |  | пример: true |
| `createdAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `updatedAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `deletedAt` | string |  | пример: null |
| `photos` | object[] |  |  |
| `appliancePhotos` | object[] |  |  |
| `cabinetCategories` | object[] |  |  |

### `GET /api/cabinets`
Получить список кабинетов

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `x-location-id` | header | string |  |
| `x-category-ids` | header | string |  |

**Ответы:** `200`

### `GET /api/cabinets/{id}`
Получить кабинет по идентификатору

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Ответы:** `200`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `locationId` | string |  | пример: "uuid" |
| `name` | string |  | пример: "Cabinet A1" |
| `description` | string |  | пример: "Quiet workspace" |
| `priceDay` | string |  | пример: "2500.00" |
| `priceNight` | string |  | пример: "1500.00" |
| `sortOrder` | number |  | пример: 0 |
| `isActive` | boolean |  | пример: true |
| `createdAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `updatedAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `deletedAt` | string |  | пример: null |
| `photos` | object[] |  |  |
| `appliancePhotos` | object[] |  |  |
| `cabinetCategories` | object[] |  |  |
| `bookings` | object[] |  |  |

### `PATCH /api/cabinets/{id}` 🔒
Обновить кабинет

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|


**Ответы:** `200`, `401`, `403`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `locationId` | string |  | пример: "uuid" |
| `name` | string |  | пример: "Cabinet A1" |
| `description` | string |  | пример: "Quiet workspace" |
| `priceDay` | string |  | пример: "2500.00" |
| `priceNight` | string |  | пример: "1500.00" |
| `sortOrder` | number |  | пример: 0 |
| `isActive` | boolean |  | пример: true |
| `createdAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `updatedAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `deletedAt` | string |  | пример: null |
| `photos` | object[] |  |  |
| `appliancePhotos` | object[] |  |  |
| `cabinetCategories` | object[] |  |  |

### `DELETE /api/cabinets/{id}` 🔒
Удалить кабинет (мягкое удаление)

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Ответы:** `200`, `401`, `403`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `locationId` | string |  | пример: "uuid" |
| `name` | string |  | пример: "Cabinet A1" |
| `description` | string |  | пример: "Quiet workspace" |
| `priceDay` | string |  | пример: "2500.00" |
| `priceNight` | string |  | пример: "1500.00" |
| `sortOrder` | number |  | пример: 0 |
| `isActive` | boolean |  | пример: true |
| `createdAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `updatedAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `deletedAt` | string |  | пример: null |
| `photos` | object[] |  |  |
| `appliancePhotos` | object[] |  |  |
| `cabinetCategories` | object[] |  |  |

### `POST /api/cabinets/{id}/photos` 🔒
Добавить фотографии кабинета

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Тело запроса** (`multipart/form-data`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `photos` | string[] | да | One or more photo files. Sort order is assigned automatically. |


**Ответы:** `201`, `401`, `403`

### `GET /api/cabinets/{id}/photos`
Получить фотографии кабинета

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Ответы:** `200`

### `PATCH /api/cabinets/{id}/photos/reorder` 🔒
Изменить порядок фотографий кабинета

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|


**Ответы:** `200`, `401`, `403`

### `DELETE /api/cabinets/{id}/photos/{photoId}` 🔒
Удалить фотографию кабинета

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |
| `photoId` | path | string | да |

**Ответы:** `200`, `401`, `403`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `cabinetId` | string |  | пример: "uuid" |
| `urlOriginal` | string |  | пример: "uploads/original.webp" |
| `urlMedium` | string |  | пример: "uploads/medium.webp" |
| `urlCompressed` | string |  | пример: "uploads/compressed.webp" |
| `sortOrder` | number |  | пример: 0 |
| `createdAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `deletedAt` | string |  | пример: null |

### `POST /api/cabinets/{id}/appliance-photos` 🔒
Добавить фотографии техники/оборудования кабинета

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Тело запроса** (`multipart/form-data`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `photos` | string[] | да | One or more photo files. Sort order is assigned automatically. |


**Ответы:** `201`, `401`, `403`

### `GET /api/cabinets/{id}/appliance-photos`
Получить фотографии техники/оборудования кабинета

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Ответы:** `200`

### `PATCH /api/cabinets/{id}/appliance-photos/reorder` 🔒
Изменить порядок фотографий техники кабинета

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|


**Ответы:** `200`, `401`, `403`

### `DELETE /api/cabinets/{id}/appliance-photos/{photoId}` 🔒
Удалить фотографию техники кабинета

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |
| `photoId` | path | string | да |

**Ответы:** `200`, `401`, `403`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `cabinetId` | string |  | пример: "uuid" |
| `urlOriginal` | string |  | пример: "uploads/appliance-original.webp" |
| `urlMedium` | string |  | пример: "uploads/appliance-medium.webp" |
| `urlCompressed` | string |  | пример: "uploads/appliance-compressed.webp" |
| `sortOrder` | number |  | пример: 0 |
| `createdAt` | string |  | пример: "2026-05-29T00:00:00.000Z" |
| `deletedAt` | string |  | пример: null |

## analytics

### `GET /api/analytics/dashboard` 🔒
Аналитика для дашборда (только SUPER_ADMIN)

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `period` | query | "day" | "month" | "year" | "custom" |  |
| `from` | query | string |  |
| `to` | query | string |  |
| `cabinetId` | query | string |  |

**Ответы:** `200`, `401`, `403`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `period` | object |  |  |
| `revenue` | object |  |  |
| `clients` | object |  |  |
| `bookings` | object |  |  |

## admin

### `POST /api/admin/request` 🔒
Запросить OTP для добавления нового администратора (только SUPER_ADMIN)

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `phone` | string | да | пример: "+77001234567" |
| `name` | string | да | пример: "John" |
| `surname` | string |  | пример: "Doe" |


**Ответы:** `201`, `401`, `403`, `409`

_201 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `message` | string |  | пример: "OTP sent" |
| `phone` | string |  | пример: "+77001234567" |

### `POST /api/admin/confirm` 🔒
Подтвердить OTP и добавить администратора (только SUPER_ADMIN)

**Тело запроса** (`application/json`):
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `phone` | string | да | пример: "+77001234567" |
| `code` | string | да | пример: "123456" |


**Ответы:** `200`, `401`, `403`, `404`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `phone` | string |  | пример: "+77001234567" |
| `name` | string |  | пример: "John" |
| `surname` | string |  | пример: "Doe" |
| `role` | string |  | пример: "ADMIN" |
| `createdAt` | string |  | пример: "2026-01-01T00:00:00.000Z" |

### `GET /api/admin` 🔒
Список всех администраторов (только SUPER_ADMIN)

**Ответы:** `200`, `401`, `403`

### `DELETE /api/admin/{id}` 🔒
Удалить администратора (только SUPER_ADMIN)

**Параметры:**

| Имя | В | Тип | Обяз. |
|---|---|---|---|
| `id` | path | string | да |

**Ответы:** `200`, `401`, `403`, `404`

_200 — _:
| Поле | Тип | Обяз. | Заметки |
|---|---|---|---|
| `id` | string |  | пример: "uuid" |
| `phone` | string |  | пример: "+77001234567" |
| `name` | string |  | пример: "John" |
| `surname` | string |  | пример: "Doe" |
| `role` | string |  | пример: "ADMIN" |
| `createdAt` | string |  | пример: "2026-01-01T00:00:00.000Z" |
