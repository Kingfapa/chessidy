var Figur = new Array(16); var Bild = new Array(32); var BildLeer;
/* Figur[i]: speichert das Feld von Figur  i, Bild[i]: speichert die Grafik von Figur i */
var Figur1; var VON; var NACH; var EnPass = false; var FigurEP;
/* Eingabe: Figurtyp, Anfangs-, Endfeld */
var ZugW = true; var NummerZug = 1;
/* ZugW: ob weiss am Zug ist, NummerZug: wievielte Runde */
var Schlagen = false; var Schach = false; var SchMatt = false;
var KeksA; var KeksN; /* Cookie-Bestandteile */
var Figur2; var Figur3; var Verzeichnis; /* Figur2: Figur auf Startfeld, Figur3: geschlagene Figur Verzeichnis: lokaler Ordner */
var ListeG = "e1d1a1h1c1f1b1g1a2b2c2d2e2f2g2h2e8d8a8h8c8f8b8g8a7b7c7d7e7f7g7h7";
var ListeL = "a1b1c1d1e1f1g1h1a2b2c2d2e2f2g2h2a3b3c3d3e3f3g3h3a4b4c4d4e4f4g4h4a5b5c5d5e5f5g5h5a6b6c6d6e6f6g6h6a7b7c7d7e7f7g7h7a8b8c8d8e8f8g8h8";
var Liste1 = "KDTTLLSSBBBBBBBBKDTTLLSSBBBBBBBB";
/* ListeG: Grundstellung, ListeL: alle Felder des Brettes */


function Aufstellung(grund) {
/* Zuweisung Aufstellung (ListeA) */
 var ListeA;
 ListeA = (document.cookie && grund == false) ? LiesCookie() : ListeG;
 if (grund == true) ListeA = SpielNeu();
/* Zuweisung Verzeichnis */
 var x = document.a1.src.lastIndexOf("/") + 1;
 Verzeichnis = document.a1.src.slice(0,x);
/* Zuweisung Grafik */
 for (var l = 0; l < 32; l++) Bild[l] = Verzeichnis + getFigurByNummer(l,true) + ".gif";
 BildLeer = Verzeichnis + "leer.gif";
/* leeres Brett & Aufstellung */
 for (var i = 0; i < 64; i++) {
  var x1 = ListeL.slice(2*i,2*i+2);
  document.getElementsByName(x1)[0].src = BildLeer;
 }
 for (var j = 0; j < 32; j++) {
  Figur[j] = ListeA.slice(2*j,2*j+2);
  if (Figur[j] != "xx") document.getElementsByName(Figur[j])[0].src = Bild[j];
 }
}

function LiesCookie() {
 var g1 = document.cookie.indexOf("A=");
 var g2 = document.cookie.indexOf("R=");
 var g2a = document.cookie.indexOf("#");
 var g3 = document.cookie.indexOf("F=");
 var g4 = document.cookie.indexOf("L1=");
 var g5 = document.cookie.indexOf("N=");
/* Aufstellung */
 if (g2 != -1) {//alle cookies angelegt.. auf gueltigkeit pruefen
  var ListeC = document.cookie.slice(g1+2,g1+66);
/* Zug Nummer */
  NummerZug = parseInt(document.cookie.slice(g2+2,g2a));
/* Farbe am Zug */
  ZugW = (document.cookie.slice(g3+2,g3+3) == "w") ? true : false;
  var Farbe = (ZugW == true) ? "weiss" : "schwarz";
/* Liste1 */
  Liste1 = document.cookie.slice(g4+3,g4+35);
/* Ausgabe der Werte */
  document.Formular.Zaehler.value = NummerZug + ". Zug: " + Farbe;
/* Notation */
  KeksN = document.cookie.substring(g5+3);
  var history = KeksN.split(",");
  for (var k = 0; k < history.length-1; k++) {
   document.getElementById("Notation").appendChild(document.createElement("li"));
   document.getElementsByTagName("li")[k].appendChild(document.createTextNode(history[k]));
  }
 }
 else ListeC = ListeG.substring(0,64);
return ListeC
}

