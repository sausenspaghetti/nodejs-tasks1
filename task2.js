/* 
    2.Написать модуль, который способен выполнять операции с числами любой длины.
    4 метода для сложения, умножения, вычитания и деления.
*/
'use strict';
export { LongInt };

const BASE = 1000 * 1000;
const BASE_SIZE = 6;

class LongInt {
    constructor (digitString) {
        this.digits = [];
        this.sign = digitString[0] == '-' ? -1 : 1;

        if( this.sign == -1) digitString = digitString.slice(1);

        let pos = digitString.length;
        while(pos > 0) {
            let nextDig  = +digitString.substring(Math.max(pos - BASE_SIZE, 0), pos);
            this.digits.push(nextDig);
            pos -= BASE_SIZE;
        }
    }

    toString() {
        let res = this.digits.reduce((total, digit, index) => {
            let digitStr = String(digit);
            if (index != this.digits.length - 1){
                digitStr = '0'.repeat(BASE_SIZE - digitStr.length) + digitStr;
            }
            return digitStr + total
        }, '');
        if (this.sign == -1) res = '-' + res;

        return res;
    }

    fromInt (intNum) {
        let tmp = new LongInt(String(intNum))
        this.assign(tmp);
        // [this.digits, this.sign] = [[...tmp.digits], tmp.sign];
    }


    /*
        Функция возвращает значения, если:
            this > num -> +1
            this = num -> 0
            this < num -> -1

        флаг ignoreSign - для сравнения абсолютных значений.
        Если ignoreSign = true - знаки игнорируются
    */
    compare(num, ignoreSign = false) {
        if ( (num instanceof LongInt) == false) {
            return null;    // Кинуть исключение
        }

        // Число равно само себе
        if (this === num) return 0;

        // Удаляем ведущие нули, если остались
        this._removeZeros();
        num._removeZeros();


        // Сначала сравниваем знаки 2х чисел. Если отличаются,
        // то ничего считать не надо.
        if ( ignoreSign && this.sign != num.sign ) {
            return this.sign > num.sign ? this.sign : -this.sign;
        } 
        
        // Если знаки совпадают, то результат зависит от знака числа.
        // Домножаем это число на конечный результат.
        let res = ignoreSign ? 1 : this.sign;


        if (this.digits.length > num.digits.length) {
            return res;
        }
        else if (this.digits.length < num.digits.length) {
            return -res;
        }
        else {
            for(let i = this.digits.length - 1; i >= 0; i--) {
                if (this.digits[i] != num.digits[i]){
                    return this.digits[i] > num.digits[i] ? +res : -res;
                }
            }
            return 0;
        }
    }


    /*
        Арифметические операции. 
        Умышленно будем поддерживать только операции с LongInt
    */

    sum (num) {
        if ( (num instanceof LongInt) == false) {
            return null; // кинем исключение
        }

        if( this.sign != num.sign ) {
            // Написал немного запутанно во избежание лишнего копирования.
            this.sign = -this.sign;
            this.sub(num);
            this.sign = -this.sign;
            this._removeZeros();
            return this;
        }
        
        let remn = 0;
        for(let pos = 0;  
            pos < Math.max(this.digits.length, num.digits.length) || remn != 0;
            pos++
            ) {
                if (pos == this.digits.length) this.digits.push(0);

                // переполнения не произойдет
                this.digits[pos] += remn + ((pos < num.digits.length) ? num.digits[pos] : 0);
                
                // При сложении остаток не может быть больше 1
                remn = Number(this.digits[pos] >= BASE);
                if(remn) this.digits[pos] -= BASE;
        }

        return this;
    }


    // Нормально работает только, если num < this
    sub (num) {
        if ( (num instanceof LongInt) == false) {
            // кинем исключение
            return null;
        }

        // Если у чисел разные знаки, можно свести к суммированию.
        if( this.sign != num.sign ) {
            this.sign = -this.sign;
            this.sum(num);
            this.sign = -this.sign;
            this._removeZeros();
            return this;
        }

        // Если |this| < |num|, то создаем копию num, из нее вычитаем this,
        // результат присваиваем this.
        if (this.compare(num, true) == -1){
            let tmp = num._copy();
            tmp.sub(this);
            tmp.sign = -tmp.sign;
            this.assign(tmp);
            // [this.digits, this.sign] = [[...tmp.digits], tmp.sign];
            return this;
        }

        // |this| > |num|. Можно вычитать.
        let remn = 0;
        for(let pos = 0; pos < num.digits.length || remn; pos++) {
            this.digits[pos] -= remn + (pos < num.digits.length ? num.digits[pos]: 0);

            remn = +(this.digits[pos] < 0);
            if (remn) this.digits[pos] += BASE;
        }
        this._removeZeros();
        return this;
    }


