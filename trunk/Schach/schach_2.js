/**
 * replace the value at the given index with a new value and return the
 * previous value.
 *
 * @param (int) index           index number of the array element to replace
 * @param (mixed) wert          new value of the specified element
 * @return (mixed)              previous value of the specified element
 * @throws (RangeError)         index not in array
 */
Array.prototype.swap = function(index, wert)
{
	var i = parseInt(index);
	if (console && i != index) {
		console.log("Index ["+index+"] is not of valid type.");
	}
	if (i >= this.length || 0 > i) {
		throw new RangeError("Array index ["+index+"] doesn’t exist.");
	}
	var old_val = this[i];
	this[i] = wert;
	return old_val;
}
/**
 * throw an Exception (Error object).
 *
 * @param (string) msg          Error message
 * @return (void)
 * @throws (Error)              Error containing the specified message
 */
function Fehler(msg)
{
	throw new Error(msg);
}
/**
 * throw a String object.
 *
 * @param (string) msg          Error message
 * @return (void)
 * @throws (String)             throwing a message
 */
function Meldung(txt)
{
//	if (true == window.error_reporting)
		throw new String(txt);
}
/**
 * basic object containing methods and properties common to all
 * Chess pieces. for some operations methods/properties of the chess board
 * have to be used.
 *
 * @return (void)
 */
function Figur() 
{
	// you might have guessed, an implementation of the Observer Pattern ...
	this.observer = null;	// Board (method access)
}
/**
 * determine the colour of a piece. "black" ("white") is represented by
 * false (true).
 *
 * @param (mixed) clr           the colour in any representation. defaults
 *                              to white (true).
 * @return (bool)               true (false) for white (black) pieces.
 */
Figur.prototype.setColour = function (clr)
{
	clr = String(clr);
	switch (clr.toLowerCase()) {
		case "black":
		case "schwarz":
		case "false":
		case "0":
			return false;
		default:
			return true;
	}
};
/**
 * return the row number from the piece's position for move calculation.
 *
 * @param (string) pos          position of the piece (e.g. "c2").
 * @return (int)                row number of the position.
 */
Figur.prototype.getRow = function (pos)
{
	pos = pos.toLowerCase();
	return Number(pos.charAt(1));
};
/**
 * return the column number from the piece's position for move calculation.
 *
 * @param (string) pos          position of the piece (e.g. "c2").
 * @return (int)                column number of the position (a=1).
 */
Figur.prototype.getCol = function (pos)
{
	pos = pos.toLowerCase();
	const cols = " abcdefgh";
	return cols.indexOf(pos.charAt(0));
};
/**
 * get column or row number of the piece's current position.
 *
 * @param (int) type            return value is column or row
 * @return (int)                column or row number
 * @throws (RangeError)         invalid parameter type
 */
Figur.prototype.getCoord = function (type)
{
	if (0 == Number(type) || "row" == String(type).toLowerCase()) {
		return this.getRow(this.pos);
	}
	if (1 == Number(type) || "col" == String(type).toLowerCase().substr(0,3)) {
		return this.getCol(this.pos);
	}
	throw new RangeError("Ungültiger Parameterwert.");
};
/**
 * return the piece type as single letter.
 *
 * @return (string)             type letter of the piece (e.g. King=K)
 */
Figur.prototype.shortType = function ()
{
	return this.toString().charAt(1);
};
/**
 * calculate various characteristic move numbers. "cols": number of passed
 * columns, "rows": number of passed rows, "distance": square of the real 
 * distance (in fields, ref. Pythagoras), "steps": the number of fields 
 * passed (either diagonal or horizontal+vertical (non-diagonal moves)), 
 * "quot": 'diagonality' of a move (1/-1: diagonal moves (e.g. Bishop), 
 * 0: horizontal or vertical moves (e.g. Rook), NaN: everything else (Knight))
 *
 * @param (string) to           target field of the current piece.
 * @return (Object)             the characteristic numbers.
 * @throws (Error)              start and target field are the same.
 */
