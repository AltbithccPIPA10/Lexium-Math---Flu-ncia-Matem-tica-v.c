/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Difficulty, OperationType, MathQuestion } from "../types";

export function generateQuestion(
  difficulties: Difficulty,
  operationTypes: OperationType[]
): MathQuestion {
  // Safe fallback if operations list is empty
  const operations = operationTypes.length > 0 ? operationTypes : [OperationType.SOMA];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1 = 5;
  let num2 = 4;
  let correctAnswer = 9;

  if (difficulties === Difficulty.BASICO) {
    if (operation === OperationType.SOMA) {
      num1 = Math.floor(Math.random() * 8) + 1; // 1 to 8
      num2 = Math.floor(Math.random() * 8) + 1; // 1 to 8
      correctAnswer = num1 + num2;
    } else if (operation === OperationType.SUBTRACAO) {
      num1 = Math.floor(Math.random() * 8) + 5; // 5 to 12
      num2 = Math.floor(Math.random() * num1) + 1; // 1 to num1
      correctAnswer = num1 - num2;
    } else if (operation === OperationType.MULTIPLICACAO) {
      num1 = Math.floor(Math.random() * 5) + 1; // 1 to 5
      num2 = Math.floor(Math.random() * 5) + 1; // 1 to 5
      correctAnswer = num1 * num2;
    } else { // DIVISAO
      num2 = Math.floor(Math.random() * 4) + 1; // 1 to 4
      correctAnswer = Math.floor(Math.random() * 4) + 1; // 1 to 4
      num1 = num2 * correctAnswer;
    }
  } else if (difficulties === Difficulty.INTERMEDIARIO) {
    if (operation === OperationType.SOMA) {
      num1 = Math.floor(Math.random() * 19) + 6; // 6 to 24
      num2 = Math.floor(Math.random() * 19) + 6; // 6 to 24
      correctAnswer = num1 + num2;
    } else if (operation === OperationType.SUBTRACAO) {
      num1 = Math.floor(Math.random() * 25) + 15; // 15 to 40
      num2 = Math.floor(Math.random() * 14) + 5;  // 5 to 18
      correctAnswer = num1 - num2;
    } else if (operation === OperationType.MULTIPLICACAO) {
      num1 = Math.floor(Math.random() * 7) + 3; // 3 to 9
      num2 = Math.floor(Math.random() * 6) + 2; // 2 to 7
      correctAnswer = num1 * num2;
    } else { // DIVISAO
      num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
      correctAnswer = Math.floor(Math.random() * 8) + 2; // 2 to 9
      num1 = num2 * correctAnswer;
    }
  } else { // AVANCADO
    if (operation === OperationType.SOMA) {
      num1 = Math.floor(Math.random() * 50) + 20; // 20 to 70
      num2 = Math.floor(Math.random() * 50) + 20; // 20 to 70
      correctAnswer = num1 + num2;
    } else if (operation === OperationType.SUBTRACAO) {
      num1 = Math.floor(Math.random() * 80) + 40; // 40 to 120
      num2 = Math.floor(Math.random() * 38) + 10; // 10 to 48
      correctAnswer = num1 - num2;
    } else if (operation === OperationType.MULTIPLICACAO) {
      num1 = Math.floor(Math.random() * 10) + 3; // 3 to 12
      num2 = Math.floor(Math.random() * 10) + 3; // 3 to 12
      correctAnswer = num1 * num2;
    } else { // DIVISAO
      num2 = Math.floor(Math.random() * 11) + 3; // 3 to 13
      correctAnswer = Math.floor(Math.random() * 10) + 3; // 3 to 12
      num1 = num2 * correctAnswer;
    }
  }

  const opSign = operation;
  const stimulusText = `${num1} ${opSign} ${num2}`;
  
  return {
    id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    num1,
    num2,
    operation,
    correctAnswer,
    stimulusText
  };
}

// Convert numbers to Portuguese strings (e.g. 5 -> "cinco", 9 -> "nove")
// This helps the simulator and grading comparisons!
export function numberToPortuguese(num: number): string {
  const dictionary: { [key: number]: string } = {
    0: "zero",
    1: "um",
    2: "dois",
    3: "três",
    4: "quatro",
    5: "cinco",
    6: "seis",
    7: "sete",
    8: "oito",
    9: "nove",
    10: "dez",
    11: "onze",
    12: "doze",
    13: "treze",
    14: "quatorze",
    15: "quinze",
    16: "dezesseis",
    17: "dezessete",
    18: "dezoito",
    19: "dezenove",
    20: "vinte",
    30: "trinta",
    40: "quarenta",
    50: "cinquenta",
    60: "sessenta",
    70: "setenta",
    80: "oitenta",
    90: "noventa",
    100: "cem"
  };

  if (dictionary[num]) return dictionary[num];

  if (num > 20 && num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const units = num % 10;
    return `${dictionary[tens]} e ${dictionary[units]}`;
  }

  return String(num);
}
