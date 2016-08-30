var express = require('express');
var app = express();
var fs = require('fs');
var crypto = require('crypto');
var pdf = require('pdfkit');
var qr = require('qrcode');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

var form = '<form method="post" action="/gera_etiqueta">'+
  'Descrição: <input type="text" name="descricao"><br/>'+
  'Código: <input type="text" name="codigo"><br/>'+
  'Valor: <input type="text" name="valor"><br/>'+
  '<input type="submit" value="gerar">'+
  '</form>';


  function fn(n){
  var patt = new RegExp('[^0-9]');
  var pad = '000';

  if (patt.test(n))
    return null;

  var tmp = parseInt(n);

  if (isNaN(tmp) || tmp <= 0)
    return null;

  n = String(tmp);

  if (n.length > 3)
    return null;
  else if (n.length < 3) 
    return pad.slice(n.length, 3) + n;
  else
    return n;
}

var gera_etiqueta = function(descricao, codigo, valor, res) {
  var doc = new pdf({size: 'A4', layout: 'portrait', margin: 0});
  doc.pipe(res);
  var w = 3;

  var draw_qrcode = function(err, vector, side) {

    for (var by = 0; by < 7; by++) {
      for (var bx = 0; bx < 5; bx++) {
        for (var i = 0; i < vector.length; i++) {
          var row = Math.floor(i / side);
          var col = i % side;

          var x = col * w + 50 + ((side * w + 15) * bx);
          var y = row * w + 40 + ((side * w + 25) * by);

          if (vector[i] == 1)
            doc.rect(x, y, w, w).fill();


        }
        doc.fontSize(12).text('R$ '+valor, x-60, y+5);
      }
      //doc.moveTo(10,((side * w + 15) * by)+33).lineTo(((side * w + 15) * bx)+10, ((side * w + 15) * by)+33).stroke();
    }
  }

  for(var i=0; i<1; i++) {

    var delta = (i % 3) * 245+30;

    var w2 = w + delta;
    qr.drawBitArray(JSON.stringify({cod: parseInt(codigo), valor: parseInt(valor)}), draw_qrcode);
    doc.fontSize(12).text(descricao+' / R$ '+valor, 5, 5, {align: 'center' });
  } 

  doc.end();
}

app.get('/gera_etiqueta', function (req, res) {
  res.send(form);
});

app.post('/gera_etiqueta', function (req, res) {
  var descricao = req.body.descricao;
  var valor = req.body.valor;
  var codigo = req.body.codigo;
  return gera_etiqueta(descricao, codigo, valor, res);

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
