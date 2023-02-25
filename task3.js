/*
3. Создать класс данных “Товар”
С полями
Название
Цена
Количество
Описание
Наполнить массив объектами такого класса.
Написать метод, который получает строку вида
“name-contains-fd&price-=2-&quantity->5&description-ends-abc”
“name-starts-fd&quantity=5”
На выходе возвращает массив, только с подходящими объектами
возможны (contains, starts, ends для строковых и <, =, >, <=, >= для числовых
*/
'use strict';


// Класс-хранилище. Нет смысла засовывать в него метод, который парсит строку
class Product {
    constructor({name, price, quantity, description}) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.description = description;
    }
}

function filterProducts (conditions, arrayProduct) {
    if (arrayProduct.length == 0) return [];

    let filterCollection = parseString(conditions);
    let res = [];
    for(let product of arrayProduct){
        if (applyFilters(filterCollection, product) == true) {
            res.push(product);
        }
    }
    return res;
}


/*
    Парсит строку, возвращает объект с коллекцией фильтров 
    (небольшой оверинжиниринг).
*/
function parseString (str) {
    // Пример: “name-contains-fd&price-=2-&quantity->5&description-ends-abc”
    // (contains, starts, ends для строковых и <, =, >, <=, >=

    let res = {};
    for(let filt of ['name', 'price', 'quantity', 'description']){
        res[filt] = {determ: null, value: null};
    } 

    for(let substr of str.split('&')) {
        let tmp = substr.split('-').filter(lexeme => lexeme == '' ? false : true);
        // числовой
        if (tmp.length == 2) {
            res[tmp[0]] = {
                
            }
        }
        // строковый
        else if (tmp.length == 3) {
            res[tmp[0]] = {
                determ: tmp[1],
                value: tmp[2],
            }
        }
    }

    // Добавить некоторую расширяемость
    return {
        name : {
            determ: 'contain',
            value: 'fd',
        },
        price: {
            determ: '=',
            value: 2.
        },
        quantity: {
            determ: '>',
            value: 5,
        },
        description: {
            determ: 'ends',
            value: 'abc'
        }
    }
}
/*
    true - если объект удовлетворяет фильтрам
    false - иначе
*/
function applyFilters(filterCollection, product) {

    for(let filt in filterCollection) {
        if(filterCollection[filt] === undefined) continue;



    }

    return true;
}