function SpielNeu() {
 document.Formular.Zaehler.value = "1. Zug: weiss";          // Zaehler neu
 ZugW = true; Schach = false; Schlagen = false; SchMatt = false; EnPass = false;       // Vars neu
 document.cookie = "A=" + ListeG;//andere cookies lšschen
 document.cookie = "R=1#";
 document.cookie = "F=w";
 document.cookie = "L1=KDTTLLSSBBBBBBBBKDTTLLSSBBBBBBBB";
 document.cookie = "N=";
  var p3 = document.getElementById("Notation").childNodes.length;           // vorhandene Liste loeschen
  for (m = 0; m < p3; m++)  document.getElementById("Notation").removeChild(document.getElementById("Notation").firstChild);
return ListeG
}

function getFigurByNummer(nr,colr) {          /* bestimmt den Figurtyp aus i */
 var FigurName;
 var Liste2 = "";
 if (colr == false) FigurName = Liste1.charAt(nr);
 else {
  for (i = 0; i < 16; i++)  Liste2 = Liste2 + "w" + Liste1.charAt(i);
  for (j = 16; j < 32; j++)  Liste2 = Liste2 + "s" + Liste1.charAt(j);
  FigurName = Liste2.slice(2*nr,2*nr+2);
 }
return FigurName
}

function ZaehlVon(other) {
 var Xa;
 if (other == true) Xa = (ZugW == true) ? 16 : 0;          /* true: andere Farbe pruefen */
 else Xa = (ZugW == true) ? 0 : 16;
return Xa
}

function ZaehlBis(other) {
 var Xe;
 if (other == true) Xe = (ZugW == true) ? 32 : 16;
 else Xe = (ZugW == true) ? 16 : 32;
return Xe
}

function LiesDaten() {
 Figur1 = document.Formular.Art.value;
 VON = document.Formular.Von.value.toLowerCase();
 NACH = document.Formular.Nach.value.toLowerCase();
 document.Formular.Von.value = "";
 document.Formular.Nach.value = "";
 if (document.Formular.Pass.checked == true) EnPass = true;
}

function CheckEingabe() {
 var L1 = "abcdefgh";
 var L2 = "12345678";
 var ChkE = (L1.indexOf(VON.charAt(0)) != -1 && L2.indexOf(VON.charAt(1)) != -1 && L1.indexOf(NACH.charAt(0)) != -1 && L2.indexOf(NACH.charAt(1)) != -1) ? true : false;
 if (ChkE == false) Fehler(1);
 if (VON == NACH) { ChkE = false; Fehler(2); }
return ChkE
}

function CheckFigur() {
 var ChkF = false;
 for (var i = ZaehlVon(false); i < ZaehlBis(false); i++) {
  if (Figur[i] == VON) {
   var y1 = getFigurByNummer(i,false);
   Figur2 = i;
   ChkF = true;
  }
 }
 if (ChkF == false) Fehler(6);
 if (y1 != Figur1) {
  ChkF = false;
  if (y1 != null) alert("Fehler 2: Eingabefehler; Die Figur des Startfeldes (" + y1 + ") ist nicht die Figur aus der Eingabe (" + Figur1 + ").");
  else Fehler(3);
 }
 for (var j = ZaehlVon(false); j < ZaehlBis(false); j++) {
  if (Figur[j] == NACH) {
   Fehler(5);
   ChkF = false;
  }
 }
return ChkF
}

function CheckSchlagen() {
 for (var i = ZaehlVon(true); i < ZaehlBis(true); i++) {
  if (Figur[i] == NACH) {
   Figur[i] = "xx";
   Figur3 = i;
   Schlagen = true;
  }
 }
}

function CheckPass() {
 var ChkP1 = false; var ChkP2 = false;
 var hist = new Array();
 var L1 = "012345678";
 var ep = EnPass;
 var ep1 = (ZugW == true) ? 5 : 4;
 var ep2 = (ZugW == true) ? 7 : 2;
 var ep3 = (ZugW == true) ? 10 : 2;
 var ep4 = (ZugW == true) ? 13 : 5;
 var ep5 = (ZugW == true) ? 8 : 0;
 if (Figur1 == "B" && NummerZug > 1) {
  if (L1.indexOf(VON.charAt(1)) == ep1) ChkP1 = true; // ZugBauer auf richtiger Linie
  hist = KeksN.split(",");
  if (hist[hist.length-2].charAt(ep3) == ep2 && hist[hist.length-2].charAt(ep4) == ep1 && hist[hist.length-2].charAt(ep5) == " ") ChkP2 = true;     // GegnerBauer richtig gezogen
 }
 if (ChkP1 == true && ChkP2 == true) {
  Schlagen = true;
  for (var i = ZaehlVon(true); i < ZaehlBis(true); i++) {
   if (Figur[i] == hist[hist.length-2].slice(ep4-1,ep4+1)) {
    FigurEP = Figur[i];
    Figur[i] = "xx";
    Figur3 = i;
   }
  }
 }
 else {
  EnPass = false;
  if (ep == true) Fehler(10);
 }
}