Figur.prototype.movement = function (to)
{
	var rowTo, colTo, quot, dif1, dif2, entf, absl;
	dif1 = this.getCol(to) - this.getCol(this.pos);
	dif2 = this.getRow(to) - this.getRow(this.pos);
	if (0 == dif1 && 0 == dif2) {
		Fehler("Start- und Zielfeld sind identisch");
	}
	// square of real distance
	entf = dif1 * dif1 + dif2 * dif2; 
	// orthogonal number of steps to target
	absl = Math.abs(dif1) + Math.abs(dif2); 
	// direction (0: straight, 1: diagonal positive, -1: diagonal negative)
	if (0 == dif1 || 0 == dif2) {
		quot = 0;
	}
	else if (Math.abs(dif1) == Math.abs(dif2)) {
		quot = dif1 / dif2;
		// diagonal number of steps to target
		absl /= 2; 
	}
	else {
		quot = NaN;
	}
	return {
		cols    : dif1,
		rows    : dif2,
		distance: entf,
		steps   : absl,
		diagonal: quot 
	};
};
/**
 * check whether any piece is between current position and target field.
 * if piece is in capturing mode, target field is left unchecked.
 *
 * @param (string) to           target field of the current piece.
 * @return (bool)             	true.
 * @throws (Error)              piece between start and target field.
 */
Figur.prototype.freeWay = function (to)
{
	var Z1, Z2, Z3, feld, col, row, i, j, trail = this.movement(to);
	// does not apply to Knights
	if (isNaN(trail.diagonal)) {
		return true;
	}
	const cols = " abcdefgh";
	Z3  = trail.steps;     // the number of fields to check
	Z2  = trail.rows / Z3; // vertical increment (-1|0|1)
	Z1  = trail.cols / Z3; // horizontal increment (-1|0|1)
	col = this.getCol(to); // use target field as start field
	row = this.getRow(to); // --"--
	j   = Number(this.observer.isFight());
	for (i = j; i < Z3; i++) {
		feld = cols.charAt(col - Z1 * i) + (row - Z2 * i);
		if (-1 != this.observer.position.indexOf(feld)) {
			Fehler("Ungültiger Zug - Figur steht im Weg");
		}
	}
	return true;
};
/**
 * update the position of the piece on the board (i.e. execute the move).
 *
 * @param (string)              new position of the current piece.
 * @return (void)
 */
Figur.prototype.shift = function (to)
{
	// don't update on tests
	if (this.observer.test) {
		return;
	}
	this.pos = to;
	// update the piece's history
	this.history.push([this.observer.zugNr, to]);
	// update the position on the board
	this.observer.updatePosition(this.uid(), to);
};
/**
 * dummy method only replaced in Pawn, so I can call it safely. reason:
 * enPassant() is called on any piece, but only Pawns are allowed to do
 * such a move.
 */
Figur.prototype.enPassant = function ()
{
	return false;
};
/**
 * Object representing the King pieces. the piece colour and id can be 
 * retrieved by a closure to prevent overwriting the values (which must 
 * not happen). basicly all pieces share this set of properties, which 
 * cannot be inherited (otherwise the property would be the same for all
 * pieces).
 *
 * @param (int) id              piece id, ordered by rank.
 * @param (mixed) f             colour representing value, see Figur.setColour()
 * @param (string) pos          position of the piece at creation time.
 * @return (void)
 */
function King(id, f, pos)
{
	// set piece colour
	var farbe    = this.setColour(f);
	// piece's move history (useful for castling check)
	this.history = [];
	// set position
	this.pos     = pos;
	// set piece symbol
	this.symbol  = farbe ? "&#9812;" : "&#9818;";
	// protected values (ID, colour)
	this.isWhite = function() { return farbe; }
	this.uid     = function() { return id; }
}
/**
 * set inheritance chain.
 */
King.extend(Figur);
/**
 * String representation. first letter represents colour (s=black, w=white), 
 * second Type (K=King (König)) in German Chess.
 *
 * @return (string)              colour and type of the piece
 */
King.prototype.toString = function ()
{
	return this.isWhite() ? "wK" : "sK";
};
/**
 * determine, whether a valid move can be made. (type-dependend check)
 *
 * @param (string) to           target field of move.
 * @throws (Error)              invalid move (too long).
 * @throws (Error)              distance between kings too short.
 */
