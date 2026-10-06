## Методы

| Метод | URL | Тело | Ответ |
|---|---|---|---|
| GET | `/api/appliances?minPower=` | — | Опубликованные услуги. `minPower` оставляет приборы с мощностью не ниже значения. Пустое значение или `0` показывает все. У каждой строки `isOwner`: `1`, если создатель совпадает с текущим пользователем, иначе `0` |
| GET | `/api/appliances/feed` | — | Первая опубликованная услуга, одна строка из базы. `isLiked`: `1`, если текущий пользователь её лайкнул, иначе `0` |
| GET | `/api/appliances/feed/:id?next=true` | — | Опубликованная услуга по id. `next=true` открывает следующую опубликованную после этого id |
| GET | `/api/appliances/draft` | — | Единственный черновик текущего пользователя. Если его нет, ответ `404` |
| POST | `/api/appliances` | `multipart/form-data`: `applianceName`, `description`, `powerWatts`, `minTemperature`, файлы `image` и `video` | Создаёт черновик. Если черновик уже есть, обновляет его поля и файлы. Имена файлов генерируются на латинице и записываются в `image_url` и `video_url`, сами файлы сохраняются в MinIO |
| PUT | `/api/appliances/draft` | JSON: `description`, `powerWatts`, `minTemperature` | Публикует черновик: статус становится `published`, заполняется `formatted_at` |
| DELETE | `/api/appliances/:id` | — | Мягкое удаление только своей услуги: статус становится `deleted`, заполняется `completed_at` |
| POST | `/api/appliances/:id/like` | JSON: `value` равен `0` или `1` | `1` ставит лайк текущего пользователя, `0` снимает его |
| POST | `/api/users/register` | JSON: `userName`, `email`, `password` | Новый пользователь без пароля в ответе, код `201` |
| POST | `/api/users/login` | — | Заглушка аутентификации |
| POST | `/api/users/logout` | — | Заглушка деавторизации |

Удалённые услуги в ответах не передаются. Вернуть услугу в черновик нельзя. Идентификатор, статус, создатель, модератор и даты в теле запроса не принимаются.

## Таблицы

### users

| Поле | Тип | Ограничение |
|---|---|---|
| user_id | integer | первичный ключ |
| user_name | varchar(128) | уникальное, не пустое |
| email | varchar(64) | уникальное, не пустое |
| password | varchar(64) | не пустое |

### appliances

| Поле | Тип | Ограничение |
|---|---|---|
| appliance_id | integer | первичный ключ |
| appliance_name | varchar(256) | не пустое |
| appliance_description | text | краткое описание |
| publication_status | varchar(32) | `draft`, `published` или `deleted` |
| image_url | varchar(512) | имя файла в MinIO |
| video_url | varchar(512) | имя файла в MinIO |
| power_watts | integer | мощность, Вт |
| min_temperature | integer | минимальная температура, °C |
| created_at | timestamp | дата создания |
| formatted_at | timestamp | дата формирования |
| completed_at | timestamp | дата завершения |
| creator_id | integer | внешний ключ на `users.user_id` |
| moderator_id | integer | внешний ключ на `users.user_id` |

У одного создателя не больше одного черновика.

### likes

| Поле | Тип | Ограничение |
|---|---|---|
| like_id | integer | первичный ключ |
| user_id | integer | внешний ключ на `users.user_id` |
| appliance_id | integer | внешний ключ на `appliances.appliance_id` |

Пара `user_id` и `appliance_id` уникальна. Каскадное удаление по внешним ключам запрещено.
