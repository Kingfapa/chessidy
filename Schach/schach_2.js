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

function Fehler(msg)
{
//	if (true == window.error_reporting) // for play ahead checks?
		throw new Error(msg);
}

function Figur() 
{
	this.out      = false;	// out of game?
	this.observer = null;	// Board (method access)
}
// set piece's colour
Figur.prototype.setColour = function(clr)
{
	var clr = String(clr);
	switch (clr.toLowerCase())
	{
		case "black":
		case "schwarz":
		case "false":
		case "0":
			return false;
		default:
			return true;
	}
}
// return row number from position
Figur.prototype.getRow = function(pos)
{
	pos = pos.toLowerCase();
	return Number(pos.charAt(1));
}
// return column number from position
Figur.prototype.getCol = function(pos)
{
	pos = pos.toLowerCase();
	const cols = " abcdefgh";
	return cols.indexOf(pos.charAt(0));
}

Figur.prototype.offset = function(same)
{
	if (same)
		var os = this.isWhite() ? 0 : 16;
	else
		var os = this.isWhite() ? 16 : 0;
	return  os;
}

Figur.prototype.shortType = function()
{
	return this.toString().charAt(1);
}

Figur.prototype.movement = function(to)
{
	var rowTo, colTo, quot;
	var dif1 = this.getCol(to) - this.getCol(this.pos);
	var dif2 = this.getRow(to) - this.getRow(this.pos);
	if (0 == dif1 && 0 == dif2)
		Fehler("Start- und Zielfeld sind identisch");
	// square of real distance
	var entf = dif1*dif1 + dif2*dif2; 
	// orthogonal number of steps to target
	var absl = Math.abs(dif1) + Math.abs(dif2); 
	// direction (0: straight, 1: diagonal positive, -1: diagonal negative)
	if (0 == dif1 || 0 == dif2)
		quot = 0;
	else if (Math.abs(dif1) == Math.abs(dif2))
	{
		quot = dif1/dif2;
		absl /= 2; // diagonal number of steps to target
	}
	else
		quot = NaN;
	
	return {
		cols: dif1,
		rows: dif2,
		distance: entf,
		steps: absl,
		diagonal: quot 
	};
}
// check for pieces inbetween
Figur.prototype.freeWay = function(to)
{
	var Z1, Z2, Z3, feld, col, row;
	const cols = " abcdefgh";
	var trail = this.movement(to);
	if (isNaN(trail.diagonal))
		return true;
	Z3  = trail.steps;
	Z2  = trail.rows / Z3; // vertical
	Z1  = trail.cols / Z3; // horizontal
	col = this.getCol(to); // use target field as start field
	row = this.getRow(to);
	var j = Number(this.observer.isFight());
	for (var i=j; i<Z3; i++)
	{
		feld = cols.charAt(col - Z1*i) + (row - Z2*i);
		if (-1 != this.observer.position.indexOf(feld))
			Fehler("Ungültiger Zug - Figur steht im Weg");
	}
	return true;
}
// update the Board
Figur.prototype.shift = function(to)
{
	// don't update on tests
	if (this.observer.test) 
		return;
	this.pos = to;
	this.history.push([this.observer.zugNr, to]);
	this.observer.updatePosition(this.uid(), to);
}

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

King.extend(Figur);

King.prototype.toString = function()
{
	if (this.out)
		return "xx";
	return (this.isWhite()) ? "wK" : "sK";
}

King.prototype.move = function(to)
{
	var k;
	(3 > this.movement(to).distance) || Fehler("Ungültiger Zug");
	k = (this.isWhite()) ? 16 : 0; 
	k = this.observer.piece[k].pos;
	(3 < this.movement(k).distance) || Fehler("Ungültiger Zug - Entfernung zum anderen König zu kurz");
	this.shift(to);
}

King.prototype.rochade = function(gr)
{
}

function Queen(id, f, pos)
{
	var farbe    = this.setColour(f);
	this.history = [];
	this.pos     = pos;
	this.symbol  = farbe ? "&#9813;" : "&#9819;";
	this.isWhite = function() { return farbe; }
	this.uid     = function() { return id; }
}

Queen.extend(Figur);

Queen.prototype.toString = function()
{
	if (this.out)
		return "xx";
	return (this.isWhite()) ? "wD" : "sD";
}

Queen.prototype.move = function(to)
{
	(!isNaN(this.movement(to).diagonal)) || Fehler("Ungültiger Zug");
	this.freeWay(to);
	this.shift(to);
}