King.prototype.move = function (to)
{
	var k;
	// move not more than one step
	(3 > this.movement(to).distance) || Fehler("Ungültiger Zug");
	// keep at least one field between the kings
	k = (this.isWhite()) ? 16 : 0; 
	k = this.observer.piece[k].pos;
	(3 < this.movement(k).distance) || Fehler("Ungültiger Zug - Entfernung zum anderen König zu kurz");
	// execute move
	this.shift(to);
};
/**
 * Object representing the Queen pieces. (see King() for description)
 *
 * @param (int) id              piece id, ordered by rank.
 * @param (mixed) f             colour representing value, see Figur.setColour()
 * @param (string) pos          position of the piece at creation time.
 * @return (void)
 */
function Queen(id, f, pos)
{
	var farbe    = this.setColour(f);
	this.history = [];
	this.pos     = pos;
	this.symbol  = farbe ? "&#9813;" : "&#9819;";
	this.isWhite = function() { return farbe; }
	this.uid     = function() { return id; }
}
/**
 * set inheritance chain.
 */
Queen.extend(Figur);
/**
 * String representation. first letter represents colour (s=black, w=white), 
 * second Type (D=Queen (Dame)) in German Chess.
 *
 * @return (string)              colour and type of the piece
 */
Queen.prototype.toString = function ()
{
	return this.isWhite() ? "wD" : "sD";
};
/**
 * determine, whether a valid move can be made. (type-dependend check)
 *
 * @param (string) to           target field of move.
 * @throws (Error)              invalid move (not a straight or diagonal move).
 */
Queen.prototype.move = function (to)
{
	// not a straight or diagonal move
	(!isNaN(this.movement(to).diagonal)) || Fehler("Ungültiger Zug");
	// determine if there are pieces in the way
	this.freeWay(to);
	// execute move
	this.shift(to);
};
/**
 * Object representing the Rook pieces. (see King() for description)
 *
 * @param (int) id              piece id, ordered by rank.
 * @param (mixed) f             colour representing value, see Figur.setColour()
 * @param (string) pos          position of the piece at creation time.
 * @return (void)
 */
function Rook(id, f, pos)
{
	var farbe    = this.setColour(f);
	this.history = [];
	this.pos     = pos;
	this.symbol  = farbe ? "&#9814;" : "&#9820;";
	this.isWhite = function() { return farbe; }
	this.uid     = function() { return id; }
}
/**
 * set inheritance chain.
 */
Rook.extend(Figur);
/**
 * String representation. first letter represents colour (s=black, w=white), 
 * second Type (T=Rook (Turm)) in German Chess.
 *
 * @return (string)              colour and type of the piece
 */
Rook.prototype.toString = function ()
{
	return this.isWhite() ? "wT" : "sT";
};
/**
 * determine, whether a valid move can be made. (type-dependend check)
 *
 * @param (string) to           target field of move.
 * @throws (Error)              invalid move (not a straight move).
 */
Rook.prototype.move = function (to)
{
	// only straight moves allowed
	(0 == this.movement(to).diagonal) || Fehler("Ungültiger Zug");
	// determine if a piece is in the way
	this.freeWay(to);
	// execute move
	this.shift(to);
};
/**
 * Object representing the Bishop pieces. (see King() for description)
 *
 * @param (int) id              piece id, ordered by rank.
 * @param (mixed) f             colour representing value, see Figur.setColour()
 * @param (string) pos          position of the piece at creation time.
 * @return (void)
 */
function Bishop(id, f, pos)
{
	var farbe    = this.setColour(f);
	this.history = [];
	this.pos     = pos;
	this.symbol  = farbe ? "&#9815;" : "&#9821;";
	this.isWhite = function() { return farbe; }
	this.uid     = function() { return id; }
}
/**
 * set inheritance chain.
 */
Bishop.extend(Figur);
/**
 * String representation. first letter represents colour (s=black, w=white), 
 * second Type (L=Bishop (Läufer)) in German Chess.
 *
 * @return (string)              colour and type of the piece
 */
Bishop.prototype.toString = function ()
{
	return this.isWhite() ? "wL" : "sL";
};
/**
 * determine, whether a valid move can be made. (type-dependend check)
 *
 * @param (string) to           target field of move.
 * @throws (Error)              invalid move (not a diagonal move).
 */
