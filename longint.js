/*
    TODO:
        1. Как присваивать this, это вообще возможно ?
        2. Доделать sub, чтобы работало с this < num (!!!)
        3. toString - пофиксить прикол с нулями

        4. Реализовать умножение
        5. Подумать как реализовать деление

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
        [this.digits, this.sign] = [[...tmp.digits], tmp.sign];
    }


    /*
        Функция возвращает значения, если:
            this > num -> +1
            this = num -> 0
            this < num -> -1

        флаг ignoreSing - для сравнения абсолютных значений.
        Если ignoreSigh = true - знаки игнорируются
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
            this.sign = -this.sigh;
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
            [this.digits, this.sign] = [[...tmp.digits], tmp.sign];
            return this;
        }

        // |this| > |num| . Можно вычитать.
        let remn = 0;
        for(let pos = 0; pos < num.digits.length; pos++) {
            this.digits[pos] -= remn + (pos < num.digits.length ? num.digits[pos]: pos);
            remn = this.digits[pos] < 0;
            if (remn) this.digits[pos] += BASE;
        }
        this._removeZeros();
        return this;
    }




    /*
        Utility functions
    */

    // Удаляет нули в старших разрядах.
    _removeZeros() {
        while(this.digits.length > 0 ){
            if (this.digits[this.digits.length - 1] != 0) break;
            this.digits.pop();
        } 
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


};
