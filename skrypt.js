
const pola = document.querySelectorAll("td");
const res = document.querySelector("#reset");

let strzal = null;
let oddanyStrzal = 0;
let maxStrzal = 20;

// Model gry
var model = {
	boardSize: 7,
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0,
	
	ships: [
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
	],

	fire: function(guess) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			var index = ship.locations.indexOf(guess);

			if (ship.hits[index] === "hit") {
				view.displayMessage("Ups, już wcześnej trafiłeś to pole!");
				view.displayStrzaly("Oddanych strzałów: " + oddanyStrzal);
				view.displayAmunicja("Torped: " + maxStrzal);
				return true;
			} else if (index >= 0) {
				ship.hits[index] = "hit";
				view.displayHit(guess);
				view.displayMessage("Trafiony!");
				view.displayStrzaly("Oddanych strzałów: " + oddanyStrzal);
				view.displayAmunicja("Torped: " + maxStrzal);

				if (this.isSunk(ship)) {
					view.displayMessage("Zatopiłeś okręt!");
					this.shipsSunk++;
					view.displayOkrety("Zatopionych okrętów: " + this.shipsSunk);
				}
				return true;
			}
		}

		view.displayMiss(guess);
		view.displayMessage("Spudłowałeś!");
		view.displayStrzaly("Oddanych strzałów: " + oddanyStrzal);
		view.displayAmunicja("Torped: " + maxStrzal);

		return false;
	},

	isSunk: function(ship) {
		for (var i = 0; i < this.shipLength; i++)  {
			if (ship.hits[i] !== "hit") {
				return false;
			}
		}
	    return true;
	},

	generateShipLocations: function() {
		var locations;
		for (var i = 0; i < this.numShips; i++) {
			do {
				locations = this.generateShip();
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
	},

	generateShip: function() {
		var direction = Math.floor(Math.random() * 2);
		var row, col;

		if (direction === 1) { // W poziomie.
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
		} else { // W pionie.
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
			col = Math.floor(Math.random() * this.boardSize);
		}

		var newShipLocations = [];
		for (var i = 0; i < this.shipLength; i++) {
			if (direction === 1) {
				newShipLocations.push(row + "" + (col + i));
			} else {
				newShipLocations.push((row + i) + "" + col);
			}
		}
		return newShipLocations;
	},

	collision: function(locations) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			for (var j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) {
					return true;
				}
			}
		}
		return false;
	}
	
};

// Widok gry
var view = {
	displayMessage: function(msg) {
		var messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
	},

	displayHit: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "hit");
	},

	displayMiss: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "miss");
	},

	displayRemoveHit: function(location) {
		var cell = document.getElementById(location);
		cell.removeAttribute("class", "hit");
	},

	displayRemoveMiss: function(location) {
		var cell = document.getElementById(location);
		cell.removeAttribute("class", "miss");
	},

	displayStrzaly: function(msg) {
		var strzaly = document.getElementById("strzaly");
		strzaly.innerHTML = msg;
	},

	displayOkrety: function(msg) {
		var okrety = document.getElementById("okrety");
		okrety.innerHTML = msg;
	},

	displayAmunicja: function(msg) {
		var amunicja = document.getElementById("amunicja");
		amunicja.innerHTML = msg;
	}

};

// Kontroler gry
var controller = {
	guesses: 0,

	processGuess: function(guess) {
		var location = guess;
			maxStrzal--;
			oddanyStrzal++;

		if (location) {
			this.guesses++;
			var hit = model.fire(location);
			if (hit && model.shipsSunk === model.numShips) {

				view.displayMessage("Wygrałeś! Zatopiłeś wszystkie okręty w " + this.guesses + " próbach.");
				blokowaniePol();
				res.style.display = "block";

			}else if(this.guesses >= 20) {
					view.displayMessage("Przegrałeś! Oddałeś " + this.guesses + " strzałów. Brak torped.");
					blokowaniePol();
					res.style.display = "block";
			}			
		}


	}
}

// Funkcja obsługi zdarzeń

function handleFireButton() {
	controller.processGuess(strzal);
}

function blokowaniePol(){
	pola.forEach(function(element, index){
		element.removeEventListener('click',strzaly,false);
	});	
}

function strzaly(){
	strzal = this.getAttribute("id");
	handleFireButton();
}

function reset(){
	
	strzal = null;
	oddanyStrzal = 0;
	maxStrzal = 20;
	controller.guesses = 0;
	model.shipsSunk = 0;

	view.displayMessage("GRA - STATKI!");
	view.displayAmunicja("Amunicja: " + maxStrzal);
	view.displayOkrety("Ilość trafionych okrętów: " + model.shipsSunk);
	view.displayStrzaly("Ilość oddanych strzałów: " + oddanyStrzal);

	model.ships = [
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
	],

	pola.forEach(function(element, index){
		
		view.displayRemoveHit(element.getAttribute("id"));
		view.displayRemoveMiss(element.getAttribute("id"));

		element.addEventListener('click', strzaly, false);

	});

	// Umieszczamy okręty na planszy.
	model.generateShipLocations();

	//Ukrycie przycisku
	res.style.display = "none";
}

// Funkcja init - wywoływana po zakończeniu wczytywania strony.

window.onload = init;

function init() {

	pola.forEach(function(element, index){
		element.addEventListener('click', strzaly, false);
	});

	res.addEventListener('click', reset, false);

	// Umieszczamy okręty na planszy.
	model.generateShipLocations();

}
