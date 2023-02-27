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

export { Product, filterProducts, parseString, applyFilters };


// Класс-хранилище. Нет смысла засовывать в него метод, который парсит строку
class Product {
    constructor({name, price, quantity, description}) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.description = description;
    }
}
/*
    Принимает массив Product и строку-условие. Возвращает массив,
    удовлетворяющий критериям отбора.
*/
function filterProducts (conditions, arrayProduct) {
    if (arrayProduct.length == 0) return [];

    // Возвращает объект с правилами отбора
    let filterCollection = parseString(conditions);

    // Применяем правила к массиву
    let res = arrayProduct.filter(product => applyFilters(filterCollection, product) == true);

    return res;
}


/*
    Парсит строку, возвращает объект с коллекцией фильтров 
    (небольшой оверинжиниринг).
*/
//  TODO: немного криво написано. Переделать позже
function parseString (str) {
    let res = {};

    for(let substr of str.split('&')) {
        let tmp = substr.split('-').filter(lexeme => lexeme == '' ? false : true);
        let value;
        let determ;
        // числовой
        if (tmp.length == 2) {
            // Использую то, что знаки стравнения не занимают больше 2х char
            if ( isFinite(tmp[1].slice(1)) ){
                value = +tmp[1].slice(1);
                determ = tmp[1].slice(0, 1);
            }
            // isFinite(tmp[1].slice(2)) == true 
            else {
                value = +tmp[1].slice(2);
                determ = tmp[1].slice(0, 2);
            }
        }
        // строковый
        else if (tmp.length == 3) {
            determ = tmp[1];
            value  = tmp[2];
        }

        res[tmp[0]] = {
            determ,
            value,
        }

    }

    // TODO: Добавить проверку на корректность?
    return res;

}

/*
    true - если объект удовлетворяет фильтрам
    false - иначе
*/
function applyFilters(filterCollection, product) {

    for(let filt in filterCollection) {
        if(filterCollection[filt] === undefined) continue;

        if( product[filt] === undefined )  continue;

        let {value, determ} = filterCollection[filt];

        // строковый
        if ( ['name', 'description'].includes(filt) ) {
            if ( _stringFilter(determ, value, product[filt] ) == false ){
                return false;
            } 
        }
        // числовой
        else if ( ['price', 'quantity'].includes(filt) ) {
            if ( _numberFilter(determ, value, product[filt] ) == false ) {
                return false;
            }
        }
        else {
            // произошло что-то плохое, кинуть исключение
        }
    }

    return true;
}

function _stringFilter(keyWord, pattern, word) {
    switch(keyWord) {
        case 'contains':
            return word.includes(pattern);
        case 'ends':
            return word.endsWith(pattern);
        case 'starts':
            return word.startsWith(pattern);
        default:
            return undefined;       // что-то пошло не так
    }
}

// <, =, >, <=, >=
function _numberFilter( keyWord, pattern, digit ) {
    [ digit, pattern ] = [ +digit, +pattern ];

    switch (keyWord) {
        case '<':
            return digit < pattern;
        case '=':
            return digit == pattern;
        case '>':
            return digit > pattern;
        case '<=':
            return digit <= pattern;
        case '>=':
            return digit >= pattern;
        default:
            return undefined;
    }
}