function EntfKonig() {
 var d1 = Figur[16].charAt(0) - Figur[0].charAt(0);
 var d2 = Figur[16].charAt(1) - Figur[0].charAt(1);
 var ent = d1*d1 + d2*d2;
 var ChkK = (ent > 3) ? true : false;
return ChkK
}

function CheckZug(fig,ANF,END,error) {
 var Z1; var Z2; var Z3; var feld; // Z1, Z2 - Richtungskoeffizienten
 var ChkZ = false; var L1 = "abcdefgh"; var L2 = "12345678";
 var V1 = L1.indexOf(ANF.charAt(0)); var V2 = L2.indexOf(ANF.charAt(1));
 var N1 = L1.indexOf(END.charAt(0)); var N2 = L2.indexOf(END.charAt(1));
 if (V1 == -1 || N1 == -1) ChkZ = false;
 else {
  var dif1 = N1-V1;
  var dif2 = N2-V2;
  var quot = dif1/dif2;
  var entf = dif1*dif1 + dif2*dif2;
  var absl = Math.abs(dif1) + Math.abs(dif2);
  switch (fig) {
   case "K":
    ChkZ = (entf < 3) ? true : false;
    ChkZ = (EntfKonig() == true) ? true : false;
    break;
   case "D":
    ChkZ = (dif1 == 0 || dif2 == 0 || quot == 1 || quot == -1) ? true : false;
    break;
   case "T":
    ChkZ = (dif1 == 0 || dif2 == 0) ? true : false;
    break;
   case "L":
    ChkZ = (quot == 1 || quot == -1) ? true : false;
    break;
   case "S":
    ChkZ = (entf == 5) ? true : false;
    break;
   case "B":
    if (Schlagen == false) {
     if (ZugW == true) ChkZ = (dif1 == 0 && dif2 == 1) ? true : false;
     else ChkZ = (dif1 == 0 && dif2 == -1) ? true : false;
     if (V2 == 1) ChkZ = (dif1 == 0 && dif2 == 1 || dif1 == 0 && dif2 == 2) ? true : false;
     if (V2 == 6) ChkZ = (dif1 == 0 && dif2 == -1 || dif1 == 0 && dif2 == -2) ? true : false;
    }
    else {
     if (ZugW == true) ChkZ = (Math.abs(dif1) == 1 && dif2 == 1) ? true : false;
     else ChkZ = (Math.abs(dif1) == 1 && dif2 == -1) ? true : false;
    }
    break;
   }
  }
 if (ChkZ == false) { if (error == true) Fehler(4); }
 else {
  if (entf > 2 && fig != "S") { /* mind. 1 Zwischenfeld */
   if (dif1 == 0 || dif2 == 0 || quot == 1 || quot == -1) {
    if (dif1 == 0 || dif2 == 0) { /* gleiche Spalte/Zeile */
     Z1 = dif1/absl; Z2 = dif2/absl; Z3 = absl;
    }
    if (quot == 1 || quot == -1) { /* Diagonalen */
     Z1 = 2*dif1/absl; Z2 = 2*dif2/absl; Z3 = absl/2;
    }
    for (var i = 1; i < Z3; i++) {
     feld = L1.charAt(V1 + Z1*i) + L2.charAt(V2 + Z2*i);
     for (var j = 0; j < 32; j++) { if (Figur[j] == feld) ChkZ = false; }
    }
   }
   if (ChkZ == false && error == true) Fehler(5);
  }
 }
return ChkZ
}

function CheckSchach() {
 var ches = false;
 for (var i = ZaehlVon(false); i < ZaehlBis(false); i++) {
  var temp = Schlagen; Schlagen = true;
  var ches1 = (ZugW == true) ? CheckZug(getFigurByNummer(i,false),Figur[i],Figur[16],false) : CheckZug(getFigurByNummer(i,false),Figur[i],Figur[0],false);
  Schlagen = temp;
  if (ches1 == true) ches = true;
 }
 if (ches == true) {
  if (SchachMatt() == false) {
   if (ZugW == true) alert("Weiss: \"Schach!\"");
   else alert("Schwarz: \"Schach!\"");
  }
 }
return ches
}

