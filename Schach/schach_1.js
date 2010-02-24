// user interaction, should define the form getter/setter and event stuff
// var Game = function(neu)
function Game()
{
	var at, to, tp, ct, go, r1, r2, ng, rp, 
	    black, white, SB,
	    Liste1, Liste2;
	// input elements
	at = document.getElementById("Von");	// start field
	to = document.getElementById("Nach");	// target field
	tp = document.getElementById("Art");	// piece type
	// output elements
	ct = document.getElementById("Zaehler") // status display
	// buttons
	go = document.getElementById("Los");	// make draw
	r1 = document.getElementById("Klein");	// kleine Rochade
	r2 = document.getElementById("Gross");	// große Rochade
	ng = document.getElementById("Anfang");	// start new game
	rp = document.getElementById("RePlay");	// show game
	// board fields
	black = Code.getElementsByClassName("black");
	white = Code.getElementsByClassName("white");
	// board
	SB = new Board;
	// other "global" variables
	Liste1 = "e1d1a1h1c1f1b1g1a2b2c2d2e2f2g2h2e8d8a8h8c8f8b8g8a7b7c7d7e7f7g7h7";
	Liste2 = "KDTTLLSSBBBBBBBBKDTTLLSSBBBBBBBB";

// "Rochade" only for kings
	function doro() {
		if ("K" == this.value) {
			r1.style.visibility = "visible";
			r2.style.visibility = "visible";
		}
		else {
			r1.style.visibility = "hidden";
			r2.style.visibility = "hidden";
		}
	}

// determine correctnes of starting field with regards to drawing colour
	function startFeld()
	{
		var fig, farbe;
		try {
			fig = SB.getFigurAt(at.value);
			if (fig.isWhite() != SB.isWhiteDraw()) {
				farbe = (SB.isWhiteDraw()) ? "Weiß" : "Schwarz";
				Fehler("Falsche Figur, " + farbe + " is am Zug");
			}
		}
		catch (e) {
			alert(e.message);
			at.value = "";
		}
	}

// fill form by mouse
	function fillFields() 
	{
		var hand, fig, farbe;
		try {
			hand = ("pointer" == this.style.cursor);
			if (!at.value) {
				if (hand) {
					fig = SB.getFigurAt(this.title);
					if (fig.isWhite() != SB.isWhiteDraw()) {
						farbe = (SB.isWhiteDraw()) ? "Weiß" : "Schwarz";
						Fehler("Falsche Figur, "+farbe+" is am Zug");
					}
					at.value = this.title;
					tp.value = fig.toString().charAt(1);
					doro.call(tp);
				}
				else {
					alert("Ungültiges Feld");
				}
			}
			else if (!to.value) {
				to.value = this.title;
				go.focus();
			}
			else {
				at.value = "";
				to.value = "";
			}
		}
		catch (e) {
			alert(e.message);
			at.value = "";
		}
	}
	
// change a board field's occupation
	function setDisplay(id, view, shape)
	{
		var td = document.getElementById(id); // not checked
		td.innerHTML    = view  || "";
		td.style.cursor = shape || "default";
	}

// change the board fields
	function display()
	{
		document.getElementsByTagName("caption")[0].innerHTML = SB.whois();
		ct.innerHTML = SB;
		try {
			this.innerHTML = SB.getFigurAt(this.title).symbol;
			this.style.cursor = "pointer";
		}
		catch (e) {
			this.innerHTML = "";
			this.style.cursor = "default";
		}
	}
	
// load settings from Cookie
	function load(neu)
	{
		var CookieFarbe, l, j, w, b;
		// default placement (white first), K-D-T-L-S-B
		const ListeG = "e1d1a1h1c1f1b1g1a2b2c2d2e2f2g2h2e8d8a8h8c8f8b8g8a7b7c7d7e7f7g7h7";
		const ListeF = "KDTTLLSSBBBBBBBBKDTTLLSSBBBBBBBB";
		// default values
		SB.zugNr = 1;
		Liste1   = ListeG;
		Liste2   = ListeF;
		// reset notation display
		document.getElementById("Notation").innerHTML = "";
		// check if cookie has values (not null)
		CookieFarbe = Code.readCookie("Farbe");
		// new game
		if (neu) {
			SB.whiteOnDraw = true;
			SB.players[0]  = prompt("Wer spielt Weiß?", "Weiß");
			SB.players[1]  = prompt("Wer spielt Schwarz?", "Schwarz");
			SB.moves       = ["start"];
		}
		// replace with cookie values
		else if (null !== CookieFarbe) {
			Liste1      = Code.readCookie("Aufstellung");
			Liste2      = Code.readCookie("Figuren");
			var arrHis  = Code.readCookie("History").split("|");
			// deserialize history
			SB.moves[0] = "loaded";
			for (j = 0, l = arrHis.length; j < l; j++) {
				var part = arrHis[j].split(",");
				if (!part[0]) continue;
				function InfoFarbe(os) 
				{
					this.von = part[os],
					this.auf = part[os+1],
					this.id  = part[os+2],
					this.typ = Liste2.charAt(part[os+2]),
					this.comment = [
						part[os+3],
						part[os+4],
						part[os+5]
					]
				}
				// set .moves property
				w = new InfoFarbe(1);
				SB.moves.push({ runde: part[0], white: w });
				// display history (white)
				SB.whiteOnDraw = true;
				add_note(w);
				if (10 < part.length) {	// set .moves property
					b = new InfoFarbe(7);
					SB.moves[SB.moves.length-1].black = b;
					// display history (black)
					SB.whiteOnDraw = false;
					add_note(b);
				}
			}
			SB.whiteOnDraw = ("false" == CookieFarbe) ? false : true;
			SB.players[0]  = Code.readCookie("Spieler1");
			SB.players[1]  = Code.readCookie("Spieler2");
			SB.zugNr       = Code.readCookie("Runde");
		}
		else {
			Fehler("Spielstand kann nicht rekonstruiert werden.");
		}
		create();
	}
	
// create a new set of pieces
	function create()
	{
		const types = { 
			K: "King", 
			D: "Queen", 
			T: "Rook", 
			L: "Bishop", 
			S: "Knight", 
			B: "Pawn" 
		};
		// create pieces
		var i, pos, clr = "white";
		for (i = 0; i < 32; i++) {
			// set colour to black
			if (16 == i) {
				clr = "black";
			}
			pos = Liste1.substr(2*i, 2);
			if (!SB.onBoard(pos) && "xx" != pos) {
				Fehler("Spielstand kann nicht rekonstruiert werden.");
			}
			SB.piece[i] = new window[types[Liste2.charAt(i)]](i, clr, pos);
			SB.piece[i].observer = SB;
			SB.position[i] = pos;
		}
		// mount pieces on Board
		display.forEvery(black);
		display.forEvery(white);
	}
	
// save current standings to Cookie
	function save()
	{
		// days
		var i, l, valid = 7, 
		    hist = "", stell = "", art = "";
		for (i = 0; i < 32; i++) {
			stell += SB.position[i];
			art   += SB.piece[i].shortType();
		}
		for (i = 1, l = SB.moves.length; i < l; i++) {
			var m = SB.moves[j];
			hist += m.runde + "," + m.white.von + "," + m.white.auf + "," + m.white.id + "," + m.white.comment[0] + "," + m.white.comment[1] + "," + m.white.comment[2];
			if (m.black) {
				hist += "," + m.black.von + "," + m.black.auf + "," + m.black.id + "," + m.black.comment[0] + "," + m.black.comment[1] + "," + m.black.comment[2];
			}
			hist += "|";
		}
		// set cookies
		Code.createCookie("Aufstellung", stell, valid);
		Code.createCookie("Figuren", art, valid);
		Code.createCookie("Runde", SB.zugNr, valid);
		Code.createCookie("Farbe", String(SB.whiteOnDraw), valid);
		Code.createCookie("Spieler1", SB.players[0], valid);
		Code.createCookie("Spieler2", SB.players[1], valid);
		Code.createCookie("History", hist.slice(0, -1), valid);
	}
	
// do notation
	function add_note(info)
	{
		var list, txt, heid, li, cm0,
		    ol = document.getElementById("Notation");
		if (SB.isWhiteDraw()) {
			li = ol.appendElement("li", "");
		}
		else {
			list = ol.getElementsByTagName("li");
			li   = list[list.length - 1];
		}
		txt = info.typ + info.von + info.comment[0] + info.auf + info.comment[1] + " " + info.comment[2] + " ";
		txt = txt.replace("B", String.fromCharCode(160)).replace(":", String.fromCharCode(10799));
		heid = "r" + SB.zugNr + (SB.isWhiteDraw() ? "w" : "b");
		// special format for castling
		cm0 = info.comment[0];
		if ("0-0" == cm0 || "0-0-0" == cm0) {
			txt = cm0;
		}
		li.appendElement("span", txt, { id: heid });
	}
	
// error reporting
	function dump(exc)
	{
		var txt = exc.message,
		    stk = exc.stack   || exc.stacktrace;
		if (window.console) {
			window.console.log(stk);
		}
		else if (window.opera) {
			window.opera.postError(stk);
		}
		alert(txt);
	}
	
// piece conversion
	function convert(fig)
	{
		if (!(fig instanceof Pawn)) {
			return false;
		}
		var upg, upd, line = fig.getCoord(0);
		if (8 != line && 1 != line) {
			return false;
		}
		upg = document.getElementById("upgrade");
		upd = document.getElementById("update");
		function doConversion()
		{
			fig.upgrade(this.value);
			upg.style.visibility = "hidden";
			upd.style.visibility = "hidden";
		//	upd.remEvent("click", doConversion, false);
		}
		upg.style.visibility = "visible";
		upd.style.visibility = "visible";
		upd.addEvent("click", doConversion, false);
		return true;
	}
	
// execute a move
	function exec()
	{
		var fig, ep, sm,
		    von  = at.value.toLowerCase(),
		    nach = to.value.toLowerCase();
		try {
			SB.onBoard(von)  || Fehler("Ungültiges Feld");
			SB.onBoard(nach) || Fehler("Ungültiges Feld");
			fig = SB.getFigurAt(von);	// no piece at "von"
			SB.testSchach(fig, nach);	// Check not removed
			SB.capture(nach);
			// setting this.schlagen for an "en passant" move
			// does not cover the case where the captured pawn
			// is involved in a Checkmate situation
			ep = fig.enPassant();
			fig.move(nach);				// invalid move
			sm = SB.isSchachmatt(fig);
			// notate
			var comment = [
				SB.schlagen ? ":" : "-", 
				SB.schach   ? "+" : "", 
				"" // user comment, defined later
			]
			var entry = new HistoryEntry(fig, von, nach, comment);
			// modify for "en passant moves"
			if (ep instanceof HistoryEntry) {
				entry.comment[2] = " e.p."; // en passant
				setDisplay(ep.auf);         // remove image
				SB.position[ep.id]  = "xx"; // move piece to trash
			}
			if (sm) {
				entry.comment[1] = "#";
			}
		/*
			entry.comment[2] = "=D"; // upgrade B->D
		*/
			SB.notate(entry);
			add_note(entry);
			SB.toggle();
			ct.innerHTML = SB;
			setDisplay(von);
			setDisplay(nach, fig.symbol, "pointer");
		}
		catch (e) {
		//	alert(e.message);
			dump(e); // for debugging only
		}
		finally {
			SB.schlagen     = false;
			SB.schlagen_bak = false;
			to.value        = "";
			at.value        = "";
		}
	}
		
// execute Castling
	function rochade(type) 
	{
		var offs, king, rook, K_anf, R_anf, flds, entry, comment;
		try {
			// get affected King & Rook
			offs  = SB.offset(true);
			king  = SB.piece[offs];
			rook  = type ? SB.piece[offs+2] : SB.piece[offs+3];
			K_anf = king.pos;
			R_anf = rook.pos;
			// check conditions
			flds  = SB.rochade(king, rook);
			// move the pieces
			rook.move(flds[0]);
			king.shift(flds[1]); // must not be validated 
			// notate move
			comment = [
				type      ? "0-0-0" : "0-0", 
				SB.schach ? "+"   : "", 
				"" // user comment, defined later
			];
			entry = new HistoryEntry(king, rook.pos, king.pos, comment);
			SB.notate(entry);
			entry.typ = " ";
			add_note(entry); // special treatment!
			SB.toggle();
			// view
			ct.innerHTML = SB;
			setDisplay(K_anf);
			setDisplay(king.pos, king.symbol, "pointer");			
			setDisplay(R_anf);
			setDisplay(rook.pos, rook.symbol, "pointer");			
		}
		catch (e) {
		//	alert(e.message);
			dump(e); // for debugging only
		}
		finally
		{
			SB.schlagen     = false;
			SB.schlagen_bak = false;
			to.value        = "";
			at.value        = "";
		}
	}
	
// set events
	init : {
		var tmpfn;
		try {
			// enable mouse selection
			black.addEventForEach("click", fillFields);
			white.addEventForEach("click", fillFields);
			// check piece colour of start field
			at.addEvent("blur", startFeld);
			// attach button actions
			go.addEvent("click", exec);
			r1.addEvent("click", rochade, false, false);
			r2.addEvent("click", rochade, false, true);
			ng.addEvent("click", load, false, true);
			// rochade only for kings
			doro.call(tp);
			tp.addEvent("change", doro);
			// save current standings to cookie
			window.onbeforeunload = save;
			// replay game
			tmpfn = function ()
			{	// need the closure
				Replay(SB.moves);
			}
			rp.addEvent("click", tmpfn);
			// load a game from cookie
			load(false);
		}
		catch (e) {
			// there are no message exceptions...
			dump(e);
		}
	}
}