Bishop.prototype.move = function (to)
{
	// only diagonal moves allowed
	(1 == Math.abs(this.movement(to).diagonal)) || Fehler("Ungültiger Zug");
	// determine if a piece is in the way
	this.freeWay(to);
	// execute move
	this.shift(to);
};
/**
 * Object representing the Knight pieces. (see King() for description)
 *
 * @param (int) id              piece id, ordered by rank.
 * @param (mixed) f             colour representing value, see Figur.setColour()
 * @param (string) pos          position of the piece at creation time.
 * @return (void)
 */
function Knight(id, f, pos)
{
	var farbe    = this.setColour(f);
	this.history = [];
	this.pos     = pos;
	this.symbol  = farbe ? "&#9816;" : "&#9822;";
	this.isWhite = function() { return farbe; }
	this.uid     = function() { return id; }
}
/**
 * set inheritance chain.
 */
Knight.extend(Figur);
/**
 * String representation. first letter represents colour (s=black, w=white), 
 * second Type (S=Knight (Springer)) in German Chess.
 *
 * @return (string)              colour and type of the piece
 */
Knight.prototype.toString = function ()
{
	return this.isWhite() ? "wS" : "sS";
};
/**
 * determine, whether a valid move can be made. (type-dependend check)
 *
 * @param (string) to           target field of move.
 * @throws (Error)              invalid move (not the right length).
 */
Knight.prototype.move = function (to)
{	// 1^2 + 2^2 = 5, no other piece can move such a distance
	(5 == this.movement(to).distance) || Fehler("Ungültiger Zug");
	// execute move
	this.shift(to);
};
/**
 * Object representing the Pawn pieces. (see King() for description)
 *
 * @param (int) id              piece id, ordered by rank.
 * @param (mixed) f             colour representing value, see Figur.setColour()
 * @param (string) pos          position of the piece at creation time.
 * @return (void)
 */
function Pawn(id, f, pos)
{
	var farbe    = this.setColour(f);
	this.history = [];
	this.pos     = pos;
	this.symbol  = farbe ? "&#9817;" : "&#9823;";
	this.isWhite = function() { return farbe; }
	this.uid     = function() { return id; }
}
/**
 * set inheritance chain.
 */
Pawn.extend(Figur);
/**
 * String representation. first letter represents colour (s=black, w=white), 
 * second Type (B=Pawn (Bauer)) in German Chess.
 *
 * @return (string)              colour and type of the piece
 */
Pawn.prototype.toString = function ()
{
	return this.isWhite() ? "wB" : "sB";
};
/**
 * determine, whether a valid move can be made. (type-dependend check) Now 
 * it's getting complicated because of the different move types a pawn can do.
 *
 * @param (string) to           target field of move.
 * @throws (Error)              invalid move.
 */
Pawn.prototype.move = function (to)
{
	var dir, startRow,
	    valid = false, 
	    go    = this.movement(to);
	// Pawns can only move in one direction ...
	dir       = (this.isWhite()) ? 1 : -1;
	// ... and are allowed to do a two-step move from their base line
	startRow  = (this.isWhite()) ? 2 : 7;
	// capturing mode
	if (this.observer.isFight()) {
		// one ahead & one left/right
		valid = (dir == go.rows && 1 == Math.abs(go.cols));
	}
	// regular mode
	else {
		// straight ahead
		if (0 === go.cols) {
			// one ahead
			valid = (dir == go.rows); 
			// two ahead on start
			if (startRow == this.getRow(this.pos) && 2 * dir == go.rows) {
				// check if there is a piece in the way
				valid = this.freeWay(to);
			}
		}
	}
	if (!valid) {
		Fehler("Ungültiger Zug"); 
	}
	this.shift(to);
};
/**
 * Now for the really vexing stuff. a Pawn may capture an opponent's Pawn 
 * "en passant" (while passing), if 1) the opponent's Pawn made a two-step 
 * move and 2) did that in the previous move. (i.e. without the two-step move, 
 * the pawn could have been captured regularly.
 *
 * @return (mixed)              false if not this situation, otherwise the
 *                              last history entry. (see notate() and 
 *                              HistoryEntry())
 */
