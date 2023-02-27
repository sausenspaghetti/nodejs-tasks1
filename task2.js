/* 
    2.Написать модуль, который способен выполнять операции с числами любой длины.
    4 метода для сложения, умножения, вычитания и деления.
*/

export { sum, sub, div, mul };


function sum(firstVal, secondVal) {
    return BigInt(firstVal) + BigInt(secondVal);
}

function sub(firstVal, secondVal) {
    return BigInt(firstVal) - BigInt(secondVal);
}

function div(firstVal, secondVal) {
    return BigInt(firstVal) / BigInt(secondVal);
}

function mul(firstVal, secondVal) {
    return BigInt(firstVal) * BigInt(secondVal);
}
