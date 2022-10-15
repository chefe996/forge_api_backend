**БЕЗ ДОКЕРА**
Установить node 12:
*https://computingforgeeks.com/how-to-install-nodejs-on-ubuntu-debian-linux-mint/* 

    sudo apt update
    sudo apt -y upgrade
    sudo apt update
    sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt -y install nodejs
    sudo apt -y  install gcc g++ make

проверяем: 

    $ node --version
    v12.10.0
    $ npm --version
    6.10.3

Устанавливаем зависимости:

    npm install
Запускаем сервер:

    node server.js

**первоначальная настройка**
перед первым использованием надо выполнить команду по созданию Контейнера API FORGE:

    curl http://127.0.0.1:3000/bucket_create

Возможно потребуется открыть порт 3000 на сервере:

    sudo iptables -t filter -A INPUT -p tcp --dport 3000 -j ACCEPT
