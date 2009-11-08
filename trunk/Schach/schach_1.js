// user interaction, should define the form getter/setter and event stuff
// var Game = function(neu)
var Game = function()
{
	// input elements
	var at = document.getElementById("Von");	// start field
	var to = document.getElementById("Nach");	// target field
	var tp = document.getElementById("Art");	// piece type
	var ep = document.getElementById("bauer");	// en passent checkbox
	// buttons
	var go = document.getElementById("Los");	// make draw
	var r1 = document.getElementById("Klein");	// kleine Rochade
	var r2 = document.getElementById("Gross");	// große Rochade
	var ng = document.getElementById("Anfang");	// start new game
	// board fields
	var black = document.getElementsByClassName("black");
	var white = document.getElementsByClassName("white");
	// board
	var SB = new Board;

	// "en passant" only for pawns
	var pass = function()
	{
		if ("B" == this.value)
			ep.style.visibility = "visible";
		else
		{
			document.getElementById("enPassent").checked = false;
			ep.style.visibility = "hidden";
		}
	};

	var startFeld = function()
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
	var fillFields = function() 
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
					pass.call(tp);
				}
				else
					alert("Ungültiges Feld");
			}
			else if (!to.value)
				to.value = this.title;
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
	
	var view = function()
	{
		document.getElementById("Zaehler").innerHTML = SB;
		document.getElementById(at.value).innerHTML = "";
		document.getElementById(at.value).style.cursor = "default";
		document.getElementById(to.value).innerHTML = SB.getFigurAt(to.value).symbol;
		document.getElementById(to.value).style.cursor = "pointer";
	};
	
	var display = function()
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
	
	var load = function(neu)
	{
		// default placement (white first), K-D-T-L-S-B
		const ListeG = "e1d1a1h1c1f1b1g1a2b2c2d2e2f2g2h2e8d8a8h8c8f8b8g8a7b7c7d7e7f7g7h7";
		const ListeF = "KDTTLLSSBBBBBBBBKDTTLLSSBBBBBBBB";
		const types = { 
			K: "King", 
			D: "Queen", 
			T: "Rook", 
			L: "Bishop", 
			S: "Knight", 
			B: "Pawn" 
		};
		// if (neu) skip cookie, player name popup
		SB.zugNr       = 1;
		var Liste1     = ListeG;
		var Liste2     = ListeF;
		document.getElementById("Notation").innerHTML = "";
		if (neu)
		{
			SB.players[0]  = prompt("Wer spielt Weiß?", "Weiß");
			SB.players[1]  = prompt("Wer spielt Schwarz?", "Schwarz");
			SB.moves       = ["start"];
		}
		else if (null !== Code.readCookie("Farbe"))
		{
			SB.whiteOnDraw = Boolean(Code.readCookie("Farbe"));
			SB.players[0]  = Code.readCookie("Spieler1");
			SB.players[1]  = Code.readCookie("Spieler2");
			SB.zugNr       = Code.readCookie("Runde");
			var Liste1     = Code.readCookie("Aufstellung");
			var Liste2     = Code.readCookie("Figuren");
			var arrHis     = Code.readCookie("History").split("|");
			SB.moves[0]    = "loaded";
			for (var l, j=0, l=arrHis.length; j<l; j++)
			{
				var part = arrHis[j].split(",");
				if (!part[0]) continue;
				var InfoFarbe = function(os) 
				{
					this.von = part[os],
					this.auf = part[os+1],
					this.id  = part[os+2],
					this.typ = ListeF.charAt(part[os+2]),
					this.comment = [
						part[os+3],
						part[os+4],
						part[os+5]
					]
				};
				var w = new InfoFarbe(1);
				SB.moves.push({ runde: part[0], white: w });
				SB.whiteOnDraw = true;
				add_note(w);
				if (10 < part.length)
				{
					var b = new InfoFarbe(7);
					SB.moves[SB.moves.length-1].black = b;
					SB.whiteOnDraw = false;
					add_note(b);
				}
			}
			if (neu)
				SB.whiteOnDraw = true;
			else if (null !== Code.readCookie("Farbe"))
				SB.whiteOnDraw = Boolean(Code.readCookie("Farbe"));
		}
		else
		{
			Fehler("Spielstand kann nicht rekonstruiert werden.");
		}
		var clr = "white";
		for (var i=0; i<32; i++)
		{
			if (16 == i)
				clr = "black";
			var pos = Liste1.substr(2*i, 2);
			if (!SB.onBoard(pos) && "xx" != pos) 
				Fehler("Spielstand kann nicht rekonstruiert werden.");
			SB.piece[i] = new window[types[Liste2.charAt(i)]](i, clr, pos);
			SB.piece[i].observer = SB;
			SB.position[i] = pos;
		}
		// mount pieces on Board
		display.forEvery(black);
		display.forEvery(white);
	}

	var save = function()
	{
		var valid = 7; // days
		var hist = "", stell = "", art = ""; var x = SB;
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
				hist += ","+m.black.von+","+m.black.auf+","+m.black.id+","+m.black.comment[0]+","+m.black.comment[1]+","+m.black.comment[2];
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
	
	var add_note = function(info)
	{
		var li, ol = document.getElementById("Notation");
		if (SB.isWhiteDraw())
			li = ol.appendElement("li", "");
		else
		{
			var list = ol.getElementsByTagName("li");
			li = list[list.length-1];
		}
		var txt = info.typ+info.von+info.comment[0]+info.auf+info.comment[1]+" "+info.comment[2]+" ";
		txt = txt.replace("B", String.fromCharCode(160));
		var heid = "r"+SB.zugNr+(SB.isWhiteDraw() ? "w" : "b");
		li.appendElement("span", txt, { id: heid });
	}
	
	var exec = function()
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
			add_note(SB.notate(fig, von, nach));
			SB.toggle();
			view();
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
		
	var rochade1 = function() 
	{
		try
		{
			
		}
		catch (e)
		{
			alert(e.message);
		//	cleanUp();
		}
	};

	var rochade2 = function() 
	{
		try
		{
			
		}
		catch (e)
		{
			alert(e.message);
		//	cleanUp();
		}
	};
	
	init :
	{
		try
		{
			pass.call(tp); // reset after page reload
			// load a game from cookie
			load(false);
			// enable mouse selection
			black.addEventForEach("click", fillFields);
			white.addEventForEach("click", fillFields);
			// enable en passant move selection for pawns
			tp.addEvent("change", pass);
			// check piece colour of start field
			at.addEvent("blur", startFeld);
			// attach button actions
			go.addEvent("click", exec);
		//	r1.addEvent("click", rochade1);
		//	r2.addEvent("click", rochade2);
			ng.addEvent("click", load, false, true);
			// save current standings to cookie
			window.onbeforeunload = save;
		}
		catch (e)
		{
			alert(e.message);
			console.log(e.stack);
		}
	}	
}