Pawn.prototype.enPassant = function ()
{	// B must be on line 5 (w) or 4 (b)
	var lastMove,
	    white = this.observer.isWhiteDraw(),
	    line1 = white ? 7 : 2,
	    line2 = white ? 5 : 4;
	if (this.getRow(this.pos) != line2) {
		return false;
	}
	// previous move must be B?7-?5 or B?2-?4 on adjacent column
	lastMove = this.observer.lastMove();
	// if not a pawn
	if ("B" != lastMove.typ) {
		return false;
	}
	// if not a double step
	if (2 != Math.abs(this.getRow(lastMove.von) - this.getRow(lastMove.auf))) {
		return false;
	}
	// if not on adjacent col
	if (1 != Math.abs(this.getCol(this.pos) - this.getCol(lastMove.auf))) {
		return false;
	}
	this.observer.schlagen     = true; 
	this.observer.schlagen_bak = true;
	return lastMove;
};
/**
 * vexed moves part II. a Pawn can be upgraded to a higher ranking piece
 * besides the King, if he reaches the opponent's base line.
 *
 * @param (string)              new piece type
 * @return (void)
 */
Pawn.prototype.upgrade = function (type)
{
	var newPiece, Name;
	if ("B" == type || "Bauer" == type) {
		// no need to create a new pawn
		return false;
	}
	const types = { 
		D: "Queen", 	Dame:     "Queen", 
		T: "Rook", 		Turm:     "Rook", 
		L: "Bishop", 	Läufer:   "Bishop", 
		S: "Knight", 	Springer: "Knight"
	};
	if (types[type]) {
		Name = types[type];
	}
	else {
		Fehler("Ungültiger Figurtyp");
	}
	// create a new piece using the current settings
	newPiece = new window[Name](this.uid(), this.isWhite(), this.pos);
	// copy history and Board
	newPiece.observer = this.observer;
	newPiece.history  = this.history;
	// replace the pawn with the new piece
	this.observer.piece[this.uid()] = newPiece;
	return true;
};
/**
 * the object representing the chess board. many moves or situations can only
 * be checked knowing where all pieces are (e.g. Checkmate), this is beyond
 * the scope of a single piece.
 *
 * @return (void)
 */
function Board()
{	// No. of turns
	this.zugNr    = 1;
	// move history [1]
	this.moves    = ["start"];
	// the Figur objects
	this.piece    = new Array(32);
	// the pieces' positions (start-up order)
	this.position = new Array(32);
	// names of the players
	this.players  = ["Weiß", "Schwarz"];
	// capturing move
	this.schlagen = false;
	// don't execute on check/mate tests
	this.test     = false;
	// schach status
	this.schach   = false;
	// white's or black's turn
	this.whiteOnDraw = true;
}
/**
 * current game status in terms of draw number and current colour in possession.
 *
 * @return (string)             said status message.
 */
Board.prototype.toString = function ()
{
	return this.zugNr + ". Zug - " + (this.whiteOnDraw ? "Weiß" : "Schwarz");
//	return this.zugNr + ". Zug: " + this.players[Number(!this.whiteOnDraw)];
};
/**
 * get the names of the players of the current game (informational)
 *
 * @return (string)             string representation of the current players.
 */
Board.prototype.whois = function ()
{
	return this.players[0] + " - " + this.players[1];
};
/**
 * set the player's names (setter method)
 *
 * @param (string) colour       colour the player has (black|white)
 * @param (string) name         name of the player
 * @return (void)
 */
Board.prototype.setPlayer = function (colour, name)
{
	if ("white" == colour) {
		this.players[0] = name;
	}
	if ("black" == colour) {
		this.players[1] = name;
	}
};
/**
 * check if a field, passed from the input field, is valid (e.g. "r9" is not).
 * (fields can be typed by hand)
 *
 * @param (string) rc           field name from the input element.
 * @return (bool)               true if a field of the chess board.
 */