function CheckSchach2() {
 var ches2 = true; var tmp1;
 for (var j = 0; j < 32; j++) {
  if (Figur[j] == VON) {
   Figur[j] = NACH;
   tmp1 = j;
  }
 }
 for (var i = ZaehlVon(true); i < ZaehlBis(true); i++) {
  var temp = Schlagen; Schlagen = true;
  var ches3 = (ZugW == true) ? CheckZug(getFigurByNummer(i,false),Figur[i],Figur[0],false) : CheckZug(getFigurByNummer(i,false),Figur[i],Figur[16],false);
  Schlagen = temp;
  if (ches3 == true) ches2 = false;
 }
 if (ches2 == false) Fehler(7);
 Figur[tmp1] = VON;
return ches2
}

function SchachWeg() {
 var ok = true;
 var ziel = (ZugW == true) ? Figur[0] : Figur[16];
/* Koenig weicht aus */
 var temp = Schlagen; Schlagen = true;
 for (var i = ZaehlVon(true); i < ZaehlBis(true) ; i++ ) {
  if (CheckZug(getFigurByNummer(i,false),Figur[i],ziel,false) == true) ok = false;
 }
 Schlagen = temp;
 if (ok == false) Fehler(7);
 else Schach = false; // ok = true -> schach = false
return ok
}

function SchachMatt() {
 var tmp; var tmp1; var tmp2; var tmp3;
 var m2 = 0; var m3 = 0;
 var ChkM1 = false; var ChkM2 = true; var chM = 0;
 var Matt = new Array(9); var FigM = new Array(16);
 var K1; var K2; var K3; var feld;
 var L1 = "abcdefgh"; var L2 = "12345678";
 var m1 = (ZugW == true) ? 16 : 0;     // Weiss dran, schwarzen Koenig testen
/* freie Felder um Koenig bestimmen */
 for (var i = 0; i < 64; i++) {
  var AlleFelder = ListeL.slice(2*i,2*i+2);
  var Anf = AlleFelder;
  var End = Figur[m1];
  var DF1 = L1.indexOf(End.charAt(0))-L1.indexOf(Anf.charAt(0));
  var DF2 = L2.indexOf(End.charAt(1))-L2.indexOf(Anf.charAt(1));
  var entf = DF1*DF1 + DF2*DF2;
  if (entf < 3) {
   tmp = false;
   for (var j = ZaehlVon(true); j < ZaehlBis(true); j++) { if (AlleFelder == Figur[j]) tmp = true; }
   if (tmp == false) {
    Matt[m2] = AlleFelder;
    m2++;
   }
  }
 }
/* pruefen, ob alle Felder gedeckt sind */
 tmp3 = Figur[m1];
 for (var k = 0; k < m2; k++) {
  tmp = false;
  Figur[m1] = Matt[k];
  for (var l = ZaehlVon(false); l < ZaehlBis(false); l++) {
   tmp1 = Schlagen; Schlagen = true;
   if (CheckZug(getFigurByNummer(l,false),Figur[l],Figur[m1],false) == true) tmp = true;
   Schlagen = tmp1;
  }
  if (tmp == true) chM++;
 }
 Figur[m1] = tmp3;
 if (chM == m2) ChkM1 = true;
/* welche Figur gibt Schach? */
 for (var n = ZaehlVon(false); n < ZaehlBis(false); n++) {
  if (CheckZug(getFigurByNummer(n,false),Figur[n],Figur[m1],false) == true) {
   FigM[m3] = n;
   m3++;
  }
 }
/* (dazwischenstellen oder) schlagen */
 if (m3 == 1) {
  tmp2 = ZugW;
  ZugW = (ZugW == true) ? false : true;
  tmp1 = Schlagen;
  Anf = Figur[FigM[0]];
  End = Figur[m1];
  var V1 = L1.indexOf(Anf.charAt(0)); var V2 = L2.indexOf(Anf.charAt(1));
  var N1 = L1.indexOf(End.charAt(0)); var N2 = L2.indexOf(End.charAt(1));
  DF1 = N1-V1;
  DF2 = N2-V2;
  entf = DF1*DF1 + DF2*DF2;
  var quot = DF1/DF2;
  var abso = Math.abs(DF1) + Math.abs(DF2);
  for (var o = ZaehlVon(false)+1; o < ZaehlBis(false); o++) {
   if (DF1 == 0 || DF2 == 0 || quot == 1 || quot == -1) {
    if (DF1 == 0 || DF2 == 0) {
     K1 = DF1/abso; K2 = DF2/abso; K3 = abso;           // K1,K2: Richtungskoeff. (= +1/-1), K3 schrittzahl
    }
    if (quot == 1 || quot == -1) {
     K1 = 2*DF1/abso; K2 = 2*DF2/abso; K3 = abso/2;
    }
    for (var q = 0; q < K3; q++) {
     feld = L1.charAt(V1 + K1*q) + L2.charAt(V2 + K2*q);
     Schlagen = (q == 0) ? true : false;
     if (CheckZug(getFigurByNummer(o,false),Figur[o],feld,false) == true) ChkM2 = false;
    }
   }
   if (entf == 5) {
    Schlagen = true;
    if (CheckZug(getFigurByNummer(o,false),Figur[o],Anf,false) == true) ChkM2 = false;
   }
  }
  Schlagen = tmp1;
  ZugW = tmp2;
 }
 SchMatt = (ChkM1 == true && ChkM2 == true) ? true : false;
 if (SchMatt == true && ZugW == true) alert("Weiss: \"Schachmatt!\"");
 if (SchMatt == true && ZugW == false) alert("Schwarz: \"Schachmatt!\"");
return SchMatt
}

