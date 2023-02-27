/*
1. Написать модуль, который будет включать в себя следующие методы.
1.1. Преобразование строки к нижнему регистру, но первая буква большая. “Abscd”
1.2. Преобразование строки с целью правильно расстановки пробелов. “Вот пример строки,в которой     используются знаки препинания.После знаков должны стоять пробелы , а перед знаками их быть не должно .    Если есть лишние подряд идущие пробелы, они должны быть устранены.” =>
“Вот пример строки,в которой используются знаки препинания. После знаков должны стоять пробелы, а перед знаками их быть не должно. Если есть лишние подряд идущие пробелы, они должны быть устранены.”
1.3. Посдчитывающие кол-во слов в строке.
1.4. Подсчитывающий, уникальные слова. “Текст, в котором слово текст несколько раз встречается и слово тоже” - в ответе, что “слово - 2 раза, текст - 2 раза, в - 1 раз, несколько - 1 раз“. Самостоятельно придумать наиболее удачную структуру данных для ответа.
*/
'use strict';

export { toUpperLowerCase, removeSpaces, wordsCount, getUniqWords };


/*
    1.1. Преобразование строки к нижнему регистру, но первая буква большая. “Abscd”
*/
function toUpperLowerCase (str) {
    if (str != '')
        return str[0].toUpperCase() + str.slice(1).toLowerCase();
    return '';
}

/*
    1.2. Преобразование строки с целью правильной расстановки пробелов.
*/
function removeSpaces (text) {
    text = text
        .replace(/(\s)+/g, '$1')                // Не более одного пробела подряд
        .replace(/\s*([,.!?]+)\s*/g, '$1 ')     // Знаки пунктуации имеют пробел после них и не имеют перед
        .replace(/\s*$/, '')                    // Убираем все пробелы в конце строкт
        .replace(/^\s*/, '');                   // Убираем все пробелы в начале строки
    
    return text;
}


/*
    1.3. Функция подсчитывающие кол-во слов в строке.
*/
function wordsCount (text) {
    return getWordsArray(text).length;
}

/*
    1.4. Функция подсчитывающая, уникальные слова.
*/
function getUniqWords (text) {
    let store = new Map();
    let words = getWordsArray(text);
    for(let word of words) {
        if (store.has(word)) {
            store.set(word, store.get(word) + 1);  // ??
        }
        else {
            store.set(word, 1);
        }
    }
    return store;
}




/*
    some additional functions
*/

function isSpace (char) {
    return char == ' ';
}

function isPunctuationMark (char) {
    let punctuation_marks = [',', '.', ':', '!', '?'];
    return punctuation_marks.includes(char) == true;
}

/*
    Функция, возвращающая массив слов.
*/
function getWordsArray (text) {
    let res = text
        .split(/[\s,.!?:;]/)                            // разбиваем текст по пробелам/знакам пунктуации
        .filter(word => word == '' ? false : true)      // удаляем пустые слова
        .map(word => word.toLowerCase());               // приводим все нижнему регистру
    return res;
}