Board.prototype.onBoard = function (rc)
{
	const rows = "12345678";
	const cols = "abcdefgh";
	return (cols.indexOf(rc.charAt(0)) != -1 && rows.indexOf(rc.charAt(1)) != -1);
};
/**
 * get the piece object of a given field of the chess board.
 *
 * @param (string) pos          field of the board to test.
 * @return (Figur)              that field's piece's object.
 * @throws (Error)              no piece at that field.
 */
Board.prototype.getFigurAt = function (pos)
{
	var i = this.position.indexOf(pos);
	if (-1 == i) {
		Fehler("Feld nicht belegt");
	}
	return this.piece[i];
};
/**
 * get the capture status (getter method).
 *
 * @return (bool)               in capturing mode?
 */
Board.prototype.isFight = function ()
{
	return this.schlagen;
};
/**
 * get the current draw's status, colour only (getter method).
 *
 * @return (bool)               whether white is on draw.
 */
Board.prototype.isWhiteDraw = function ()
{
	return this.whiteOnDraw;
};
/**
 * determine the offset (id of the King) if there is to loop over all pieces
 * of one colour. 
 *
 * @param (bool) same           looping over the same colour that is on draw.
 * @return (int)                offset (0|16)
 */
Board.prototype.offset = function (same)
{
	var os;
	if (same) {
		os = this.whiteOnDraw ? 0 : 16;
	}
	else {
		os = this.whiteOnDraw ? 16 : 0;
	}
	return os;
};
/**
 * after the move is made proceed to the next draw/turn. i.e. increase the 
 * turn number if white is next and change the colour in possession.
 *
 * @return (void)
 */
Board.prototype.toggle = function ()
{
	this.whiteOnDraw = !this.whiteOnDraw;
	if (this.whiteOnDraw) {
		this.zugNr++;
	}
};
/**
 * update the positions of the currently involved pieces in the Board object.
 *
 * @param (int) num             id of the piece
 * @param (string) pos          new position of the piece
 */
Board.prototype.updatePosition = function (num, pos)
{	// if there is a piece captured, set its position (on the board and in the
	// piece's object) to xx (captured)
	var idx = this.position.indexOf(pos);
	if (this.schlagen && -1 != idx) {
		this.piece[idx].pos = "xx";
		this.position[idx]  = "xx";
	}
	// update the boards position array
	this.position[num] = pos.substr(0, 2); // just to make sure
	// test for Check
	this.isSchach(this.piece[num]);
};
/**
 * change the board's position property array and the piece's pos
 * property (temporarily).
 *
 * @param (Figur) fig           piece object
 * @return (string)             previous position of that piece.
 */
Board.prototype.setPosition = function (fig, pos)
{
	fig.pos = pos;
	return this.position.swap(fig.uid(), pos);	
};
/**
 * determine, whether the target field is occupied and by which piece
 * (black or white)
 *
 * @param (string) to           target field
 * @return (bool)               false: unoccupied, true: occupied by opponent.
 * @throws (Error)              target field occupied by a piece of the
 *                              same colour.
 */
Board.prototype.hasTarget = function (to)
{	// field is unoccupied
	if (-1 == this.position.indexOf(to)) {
		return false;
	}
	// opponent's piece on the field
	if (this.isWhiteDraw() != this.getFigurAt(to).isWhite()) {
		return true;
	}
	// own piece on the field
	Fehler("Ungültiger Zug - eigene Figur auf dem Zielfeld");
};
/**
 * define the capture mode (and do a backup).
 *
 * @param (string) fld          target field
 * @return (void)
 * @throws (Error)              Error from Board.hasTarget()
 */
Board.prototype.capture = function (fld)
{
	var cpt = this.hasTarget(fld);
	this.schlagen = cpt;
	this.schlagen_bak = cpt;
};
/**
 * object to save the game history in.
 *
 * @param (Figur) fig           piece object that moved
 * @param (string) at           start field
 * @param (string) to           target field
 * @param (Array) cm            comment array, containing 0: capture, 1: Check
 *                              2: additional notation
 * @return (void)
 */
function HistoryEntry(fig, at, to, cm)
{
	this.von = at;
	this.auf = to;
	this.id  = fig.uid();
	this.typ = fig.shortType();
	this.comment = cm;
}
/**
 * save history object in the board's history array.
 *
 * @param (HistoryEntry) he     entry object
 * @return (void)
 */
