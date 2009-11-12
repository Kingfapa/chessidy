// user interaction, should define the form getter/setter and event stuff
// var Game = function(neu)
var Game = function()
{
	// input elements
	var at = document.getElementById("Von");	// start field
	var to = document.getElementById("Nach");	// target field
	var tp = document.getElementById("Art");	// piece type
	// buttons
	var go = document.getElementById("Los");	// make draw
	var r1 = document.getElementById("Klein");	// kleine Rochade
	var r2 = document.getElementById("Gross");	// große Rochade
	var ng = document.getElementById("Anfang");	// start new game
	// board fields
	var black  = document.getElementsByClassName("black");
	var white  = document.getElementsByClassName("white");
	// board
	var SB     = new Board;
	// other "global" variables
	var Liste1 = "e1d1a1h1c1f1b1g1a2b2c2d2e2f2g2h2e8d8a8h8c8f8b8g8a7b7c7d7e7f7g7h7";
	var Liste2 = "KDTTLLSSBBBBBBBBKDTTLLSSBBBBBBBB";

	// "Rochade" only for kings
	function doro()
	{
		if ("K" == this.value)
		{
			r1.style.visibility = "visible";
			r2.style.visibility = "visible";
		}
		else
		{
			r1.style.visibility = "hidden";
			r2.style.visibility = "hidden";
		}
	};

	function startFeld()
	{
		try
		{
			var fig = SB.getFigurAt(at.value);
			if (fig.isWhite() != SB.isWhiteDraw())
			{
				var farbe = (SB.isWhiteDraw()) ? "Weiß" : "Schwarz";
				Fehler("Falsche Figur, "+farbe+" is am Zug");
			}
		}
		catch (e)
		{//	var msg = e.message || e.description;
			alert(e.message);
			at.value = "";
		}
	};
	
	// fill form by mouse
	function fillFields() 
	{
		try
		{
			var hand = ("pointer" == this.style.cursor);
			if (!at.value)
			{
				if (hand)
				{
					var fig = SB.getFigurAt(this.title);
					if (fig.isWhite() != SB.isWhiteDraw())
					{
						var farbe = (SB.isWhiteDraw()) ? "Weiß" : "Schwarz";
						Fehler("Falsche Figur, "+farbe+" is am Zug");
					}
					at.value = this.title;
					tp.value = fig.toString().charAt(1);
					doro.call(tp);
				}
				else
				{
					alert("Ungültiges Feld");
				}
			}
			else if (!to.value)
			{
				to.value = this.title;
				go.focus();
			}
			else
			{
				at.value = "";
				to.value = "";
			}
		}
		catch (e)
		{
			alert(e.message);
			at.value = "";
		}
	};
	
	function view(v, b)
	{
		$("Zaehler").innerHTML = SB;
		setDisplay.call( $(v) );
		setDisplay.call( $(b), SB.getFigurAt(b).symbol, "pointer");
	};
	
	function setDisplay(view, shape)
	{
		this.innerHTML    = view  || "";
		this.style.cursor = shape || "default";
	}

	function display()
	{
		document.getElementsByTagName("caption")[0].innerHTML = SB.whois();
		document.getElementById("Zaehler").innerHTML = SB;
		try
		{
			this.innerHTML = SB.getFigurAt(this.title).symbol;
			this.style.cursor = "pointer";
		}
		catch (e)
		{
			this.innerHTML = "";
			this.style.cursor = "default";
		}
	};
	
	function load(neu)
	{
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
		var CookieFarbe = Code.readCookie("Farbe");
		// new game
		if (neu)
		{
			SB.whiteOnDraw = true;
			SB.players[0]  = prompt("Wer spielt Weiß?", "Weiß");
			SB.players[1]  = prompt("Wer spielt Schwarz?", "Schwarz");
			SB.moves       = ["start"];
		}
		// replace with cookie values
		else if (null !== CookieFarbe)
		{
			Liste1      = Code.readCookie("Aufstellung");
			Liste2      = Code.readCookie("Figuren");
			var arrHis  = Code.readCookie("History").split("|");
			// deserialize history
			SB.moves[0] = "loaded";
			for (var l, j=0, l=arrHis.length; j<l; j++)
			{
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
				var w = new InfoFarbe(1);
				SB.moves.push({ runde: part[0], white: w });
				// display history (white)
				SB.whiteOnDraw = true;
				add_note(w);
				if (10 < part.length)
				{	// set .moves property
					var b = new InfoFarbe(7);
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
		else
		{
			Fehler("Spielstand kann nicht rekonstruiert werden.");
		}
		create();
	}
	
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
		var clr = "white";
		for (var i=0; i<32; i++)
		{
			if (16 == i)
			{// set colour to black
				clr = "black";
			}
			var pos = Liste1.substr(2*i, 2);
			if (!SB.onBoard(pos) && "xx" != pos) 
			{
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
	
	function save()
	{
		var valid = 7; // days
		var hist = "", stell = "", art = "";
		for (var i=0; i<32; i++)
		{
			stell += SB.position[i];
			art   += SB.piece[i].shortType();
		}
		for (var l, j=1, l=SB.moves.length; j<l; j++)
		{
			var m = SB.moves[j];
			hist += m.runde+","+m.white.von+","+m.white.auf+","+m.white.id+","+m.white.comment[0]+","+m.white.comment[1]+","+m.white.comment[2];
			if (m.black)
			{
				hist += ","+m.black.von+","+m.black.auf+","+m.black.id+","+m.black.comment[0]+","+m.black.comment[1]+","+m.black.comment[2];
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
	};
	
	function add_note(info)
	{
		var txt, li, ol = document.getElementById("Notation");
		if (SB.isWhiteDraw())
		{
			li = ol.appendElement("li", "");
		}
		else
		{
			var list = ol.getElementsByTagName("li");
			li = list[list.length-1];
		}
	/*	if (info instanceof String)
		{
			txt = info;
		}
		else*/
		{
			txt = info.typ+info.von+info.comment[0]+info.auf+info.comment[1]+" "+info.comment[2]+" ";
			txt = txt.replace("B", String.fromCharCode(160)).replace(":", String.fromCharCode(10799));
		}
		var heid = "r"+SB.zugNr+(SB.isWhiteDraw() ? "w" : "b");
		li.appendElement("span", txt, { id: heid });
	}
	
	function exec()
	{
		var fig;
		var von = at.value.toLowerCase();
		var nach = to.value.toLowerCase();
		try
		{
			SB.onBoard(von)  || Fehler("Ungültiges Feld");
			SB.onBoard(nach) || Fehler("Ungültiges Feld");
			fig = SB.getFigurAt(von);	// no piece at "von"
			SB.testSchach(fig, nach);	// Check not removed
			SB.capture(nach);
			fig.move(nach);				// invalid move
			// notate
			var comment = [
				SB.schlagen ? ":" : "-", 
				SB.schach   ? "+" : "", 
				"" // user comment, defined later
			]
			var entry = new HistoryEntry(fig, von, nach, comment);
		/*
			entry.comment[2] = " e.p."; // en passant
			entry.comment[2] = "=D"; // upgrade B->D
			entry.comment[2] = " #"; // checkmate
		*/
			SB.notate(entry);
			add_note(entry);
			SB.toggle();
			view(von, nach);
		}
		catch (e)
		{
			alert(e.message);
			console.log(e.stack);
		}
		finally
		{
			SB.schlagen     = false;
			SB.schlagen_bak = false;
			to.value        = "";
			at.value        = "";
		}
	};
		
	function rochade(type) 
	{
		try
		{
			// get affected King & Rook
			var offs  = SB.offset(true);
			var king  = SB.piece[offs];
			var rook  = type ? SB.piece[offs+2] : SB.piece[offs+3];
			var K_anf = king.pos;
			var R_anf = rook.pos;
			// check conditions
			var flds  = SB.rochade(king, rook);
			// move the pieces
			rook.move(flds[0]);
			king.shift(flds[1]); // must not be validated 
			// notate move
			var comment = [
				type      ? "-0-" : "-", 
				SB.schach ? "+"   : "", 
				"" // user comment, defined later
			];
			// display
			var entry = new HistoryEntry(king, 0, 0, comment);
			entry.typ = " ";
			SB.notate(entry);
			add_note(entry);
			SB.toggle();
			// view
			document.getElementById("Zaehler").innerHTML = SB;
			setDisplay.call($(K_anf));
			setDisplay.call($(king.pos), king.symbol, "pointer");			
			setDisplay.call($(R_anf));
			setDisplay.call($(rook.pos), rook.symbol, "pointer");			
		}
		catch (e)
		{
			alert(e.message);
		}
		finally
		{
		//	SB.schlagen     = false;
		//	SB.schlagen_bak = false;
			to.value        = "";
			at.value        = "";
		}
	};

	init :
	{
		try
		{
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
			// load a game from cookie
			load(false);
			// save current standings to cookie
			window.onbeforeunload = save;
		}
		catch (e)
		{
			var txt = e.message || e.description;
			var stk = e.stack   || e.stacktrace;
			alert(txt);
			if (window.console)
			{
				window.console.log(stk);
			}
			else if (window.opera)
			{
				window.opera.postError(stk);
			}
		}
	}	
}