function Rook(id, f, pos)
{
	var farbe    = this.setColour(f);
	this.history = [];
	this.pos     = pos;
	this.symbol  = farbe ? "&#9814;" : "&#9820;";
	this.isWhite = function() { return farbe; }
	this.uid     = function() { return id; }
}

Rook.extend(Figur);

Rook.prototype.toString = function()
{
	if (this.out)
		return "xx";
	return (this.isWhite()) ? "wT" : "sT";
}

Rook.prototype.move = function(to)
{
	(0 == this.movement(to).diagonal) || Fehler("Ungültiger Zug");
	this.freeWay(to);
	this.shift(to);
}

function Bishop(id, f, pos)
{
	var farbe    = this.setColour(f);
	this.history = [];
	this.pos     = pos;
	this.symbol  = farbe ? "&#9815;" : "&#9821;";
	this.isWhite = function() { return farbe; }
	this.uid     = function() { return id; }
}

Bishop.extend(Figur);

Bishop.prototype.toString = function()
{
	if (this.out)
		return "xx";
	return (this.isWhite()) ? "wL" : "sL";
}

Bishop.prototype.move = function(to)
{
	(1 == Math.abs(this.movement(to).diagonal)) || Fehler("Ungültiger Zug");
	this.freeWay(to);
	this.shift(to);
}

function Knight(id, f, pos)
{
	var farbe    = this.setColour(f);
	this.history = [];
	this.pos     = pos;
	this.symbol  = farbe ? "&#9816;" : "&#9822;";
	this.isWhite = function() { return farbe; }
	this.uid     = function() { return id; }
}

Knight.extend(Figur);

Knight.prototype.toString = function()
{
	if (this.out)
		return "xx";
	return (this.isWhite()) ? "wS" : "sS";
}

Knight.prototype.move = function(to)
{
	(5 == this.movement(to).distance) || Fehler("Ungültiger Zug");
	this.shift(to);
}

function Pawn(id, f, pos)
{
	var farbe    = this.setColour(f);
	this.history = [];
	this.pos     = pos;
	this.symbol  = farbe ? "&#9817;" : "&#9823;";
	this.isWhite = function() { return farbe; }
	this.uid     = function() { return id; }
}

Pawn.extend(Figur);

Pawn.prototype.toString = function()
{
	if (this.out)
		return "xx";
	return (this.isWhite()) ? "wB" : "sB";
}

Pawn.prototype.move = function(to)
{
	// check if move is valid
	var valid = false, go = this.movement(to);
	var dir = (this.isWhite()) ? 1 : -1;
	if (this.observer.isFight()) // one ahead & one left/right
		valid = (dir == go.rows && 1 == Math.abs(go.cols));
	else
	{
		if (0 == go.cols) // straight ahead
		{
			valid = (dir == go.rows); // one ahead
			// en passent
			var startRow = (this.isWhite()) ? 2 : 7;
			if (startRow == this.getRow(this.pos) && 2*dir == go.rows)
				valid = this.freeWay(to);
		}
	}
	if (valid)
		this.shift(to);
	else
		Fehler("Ungültiger Zug"); 
}

Pawn.prototype.upgrade = function(type)
{
	var newPiece, Name;
	const types = { 
		D: "Queen", 	Dame: "Queen", 
		T: "Rook", 		Turm: "Rook", 
		L: "Bishop", 	Läufer: "Bishop", 
		S: "Knight", 	Springer: "Knight"
	};
	if (type in types)
		Name = type;
	else if (types[type])
		Name = types[type];
	else
		Fehler("Ungültiger Figurtyp");
		
	newPiece = new window[Name](this.uid(), this.isWhite(), this.pos);
//	newPiece.isBlack = this.isBlack;
	newPiece.observer = this.observer;
	this.observer.piece[this.uid()] = newPiece;
}

