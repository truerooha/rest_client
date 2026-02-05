# Обед в Офис - Mini App

Telegram Mini App для заказа корпоративных обедов.

## Технологии

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **@twa-dev/sdk** (Telegram Mini App SDK)

## Структура

```
client/
├── app/                    # Страницы Next.js (App Router)
│   ├── page.tsx            # Главная (выбор здания)
│   ├── restaurants/        # Список ресторанов
│   ├── menu/               # Меню ресторана
│   └── cart/               # Корзина
├── lib/                    # Библиотеки и утилиты
│   ├── api.ts              # API клиент для backend
│   ├── telegram.tsx        # Telegram Context Provider
│   └── cart.tsx            # Cart Context Provider
└── public/                 # Статические файлы
```

## Локальная разработка

1. Установите зависимости:
```bash
npm install
```

2. Создайте `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Запустите dev сервер:
```bash
npm run dev
```

Приложение будет доступно на http://localhost:3001

## Деплой на Vercel

1. Установите Vercel CLI:
```bash
npm install -g vercel
```

2. Залогиньтесь:
```bash
vercel login
```

3. Деплой:
```bash
vercel --prod
```

4. Добавьте environment variables в Vercel:
   - `NEXT_PUBLIC_API_URL` - URL вашего API на Railway

## Подключение к Telegram боту

1. Получите URL вашего Mini App на Vercel (например, `https://your-app.vercel.app`)

2. В настройках бота через @BotFather установите Mini App URL:
```
/setmenubutton
```

3. Обновите переменную `MINI_APP_URL` в backend `.env`:
```
MINI_APP_URL=https://your-app.vercel.app
```

## Особенности

- **Client-side rendering**: Все страницы рендерятся на клиенте
- **Telegram SDK**: Интеграция с MainButton, HapticFeedback
- **Context API**: Управление состоянием через React Context
- **Responsive**: Адаптивный дизайн для мобильных устройств

## Страницы

### `/` - Главная
Выбор здания/офиса. При первом запуске пользователь выбирает здание, которое сохраняется в профиле.

### `/restaurants` - Рестораны
Список ресторанов доступных в выбранном здании.

### `/menu` - Меню
Меню выбранного ресторана с категориями. Можно добавлять блюда в корзину.

### `/cart` - Корзина
Просмотр и управление заказом. Изменение количества, удаление блюд, оформление заказа (в разработке).

## API Endpoints

Все endpoints находятся в `lib/api.ts`:

- `GET /api/buildings` - список зданий
- `GET /api/restaurants?buildingId={id}` - рестораны по зданию
- `GET /api/menu/{restaurantId}` - меню ресторана
- `POST /api/user` - создание/обновление пользователя
- `POST /api/orders` - создание заказа

## Следующие шаги

- [ ] Реализовать оформление заказа
- [ ] Добавить выбор слота доставки
- [ ] Интегрировать оплату
- [ ] Добавить историю заказов
- [ ] Добавить уведомления о статусе заказа
