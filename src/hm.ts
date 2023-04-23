import randomWords from 'random-words';
import { messageSendV1 } from './message';

let word = randomWords(1)[0].toLowerCase();
let wrongGuess = 0;
let chosenLetter: string[] = [];
let correctLetter: string[] = [];

const hmDraws: string[] = [`
  +---+
  |   |
      |
      |
      |
      |
=========
`, `
  +---+
  |   |
  O   |
      |
      |
      |
=========
`, `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========
`, `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========
`, `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========
`, `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========
`, `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========
`];

export const letterLeft = () => {
  let retWord = '';
  for (let i = 0; i < word.length; i++) {
    const w = word[i];
    if (correctLetter.includes(w)) {
      retWord += w;
      retWord += ' ';
    } else {
      retWord += '_ ';
    }
  }
  return retWord;
};

export const gameOver = (token: string, channelId: number) => {
  const message = `GAME OVER!\nWord: ${word}\ninput /guess [letter] for new game`;
  wrongGuess = 0;
  chosenLetter = [];
  correctLetter = [];
  word = randomWords(1)[0].toLowerCase();
  messageSendV1(token, channelId, message);
};

export const gameStart = (letter: string, token: string, channelId: number) => {
  if (!chosenLetter.includes(letter) && word.includes(letter)) {
    chosenLetter.push(letter);
    correctLetter.push(letter);
    const retWord = letterLeft();
    if (retWord === word) {
      gameOver(token, channelId);
    } else {
      const message = `CORRECT! ${retWord}`;
      messageSendV1(token, channelId, message);
    }
  } else if (chosenLetter.includes(letter)) {
    const message = 'You have chosen the letter already!';
    messageSendV1(token, channelId, message);
  } else if (!chosenLetter.includes(letter) && !word.includes(letter)) {
    chosenLetter.push(letter);
    wrongGuess += 1;
    if (wrongGuess < 7) {
      const hangman = hmDraws[wrongGuess - 1];
      const retWord = letterLeft();
      const message = `${hangman}\nWRONG! wrong guess: ${wrongGuess}\n ${retWord}`;
      messageSendV1(token, channelId, message);
    } else {
      gameOver(token, channelId);
    }
  }
};
