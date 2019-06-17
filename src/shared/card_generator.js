function parseCards(number, suit) {
  let NUMBERS = [...Array(11).keys()].slice(1,11);
  NUMBERS[0] = "Ace";
  NUMBERS = NUMBERS.concat(["Jack","Queen","King"]);
  let SUIT =  suit.charAt(0).toUpperCase() + suit.slice(1) + "s";

  return NUMBERS[number-1] + " of " + SUIT;
}

export { parseCards };