Board.prototype.notate = function (he)
{
	if (this.whiteOnDraw) {
		this.moves.push({ runde: this.zugNr, white: he });
	}
	else {
		this.moves[this.moves.length - 1].black = he;
	}
};
/**
 * get the last history entry object.
 *
 * @return (HistoryEntry)       last object of history.
 */
Board.prototype.lastMove = function ()
{
	var last = this.moves[this.moves.length-1];
	if (last.black) {
		return last.black;
	}
	return last.white;
};
/**
 * test if a piece is giving Check. if so, set the Board.schach property
 * to true.
 *
 * @param (Figur) fig           piece to check
 * @return (void)
 */
Board.prototype.isSchach = function (fig)
{
	try {
		// disable move execution
		this.test     = true;
		// yes, we try to capture the king
		this.schlagen = true;
		// where the king is
		var kf        = this.piece[this.offset(false)].pos;
		// throws exception if invalid move
		fig.move(kf);
		// otherwise it's Schach
		this.schach   = true;
		Meldung("Schach!");
	}
	catch (a) {
		if (a instanceof String) {
			alert(a);
		}
	}
	finally {
		// re-enable move execution
		this.test     = false;
		// reset to previous value
		this.schlagen = this.schlagen_bak;
	}
};
/**
 * test, if Check is resolved by trying to move every opponent's piece onto
 * the King. if the current piece does not prevent this, its move is invalid.
 *
 * @param (Figur) pce           the current piece on draw.
 * @param (string) to           target field of the current piece.
 * @return (bool)               false if no Check.
 * @throws (Error)              Error from Board.hasTarget()
 * @throws (Error)              Error from Figur.move()
 * @throws (Error)              Error from Board.trySchach()
 */
Board.prototype.testSchach = function (pce, to)
{
	if (!this.schach) {
		return;
	}
	var opp, opp_pos, pce_pos, kf;
	try {
		// disable move execution
		this.test     = true;
		// is there a piece to capture?
		this.schlagen = this.hasTarget(to);
		try {	// capture check giving piece
			opp       = this.getFigurAt(to);
			opp_pos   = opp.pos;
			// a captured piece can't threaten the king
			opp.pos   = "xx";
		}
		catch (e) {
			opp       = null;
		}
		// throw exception if invalid move
		pce.move(to);
		// save current position & set temporary position 
		// used in Figur.movement() & Figur.freeWay()
		pce_pos = this.setPosition(pce, to);
		// where the king is
		kf      = this.piece[this.offset(true)].pos;
		this.schlagen = true;
		// try to move to the king's field
		this.trySchach(kf, true);
	}
	catch (e) {
		throw e;
	}
	finally {
		// undo everything temporary
		if (null != opp) {
			opp.pos   = opp_pos;
		}
		this.setPosition(pce, pce_pos);
		this.test     = false;
		this.schlagen = false;
	}
	this.schach = false;
};
/**
 * test for Checkmate.
 *
 * @param (Figur) fig           Check giving piece (current draw)
 * @return (bool)               Checkmate or not.
 */