    mul (num) {
        if( (num instanceof LongInt) == false){
            return null; // бросить исключение
        }
        
        // К этому числу будем прибавлять все остальные
        let total = new LongInt('0');

        // Умножение в столбик
        for(let radix = 0; radix < num.digits.length; radix++) {
            let next = this._mulShort(num.digits[radix]);
            next._shiftRight(radix);
            total.sum(next);
        }

        total.sign = this.sign * num.sign;
        this.assign(total);
        // [this.digits, this.sign] = [total.digits, total.sign];

        return this;
    }

    div (num) {
        if ( (num instanceof LongInt) == false ) {
            return null; // Бросим исключение
        }
        
        let cmp = this.compare(num. true); 
        // Числа равны, по модулю. Результат равен произведению их знаков
        if (cmp == 0) {
            return this.sign * num.sign;
        }
        // |this| < |num| - целочисленное деление дает 0 
        else if (cmp == -1) {
            return 0;
        }

        // |this| >  |num| - содержательный случай
        // Введем временные переменные (чтобы не портить this, num)
        let divisible = this._copy();       // divisible.digits.length = m
        divisible.sign = 1;

        let divider = num._copy();          // divider.digits.length   = n
        divider.sign = 1;

        let remn = divisible._copy();
        let res = new LongInt('');

        // деление в столбик
        while(remn.compare(divider) >= 0) {
            // Нарезаем старшие разряды remn
            let remnSlice = new LongInt('');

            let m = remn.digits.length;
            let n = divider.digits.length;
            remnSlice.digits = remn.digits.slice(Math.max(m - n, 0)); // [pos, m) | m - pos  == n
            // Мало отрезали, режем больше
            if (remnSlice.compare(divider) < 0) {
                remnSlice.digits = remn.digits.slice(Math.max(m - n - 1, 0));
            }

            // бинарным поиском ищем подходящее число, чтобы вычесть.
            let left = 0, right = BASE, x = 0;
            
            while ( left < right ) {
                let mid = Math.floor((right + left) / 2);
                let midTmp = divider._mulShort(mid);
                if ( midTmp.compare(divider) <= 0 ) {
                    x = mid;
                    left = mid + 1;
                }
                else {
                    right = mid - 1;
                }
            }
            res.digits.unshift(x);
            remn.sub(divider._divShort(x)); // remn - x * divider
        }

        res.sign = this.sign * num.sign;
        this.assign(res);

        return this;
    }

    /*
        Деление/умножение на маленькие (меньше BASE по модулю) числа.
        0 <= intNum < BASE
    */
    
    _mulShort(intNum) {
        // intNum is Int
        let res = this._copy();
        res.sign = res.sign * (intNum >= 0 ? 1 : -1);
        intNum = Math.abs(intNum);

        // Умножение в столбик
        let remn = 0;
        for(let i = 0; i < res.digits.length || (remn != 0); i++) {
            if (i == res.digits.length) res.digits.push(0);

            let curr = remn + res.digits[i] * intNum;
            res.digits[i] = (curr) % BASE;
            remn = Math.floor(curr / BASE);
        }

        return res;
    }

    _divShort(intNum) {
        let res = this._copy();
        res.sign = res.sign * (intNum >= 0 ? 1 : -1);
        intNum = Math.abs(intNum);

        // Деление в столбик
        let remn = 0;
        for(let i = res.digits.length - 1; i >= 0; i--) {
            // Переполнения и ошибок точности не произойдет
            let cur = res.digits[i] + remn * BASE;
            res.digits[i] = Math.floor(cur / intNum);
            remn = cur % intNum;
        }

        res._removeZeros();
        return res;
    }


    /*
        Utility functions
    */

    // Удаляет нули в старших разрядах.
    _removeZeros() {
        while(this.digits.length > 0 ) {
            if (this.digits[this.digits.length - 1] != 0) break;
            this.digits.pop();
        } 
    }

    _shiftRight(count=1) {
        this._removeZeros();
        if (this.digits.length > 0 && count != 0) {
            this.digits.unshift(...Array(count).fill(0));
        }
    }

    _shiftLeft(count=1) {
        this._removeZeros();
        if (count <= 0 || this.digits.length == 0) return;

        this.digits = this.digits.splice(0, Math.min(count, this.digits.length));
    }

    _copy() {
        let res = new LongInt('');
        res.digits = [...this.digits];
        res.sign = this.sign;
        return res;
    }

    minus() {
        let tmp = this._copy();
        tmp.sign = -tmp.sign;
        return tmp;
    }

    assign(num) {
        if( (num instanceof LongInt ) == false) return;
        [this.digits, this.sign] = [[...num.digits], num.sign];
    }
};