function ZugAnzeigen() {
 var Aufstellung = "";
 if (Figur == "B") {    /* wenn Bauer hinten ankommt */
  if ((ZugW == true && NACH.charAt(1) == 8) || (ZugW == false && NACH.charAt(1) == 1))
   var Bauer = window.open("input.html","Eingabe","menubar=no,width=300,height=100");
 }
 for (var i = 0; i < 32; i++) {
  if (Figur[i] != "xx") document.getElementsByName(Figur[i])[0].src = Bild[i];          /* Neuzuordnung */
  Aufstellung = Aufstellung + Figur[i];
 }
 document.getElementsByName(VON)[0].src = BildLeer;          /* Ausgangsfeld leer */
 if (EnPass == true) document.getElementsByName(FigurEP)[0].src = BildLeer;
 KeksA = Aufstellung;                                        /* COOKIE, Aufstellung (aus Figur[i]) */
}

function SetVal() {
 var ListeTmp = "";
 for (var i = 0; i < 32; i++) {
  if (Figur[i] != VON) ListeTmp = ListeTmp + Liste1.charAt(i);// if i != Figur2 ...
  else ListeTmp = ListeTmp + document.Eingabe.Wahl.value;
 }
 Liste1 = ListeTmp;
 Bild[Figur2] = Verzeichnis + getFigurByNummer(Figur2,true) + ".gif";
 window.close();
}

function Ausgabe(roch) {
 var d1; var d2; var d3; var Zug;
 switch(roch) {
  case "no":
   d1 = (Figur1 == "B") ? " " : Figur1;          /* (Teil)Notation setzen */
   d2 = (Schlagen == false) ? "-" : ":";
   d3 = (Schach == false) ? "  " : "+ ";
   if (EnPass == true) d3 = "% ";
   if (SchMatt == true) d3 = "++";
   Zug =  d1 + VON + d2 + NACH + d3;
  break;
  case "kl":
   Zug = "   0-0  ";
  break;
  case "gr":
   Zug = " 0-0-0  ";
  break;
 }
 if (ZugW == true) {          /* Weiss am Zug, neuer Listenpunkt */
  document.getElementById("Notation").appendChild(document.createElement("li"));
  document.getElementsByTagName("li")[NummerZug-1].appendChild(document.createTextNode(Zug));
 }
 else {                       /* schwarz am Zug, aktualisierter Listenpunkt */
 var LIText = document.createTextNode(document.getElementsByTagName("li")[NummerZug-1].firstChild.data + Zug);
 var ListNode = document.getElementById("Notation").lastChild;
 document.getElementsByTagName("li")[NummerZug-1].replaceChild(LIText,ListNode.firstChild);
 }
 KeksN = "";                  /* COOKIE, Notation (wird immer aus liste neu ausgelesen) */
 for (var i = 0; i < NummerZug; i++) KeksN = KeksN + document.getElementsByTagName("li")[i].firstChild.data + ",";
 var Farbe = (ZugW == false) ? "weiss" : "schwarz";
 if (ZugW == false) NummerZug++;
 document.Formular.Zaehler.value = NummerZug + ". Zug: " + Farbe;          /* Zaehler setzen */
 document.Formular.Pass.checked = false;
}