Board.prototype.isSchachmatt = function (fig)
{
	// abort if not in Check
	if (!this.schach) {
		return false;
	}
	var könig, spur, Z1, Z2, Z3, col, row, cpt, i, k, l, feld,
	    kingsFields = [];
	const cols = " abcdefgh";
	// try opponent's escape moves
	try {
// capture the piece or step in the way
		könig = this.piece[this.offset(false)];
		spur  = könig.movement(fig.pos);
		Z3    = isNaN(spur.diagonal) ? 1 : spur.steps;
		Z2    = spur.rows / Z3;
		Z1    = spur.cols / Z3;
		col   = fig.getCol(fig.pos);
		row   = fig.getRow(fig.pos);
		cpt   = true; // first field is of opponent's piece
		for (i = 0; i < Z3; i++) {
			feld = cols.charAt(col - Z1 * i) + (row - Z2 * i);
			this.trySchach(feld, cpt);
			if (cpt) {
				cpt = false;
			}
		}
	}
	catch (e) {
		return false;
	}
	try {
		// determine the valid fields the king can move to
		const felder = [
			"a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", 
			"b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", 
			"c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", 
			"d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", 
			"e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", 
			"f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", 
			"g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8", 
			"h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"
		]; 
		this.test = true;
		this.whiteOnDraw = !this.whiteOnDraw;
// move king away (including capture)
		for (i = 0; i < 64; i++) {
			try {
				this.schlagen = this.hasTarget(felder[i]);
				könig.move(felder[i]);
			}
			catch (e) {
				continue;
			}
			kingsFields.push(felder[i]);
		}
		// do a Check test on every field
		for (k = 0, l = kingsFields.length; k < l; k++) {
			try {
				this.trySchach(kingsFields[k], true);
			}
			catch (e) {
				continue;
			}
			throw new Boolean(false); // skip Checkmate announcement
		}
		Meldung("Schachmatt!");
	}
	catch (a) {
		if (a instanceof String) {
			alert(a);
			return true;
		}
		return false;
	}
	finally {
		this.whiteOnDraw = !this.whiteOnDraw;
		this.test = false;
	}
};
/**
 * test if any opposite piece can make a valid move to the given field.
 *
 * @param (string) field        the target field
 * @return (void)
 * @throws (Error)              an opponent's piece can make a valid move
 *                              to the given field.
 */
Board.prototype.trySchach = function (field, capture)
{
	var i;
	try {
		var offset    = this.offset(false);
		this.test     = true;
		this.schlagen = Boolean(capture);		
		for (i = 1 + offset; i < 16 + offset; i++) {
			try {
				if ("xx" == this.piece[i].pos) {
					continue;
				}
				this.piece[i].move(field);
			}
			catch (e) {
				// eventually leave without error
				continue;
			}
			// if one piece does a correct move
			Fehler("König steht noch im Schach!");
		}
	}
	catch (e) {
		throw e;
	}
	finally {
		// reset (that's why this try-catch is required)
		this.test     = false;
		this.schlagen = false;
	}
};
/**
 * separate procedure for castling
 *
 * @param (Figur) king          the involved king
 * @param (Figur) rook          the involved rook
 * @return (Array)              the fields where king and rook will move to
 * @throws (Error)              King is Check (castling forbidden)
 * @throws (Error)              King has alredy moved (castling not possible)
 * @throws (Error)              Rook has already moved (this castling not
 *                              possible)
 * @throws (Error)              one of the fields where the King moves is in
 *                              Check (castling forbidden)
 */
Board.prototype.rochade = function (king, rook)
{	// King is in Check
	if (this.schach) {
		Fehler("König steht im Schach - Rochade ist nicht erlaubt.");
	}
	// King has alredy moved
	if (0 < king.history.length) {
		Fehler("König wurde bereits gezogen - Rochade ist nicht mehr möglich.");
	}
	var fData, felder, j;
	// Rook has already moved
	if (0 < rook.history.length) {
		Fehler("Turm wurde bereits gezogen - diese Rochade ist nicht mehr möglich.");
	}
	// get king's fields
	fData = {
		a1 : ["e1", "d1", "c1"],	// w/o 1st value possible
		h1 : ["e1", "f1", "g1"],
		a8 : ["e8", "d8", "c8"],
		h8 : ["e8", "f8", "g8"]
	};
	felder = fData[rook.pos];
	// one of the fields where the King moves is in Check
	for (j = 0; j < 3; j++) {
		this.trySchach(felder[j], true);
	}
	return [felder[1], felder[2]];
};

/*
{Rang}{start}{-|x}{ziel}{comment}

	-  auf leeres Feld ziehen
	x  Figur schlagen (:)
	+  Schach
	#  Schachmatt
	={Rang} Promotion
move evaluation	
	?? blunder (Patzer)
	?  mistake (Fehler)
	?! dubious move (zweifelhafter Zug)
	!? interesting move (interessanter Zug)
	!  good move (guter Zug)
	!! brilliant move (excellenter Zug)
position evaluation
	∞   unclear
	=/∞ with compensation
	=   even position
	+/= slight advantage White (=/+ ~ Black)
	+/- advantage White
	+-  decisive advantage White
*/