// replay current game
function Replay(history)
{
	if (!(history instanceof Array)) {
		throw new Error("Cannot replay game.");
	}
	var itvID, i, clr,
	    count = 0, 
	    farbe = "white",
	// board fields
	    black = Code.getElementsByClassName("black"),
	    white = Code.getElementsByClassName("white"),
	// status display
	    ct = document.getElementById("Zaehler"),
	// board
	    RP    = new Board();
	RP.moves  = history.slice(1);
	// other "global" variables
	const ListeG = [
		"e1", "d1", "a1", "h1", "c1", "f1", "b1", "g1", 
		"a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2", 
		"e8", "d8", "a8", "h8", "c8", "f8", "b8", "g8", 
		"a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"
	];
	const ListeF = [
		"King", "Queen", "Rook", "Rook", "Bishop", "Bishop", "Knight", "Knight", 
		"Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", 
		"King", "Queen", "Rook", "Rook", "Bishop", "Bishop", "Knight", "Knight", 
		"Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn", "Pawn"
	];
	const paar = {
		c1 : [ 0, "e1", "c1",  2, "a1", "d1"],
		g1 : [ 0, "e1", "g1",  3, "h1", "f1"],
		c8 : [16, "e8", "c8", 18, "a8", "d8"],
		g8 : [16, "e8", "g8", 19, "h8", "f8"]
	};

	function toggle()
	{
		if ("white" == farbe) {
			farbe = "black";
		}
		else {
			farbe = "white";
			count++;
		}
	}
	
	function display()
	{
		try {
			this.innerHTML = RP.getFigurAt(this.title).symbol;
		}
		catch (e) {
			this.innerHTML = "";
		}
	}
	
	function setDisplay(id, view)
	{
		document.getElementById(id).innerHTML = view || "";
	}

	function showMove()
	{
		var castle, player = RP.moves[count][farbe];
		// rochade
		if ("0-0" == player.comment[0] || "0-0-0" == player.comment[0]) {
			// get king / rook array
			castle = paar[player.auf];
			setDisplay(castle[1]);
			setDisplay(castle[2], RP.piece[castle[0]].symbol);
			setDisplay(castle[4]);
			setDisplay(castle[5], RP.piece[castle[3]].symbol);
		}
		else {
			setDisplay(player.von);
			setDisplay(player.auf, RP.piece[player.id].symbol);
		}
		toggle();
		if (RP.moves[count] === undefined || RP.moves[count][farbe] === undefined) {
			clearInterval(itvID);
		}
	}
	
	setup : {
		clr = "white";
		for (i = 0; i < 32; i++) {
			if (16 == i) {
				// set colour to black
				clr = "black";
			}
			var pos = ListeG[i];
			// create pieces
			RP.piece[i] = new window[ListeF[i]](i, clr, pos);
			RP.piece[i].observer = RP;
			RP.position[i] = pos;
		}
		// mount pieces on Board
		display.forEvery(black);
		display.forEvery(white);
	}
	
	play : {
		itvID = setInterval(showMove, 1000);
	}
}

function setFontStyle()
{
	function switcher()
	{
		if (!document.styleSheets) {
			return false;
		}
		var i, sel, theRules = [];
		if (document.styleSheets[0].cssRules) {
			theRules = document.styleSheets[0].cssRules;
		}
		else if (document.styleSheets[0].rules) {
			theRules = document.styleSheets[0].rules;
		}
		else {
			return false;
		}
		for (i = theRules.length; i--;) {
			sel = theRules[i].selectorText;
			if (sel.indexOf(".black") != -1 || sel.indexOf(".white") != -1) {
				theRules[i].style.fontFamily = this.value;
			}
		}
	}
	document.getElementById("font").addEvent("change", switcher);
}