function SetzeVars() {
 ZugW = (Figur2 < 16) ? false : true;
 Schlagen = false;
 EnPass = false;
 var farbe = (ZugW == true) ? "w" : "s";
 /* Cookie-Aufbau: #A[Aufstellung] #Runde[NummerZug]# #Farbe[ZugW] #L[Liste1] #N[Notation] */
 document.cookie = "A=" + KeksA;
 document.cookie = "R=" + NummerZug + "#";
 document.cookie = "F=" + farbe;
 document.cookie = "L1=" + Liste1;
 document.cookie = "N=*" + KeksN;
}

function CheckIt(num) {
 var Chkval = false;
 switch(num) {
  case 0:
   ChkVal = CheckEingabe();
  break;
  case 1:
   ChkVal = CheckFigur();
  break;
  case 2:
   ChkVal = CheckZug(Figur1,VON,NACH,true);
  break;
  case 3:
   ChkVal = CheckSchach2();
  break;
  case 4:
   ChkVal = SchachWeg();
  break;
 }
return ChkVal
}

function Starten() {
 var OK = true;
 LiesDaten();
 CheckSchlagen();
 if (EnPass == true) CheckPass();//reparaturroutine!
 for (var j = 0; j < 4; j++) { if (CheckIt(j) == false) OK = false; } /* Eingabe, Figur, Zug, Eigenschach pruefen */
 if (OK == true) {
  for (var i = 0; i < 32; i++) { if (Figur[i] == VON) Figur[i] = NACH; } /* Figur ziehen */
  if (Schach == false) {
   Schach = CheckSchach();
   ZugAnzeigen();
   Ausgabe("no");
   SetzeVars();
  }
  else {
   if (SchachWeg() == true) {
    Schach = CheckSchach();
    ZugAnzeigen();
    Ausgabe("no");
    SetzeVars();
   }
  }
 }
 else {
  if (Schlagen == true) {
   Figur[Figur3] = NACH;
   Schlagen = false;
  }
  if (EnPass == true) {
   Figur[Figur3] = FigurEP;
   Schlagen = false;
   EnPass = false;
  }
 }
}

function Rochade(size) {
 var Feld = new Array(5);
 var f1; var f2;
 var ChkR1 = true; var ChkR2 = false; ChkR3 = true;
/* Setzen der zu ueberpruefenden Felder */
 if (ZugW == true && size == 0) { Feld[0] = "e1"; Feld[1] = "f1"; Feld[2] = "g1"; Feld[3] = "h1"; Kng = "Ke1"; Trm = "Th1"; f1 = 0; f2 = 3; }
 if (ZugW == true && size == 1) { Feld[0] = "e1"; Feld[1] = "d1"; Feld[2] = "c1"; Feld[3] = "b1"; Feld[4] = "a1"; Kng = "Ke1"; Trm = "Ta1"; f1 = 0; f2 = 2; }
 if (ZugW == false && size == 0) { Feld[0] = "e8"; Feld[1] = "f8"; Feld[2] = "g8"; Feld[3] = "h8"; Kng = "Ke8"; Trm = "Th8"; f1 = 16; f2 = 19; }
 if (ZugW == false && size == 1) { Feld[0] = "e8"; Feld[1] = "d8"; Feld[2] = "c8"; Feld[3] = "b8"; Feld[4] = "a8"; Kng = "Ke8"; Trm = "Ta8"; f1 = 16; f2 = 18; }
/* Pruefen auf Schach */
 var temp = Schlagen; Schlagen = true;
 for (var i = ZaehlVon(true); i < ZaehlBis(true); i++) {
  for (var j = 0; j < 3; j++) {
   if (CheckZug(getFigurByNummer(i,false),Figur[i],Feld[j],false) == true) ChkR1 = false;
  }
 }
 Schlagen = temp;
/* im Cookie pruefen */
 var r1 = document.cookie.substring(document.cookie.indexOf("N=")+3,document.cookie.lastIndexOf(","));
 var r2 = r1.indexOf(Kng);
 var r3 = r1.indexOf(Trm);
 if (r2 == -1 && r3 == -1) ChkR2 = true;
/* pruefen, ob keine Figur im Weg */
 for (k = 1; k < 3+size; k++) {
  for (l = 0; l < 32; l++) {
   if (Feld[k] == Figur[l]) ChkR3 = false;
  }
 }
/* Figuren setzen */
 if (ChkR1 == false) Fehler(8);
 if (ChkR2 == false) Fehler(9);
 if (ChkR3 == false) Fehler(5);
 if (ChkR1 == true && ChkR2 == true && ChkR3 == true) {
  Figur[f1] = Feld[2]; /* koenig */
  Figur[f2] = Feld[1]; /* turm */
  document.getElementsByName(Feld[0])[0].src = BildLeer;
  document.getElementsByName(Feld[3+size])[0].src = BildLeer;
  document.getElementsByName(Feld[2])[0].src = Bild[f1];
  document.getElementsByName(Feld[1])[0].src = Bild[f2];
 if (size == 0) Ausgabe("kl");
 if (size == 1) Ausgabe("gr");
 Figur2 = (ZugW == true) ? 2 : 17;
 SetzeVars();
 }
}