function Board()
{
	// No. of turns
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
// current Draw status
Board.prototype.toString = function()
{
	return this.zugNr + ". Zug - " + (this.whiteOnDraw ? "Weiß" : "Schwarz");
//	return this.zugNr + ". Zug: " + this.players[Number(!this.whiteOnDraw)];
}
// current players
Board.prototype.whois = function()
{
	return this.players[0] + " - " + this.players[1];
}
// set player names
Board.prototype.setPlayer = function(colour, name)
{
	if ("white" == colour)
		this.players[0] = name;
	if ("black" == colour)
		this.players[1] = name;
}
// check if passed field is valid
Board.prototype.onBoard = function(rc)
{
	const rows = "12345678";
	const cols = "abcdefgh";
	return (cols.indexOf(rc.charAt(0)) != -1 && rows.indexOf(rc.charAt(1)) != -1);
}
// get piece of a certain field
Board.prototype.getFigurAt = function(pos)
{
	var i = this.position.indexOf(pos);
	if (-1 == i)
		Fehler("Feld nicht belegt");
	return this.piece[i];
}
// capture status
Board.prototype.isFight = function()
{
	return this.schlagen;
}
// draw status, colour only
Board.prototype.isWhiteDraw = function()
{
	return this.whiteOnDraw;
}
//
Board.prototype.offset = function(same)
{
	if (same)
		var os = this.whiteOnDraw ? 0 : 16;
	else
		var os = this.whiteOnDraw ? 16 : 0;
	return  os;
}
// set colour & turn no.
Board.prototype.toggle = function()
{
	this.whiteOnDraw = !this.whiteOnDraw;
	if (this.whiteOnDraw)
		this.zugNr++;
}
// update the positioning array
Board.prototype.updatePosition = function(num, pos)
{
	idx = this.position.indexOf(pos);
	if (this.schlagen && -1 != idx)
	{
		this.piece[idx].out = true;
		this.position[idx]  = "xx";
	}
	this.position[num] = pos.substr(0,2);
	this.isSchach(this.piece[num]);
}
// change the position array (temporarily)
Board.prototype.setPosition = function(fig, pos)
{
	fig.pos = pos;
	return this.position.swap(fig.uid(), pos);	
}
// determine, whether target piece (if any) has opponent's colour
Board.prototype.hasTarget = function(to)
{
	// field is unoccupied
	if (-1 == this.position.indexOf(to))
		return false;
	// opponent's piece on the field
	if (this.isWhiteDraw() != this.getFigurAt(to).isWhite())
		return true;
	// own piece on the field
	Fehler("Ungültiger Zug - eigene Figur auf dem Zielfeld");
}
// define the capture setting (and do a backup)
Board.prototype.capture = function(fld)
{
	var cpt = this.hasTarget(fld);
	this.schlagen = cpt;
	this.schlagen_bak = cpt;
}
// test for Check
Board.prototype.isSchach = function(fig)
{
	try
	{
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
		throw new String("Schach!");
	}
	catch (a)
	{
		if (a instanceof String)
			alert(a);
	}
	finally
	{
		// re-enable move execution
		this.test     = false;
		// reset to previous value
		this.schlagen = this.schlagen_bak;
	}
}
// test if check is resolved
Board.prototype.testSchach = function(pce, to)
{
	if (!this.schach) return;
	try
	{
		// disable move execution
		this.test     = true;
		// is there a piece to capture?
		this.schlagen = this.hasTarget(to);
		// where the king is
		var kf        = this.piece[this.offset(true)].pos;
		// throw exception if invalid move
		pce.move(to);
		// save current position & set temporary position 
		// used in Figur.movement() & Figur.freeWay()
		var pce_pos   = this.setPosition(pce, to);
		try
		{	// capture check giving piece
			var opp     = this.getFigurAt(to);
			var opp_pos = opp.pos;
			// a captured piece can't threaten the king
			opp.pos     = "xx";
		}
		catch (e)
		{
			var opp   = null;
		}
		this.schlagen = true;
		var offset    = this.offset(false);
		// do Board.isSchach() for every piece
		for (var i=1+offset; i<16+offset; i++)
		{
			try
			{
				if ("xx" == this.piece[i].pos)
					continue;
				this.piece[i].move(kf);
			}
			catch (e)
			{	// eventually leave without error
				continue;
			}
			// if one piece does a correct move
			Fehler("König steht noch im Schach!");
		}
	}
	catch (e)
	{
		throw e;
	}
	finally
	{	// undo everything temporary
		if (null != opp)
			opp.pos   = opp_pos;
		this.setPosition(pce, pce_pos);
		this.test     = false;
		this.schlagen = false;
	}
	this.schach = false;
}
// test for Checkmate
Board.prototype.isSchachmatt = function()
{
	try
	{
		this.test = true;
		// some lengthy tests
		throw new String("Schachmatt!");
	}
	catch (a)
	{
		if (a instanceof String)
			alert(a);
	}
	finally
	{
		this.test = false;
	}
}

Board.prototype.notate = function(fig, at, to)
{
	var info = {
		von : at,
		auf : to,
		id  : fig.uid(),
		typ : fig.shortType(),
		comment : [
			this.schlagen ? String.fromCharCode(10799) : "-", 
			this.schach ? "+" : "", 
			"" // user comment, defined later
		]
	};
	if (this.whiteOnDraw)
		this.moves.push({ runde: this.zugNr, white: info });
	else
		this.moves[this.moves.length - 1].black = info;

	return info;
}
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
