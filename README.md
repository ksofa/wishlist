# Wishlist - Сервис Списков Желаний

Wishlist - это полнофункциональное веб-приложение для создания и управления списками желаний. Позволяет пользователям регистрироваться, создавать персональные списки желаний, добавлять в них товары и делиться с друзьями.

## Реализованные функции

- 🔐 **Аутентификация:** регистрация и вход пользователей с использованием JWT
- 📋 **Управление списками желаний:** создание, чтение, обновление и удаление списков
- 🎁 **Управление элементами:** добавление, обновление и удаление товаров в списках
- 🔄 **Drag-and-drop интерфейс:** для удобного изменения порядка элементов
- 📊 **Мониторинг:** Prometheus метрики и логирование с ELK-стеком
- 🚀 **Kubernetes деплой:** полный набор манифестов для развертывания в кластере

## Технический стек

### Backend
- Go (Golang)
- Gin web framework
- PostgreSQL с GORM для ORM
- JWT для аутентификации
- Zap для логирования
- Prometheus для метрик
- Swagger для документации API

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Query для управления состоянием
- React Router для навигации

### Инфраструктура
- Docker и Docker Compose
- Kubernetes
- Fluent Bit для сбора логов
- Elasticsearch для хранения логов
- GitHub Actions для CI/CD

## Запуск проекта

### Предварительные требования
- Go 1.21+
- Node.js 18+
- PostgreSQL 13+
- Docker и Docker Compose (опционально)
- Kubernetes кластер (для полного деплоя)

### Локальная разработка

1. **Клонирование репозитория**
   ```bash
   git clone https://github.com/yourusername/wishlist.git
   cd wishlist
   ```

2. **Настройка переменных окружения**
   ```bash
   cp .env.example .env
   # Отредактируйте .env файл, указав свои параметры
   ```

3. **Запуск базы данных**
   ```bash
   # Создание пользователя и базы данных PostgreSQL
   createuser -P wishlist
   createdb -O wishlist wishlist
   
   # Или с использованием Docker
   docker run -d --name wishlist-postgres -p 5432:5432 -e POSTGRES_USER=wishlist -e POSTGRES_PASSWORD=wishlist -e POSTGRES_DB=wishlist postgres:13
   ```

4. **Запуск миграций**
   ```bash
   go run cmd/migrate/main.go
   ```

5. **Запуск бэкенда**
   ```bash
   go run cmd/api/main.go
   ```

6. **Запуск фронтенда**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. **Доступ к приложению**
   Откройте браузер и перейдите по адресу http://localhost:5173

### Запуск с использованием Docker Compose

1. **Клонирование репозитория**
   ```bash
   git clone https://github.com/yourusername/wishlist.git
   cd wishlist
   ```

2. **Сборка и запуск контейнеров**
   ```bash
   docker-compose up -d
   ```

3. **Доступ к приложению**
   Откройте браузер и перейдите по адресу http://localhost:8080

### Деплой в Kubernetes

1. **Клонирование репозитория**
   ```bash
   git clone https://github.com/yourusername/wishlist.git
   cd wishlist
   ```

2. **Установка Kubernetes-ресурсов**
   ```bash
   # Создание отдельного namespace
   kubectl create namespace wishlist
   
   # Применение всех манифестов
   kubectl apply -k deployments/kubernetes/
   ```

3. **Проверка статуса развертывания**
   ```bash
   kubectl -n wishlist get pods
   kubectl -n wishlist get services
   kubectl -n wishlist get ingress
   ```

4. **Настройка DNS (для продакшена)**
   Добавьте записи в вашу DNS-зону, указывающие на IP-адрес Ingress:
   - wishlist.example.com
   - api.wishlist.example.com

5. **Доступ к приложению**
   Откройте браузер и перейдите по адресу http://wishlist.example.com

## Структура проекта

```
wishlist/
├── cmd/                    # Точки входа приложения
│   ├── api/                # Основной API-сервер
│   ├── app/                # Полный сервер с Swagger, метриками и пр.
│   └── migrate/            # Утилита для миграций
├── deployments/            # Конфигурации для деплоя
│   ├── docker/             # Dockerfile
│   └── kubernetes/         # Kubernetes манифесты
├── docs/                   # Документация и Swagger-спецификации
├── frontend/               # React-приложение
│   ├── src/                
│   │   ├── api/            # Клиент API
│   │   ├── components/     # React-компоненты
│   │   └── ...
│   └── ...
├── internal/               # Внутренние пакеты приложения
│   ├── api/                # API-уровень
│   │   ├── handlers/       # Обработчики запросов
│   │   └── middleware/     # Промежуточное ПО
│   ├── auth/               # Аутентификация
│   ├── config/             # Конфигурация
│   ├── domain/             # Бизнес-модели
│   ├── observability/      # Логирование и метрики
│   ├── repository/         # Доступ к данным
│   ├── service/            # Бизнес-логика
│   └── validation/         # Валидация
└── migrations/             # SQL-миграции
```

## API-эндпоинты

### Аутентификация
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход пользователя

### Списки желаний
- `GET /api/wishlists` - Получение всех списков пользователя
- `GET /api/wishlists/:id` - Получение конкретного списка
- `POST /api/wishlists` - Создание нового списка
- `PUT /api/wishlists/:id` - Обновление списка
- `DELETE /api/wishlists/:id` - Удаление списка

### Элементы списка
- `POST /api/wishlists/:id/items` - Добавление элемента в список
- `PUT /api/wishlists/:id/items/:itemId` - Обновление элемента
- `DELETE /api/wishlists/:id/items/:itemId` - Удаление элемента

## Мониторинг и логирование

- **Метрики Prometheus:** доступны по адресу `/metrics`
- **Логи:** собираются с помощью Fluent Bit и хранятся в Elasticsearch
- **Документация API:** доступна по адресу `/swagger/index.html`

## Тестирование

```bash
# Запуск всех тестов
go test ./...

# Запуск определенного пакета тестов
go test ./internal/service/...

# Создание тестовой базы данных
createdb -U wishlist wishlist_test
```

## Лицензия

MIT 