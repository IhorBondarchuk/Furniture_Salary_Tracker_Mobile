# Верстак — мобільний застосунок

React Native (Expo) версія [Furniture_Salary_Tracker_Frontend](../Furniture_Salary_Tracker_Frontend): облік зарплат меблевих бригад для працівників і адміністраторів. Працює з тим самим бекендом.

## Можливості

- Вхід / реєстрація з вибором ролі (для адміністратора — код адміністратора)
- **Працівник:** додавання записів (пошук позиції в каталозі, кількість, дата), підсумок заробітку за період, історія з режимом редагування (зміна та видалення записів)
- **Адміністратор:** каталог меблів (додавання, редагування, видалення), загальна виплата, топ позиція, записи всіх працівників за період
- Мови UA / PL / EN — вибір зберігається на пристрої
- Pull-to-refresh на панелях

## Запуск

```bash
npm install
npx expo start
```

Відскануйте QR-код у Expo Go (Android) або камерою (iOS). Усі використані нативні модулі (AsyncStorage, DateTimePicker) є в Expo Go, тож dev-збірка не потрібна.

- `npm run android` / `npm run ios` — відкрити в емуляторі
- `npm run web` — веб-версія (без нативного календаря: дата вводиться як `YYYY-MM-DD`)
- `npm run typecheck` — перевірка типів

## Бекенд

За замовчуванням використовується `https://furniture-salary-tracker-beckend.onrender.com/api`. Щоб змінити, створіть `.env.local` за зразком `.env.example`:

```
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:4000/api
```

`10.0.2.2` — це localhost хост-машини з емулятора Android; для реального телефона вкажіть IP комп'ютера в локальній мережі.

Refresh-токен бекенд віддає в httpOnly-cookie. Нативний `fetch` зберігає cookies сам, тому сесія відновлюється після перезапуску застосунку без змін на бекенді. Для веб-версії origin dev-сервера (`http://localhost:8081`) має бути дозволений у CORS бекенду.

## Структура

```
src/app/            маршрути Expo Router: index, login, register, worker, admin
src/components/     UI (Button, Input, Combobox, DateField, Segmented, Card), layout, records
src/lib/            API-клієнт, zustand-стори (AsyncStorage), i18n-словники, утиліти, тема
```

API-шар, типи та словники перенесені з вебфронтенду майже без змін.
