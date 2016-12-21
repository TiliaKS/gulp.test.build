# P2H gulp build

Версия node.js должна быть не ниже 4-й. Версия npm должна быть не ниже 3-й.
например
`npm version`
При необходимости обновляем ноду до последней [https://nodejs.org](https://nodejs.org).
Сам npm можно обновить так `npm -g install npm@4`
![](https://s3.amazonaws.com/scrstorage/6sd3230pu2u1445667.jpg)

На данный момент работают эти версии Gulp. `npm install gulpjs/gulp-cli -g`
![](https://s3.amazonaws.com/scrstorage/5h28018x17r5v87dyv47.jpg)

Далее качаем себе сборку. Когда скачаете сборку, то увидите такое:  
![](https://s3.amazonaws.com/scrstorage/632so7633k92606n0.jpg)  
удаляем этот файлик  
![](https://s3.amazonaws.com/scrstorage/632805yb279w3utt673.jpg)  
и подобные этому  
![](https://s3.amazonaws.com/scrstorage/6328ixu6f07373513.jpg)  

Следующим шагом будет - это установить модули, т.е в корне папки, там где gulpfile.js, запускаем в консоле `npm i`;
Пакеты устанавливаются лишь один раз для конкретной сборки.

Когда всё установилось, то можно уже использовать сборку. Основные команды:

- `gulp` - запустить проект
- `gulp dist` - выполнить перед постановкой на QA. Форматируется css в "красивый" вид, ужимаются картинки, удаляются source мапы
- `gulp clear` - удаляет папку public
- `gulp build` - единожды компилит проект в папку public
- `gulp server` - просто запускает сервер, можно запускать в случае, когда не нужно ничего компилить, а просто посмотреть например страничку где есть XMLHTTPRequest (ajax)

После запуска проекта/компиляции будет две папки `dev` и `public`. ***Работаем только в папке `dev`, в папку 'public' не лезем и ничего туда не копируем, gulp всё сделает за Вас.*** Т.е будет так: в папке 'dev' мы работаем, а с папки `public` смотрим. В папке `dev` есть папка `assets`. В нее помещаем всё то, что не подлежит компиляции, а просто нужно скопировать. В данном случае это папочки `images` и `fonts`. Т.е любые статичные файлы, например это может быть еще папочка `inc`, `media`.  
![](https://s3.amazonaws.com/scrstorage/6g337m22p3465883.jpg)

## Устанавливаем `sass-lint`;
Это нужно для того, чтобы код scss был написан в оной стилистике. За его настройки отвечает этот файлик 
![](https://s3.amazonaws.com/scrstorage/6339v2653o66b254.jpg)  
Для того, чтобы установить линт на компьютер, в консоли запускаем `npm install -g sass-lint`.
В sublime устанавливаем этот модуль `SublimeLinter-contrib-sass-lint`.