function Fehler(num) {
 var meldung;
 switch (num) {
  case 1:
   meldung = "Fehler 1a: keine gueltige Eingabe beim Start-/Zielfeld";
  break;
  case 2:
   meldung = "Fehler 1b: Start- und Zielfeld sind identisch";
  break;
  case 3:
   meldung = "Fehler 3: Eingabefehler; Die Figur des Startfeldes hat die falsche Farbe";
  break;
  case 4:
   meldung = "Fehler 4: ungueltiger Zug - irregulaeres Zielfeld";
  break;
  case 5:
   meldung = "Fehler 5: ungueltiger Zug - Figur steht im Weg";
  break;
  case 6:
   meldung = "Fehler 6: Ausgangsfeld unbesetzt / keine Figur vorhanden";
  break;
  case 7:
   meldung = "Fehler 7: ungueltiger Zug - eigener Koenig steht im Schach";
  break;
  case 8:
   meldung = "Fehler 8: Eines der Rochadefelder steht im Schach";
  break;
  case 9:
   meldung = "Fehler 9: Eine der Figuren wurde schon einmal bewegt";
  break;
  case 10:
   meldung = "Fehler 10: Schlagen 'en passent' nicht moeglich";
  break;
 }
 alert(meldung);
}
//g3xxxxxxxxxxxxxxxxb3c5xxe3e5g2h4f7xxa2f5d3xxb4xxxxxxxxxxxxxxxxh6#R=44:#F=w#L=KDTTLLSSBBBBBBBBKDTTLLSSBBBBBBBB#N= d2-d4  Sg8-f6  , c2-c3   d7-d6  , h2-h4  Lc8-g4  , f2-f3  Lg4-d7  ,Sb1-d2   e7-e5  , d4:e5   d6:e5  ,Sd2-c4   e5-e4  ,Lc1-g5  Ld7-b5  ,Sc4-e5  Dd8-d5  ,Dd1:d5  Sf6:d5  , 0-0-0  Lf8-c5  ,Td1:d5     0-0  ,Td5:c5   a7-a6  ,Tc5:c7   h7-h6  ,Sg1-h3   f7-f6  ,Se5-g6  Tf8-d8  ,Sg6-e7+ Kg8-f8  ,Se7-g6+ Kf8-e8  ,Tc7:b7  Sb8-c6  ,Tb7-e7+ Sc6:e7  ,Sg6-f4   f6:g5  , f3:e4   g5:f4  ,Sh3:f4  Lb5-a4  , b2-b3  La4-c6  , e2-e3  Ta8-c8  ,Lf1:a6  Tc8-a8  ,Th1-d1  Ta8:a6  , c3-c4  Ta6:a2  ,Sf4-h5  Ta2-a1+ ,Kc1-b2  Ta1:d1+ ,Sh5:g7+ Ke8-f7+ ,Sg7-h5  Td8-d2+ ,Kb2-a3  Td1-a1+ ,Ka3-b4  Ta1-a4+ ,Kb4-c3  Td2-d6+ , c4-c5  Se7-d5+ ,Kc3-d3  Sd5-b4+ ,Kd3-e2  Ta4-a2+ ,Ke2-f3  Lc6-b5  ,Sh5-g3  Td6-f6+ ,Sg3-f5  Lb5-e2+ ,Kf3-g3  Le2-d3  , e4-e5  Tf6:f5  ,