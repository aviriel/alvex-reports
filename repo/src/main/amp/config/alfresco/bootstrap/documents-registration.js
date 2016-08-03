var fromString = args['from'];
var fromParts = fromString.split('-');
var from = new Date( fromParts[0], fromParts[1]-1, fromParts[2] );
var untilString = args['until'];
var untilParts = untilString.split('-');
var until = new Date( untilParts[0], untilParts[1]-1, untilParts[2] );

model.meta = [];
model.meta.push( { "field": "from", "type": "date", "value": fromString } );
model.meta.push( { "field": "until", "type": "date", "value": untilString } );

model.data = [];

var range = {};
var cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
var stopStr = until.getFullYear() + '.' + (until.getMonth()+1) +'.' + until.getDate();
var dateStr = from.getFullYear() + '.' + (from.getMonth()+1) +'.' + from.getDate();

while( ! dateStr.equals( stopStr ) )
{
  range[dateStr] = 0;
  cur.setDate( cur.getDate() + 1 );
  dateStr = cur.getFullYear() + '.' + (cur.getMonth()+1) +'.' + cur.getDate();
}
range[stopStr] = 0;

var dates = [];
for(k in range)
  dates.push(k);
dates = dates.sort();

var nodes = search.luceneSearch("TYPE:\"alvexdr:documentRegister\"");

for each (reg in nodes)
  for each (item in reg.children)
  {
    var regDate = item.properties['alvexdt:registerDate'];
    if( (regDate.getTime() >= from.getTime()) && (regDate.getTime() <= until.getTime()) )
    {
      range[regDate.getFullYear() + '.' + (regDate.getMonth()+1) +'.' + regDate.getDate()]++;
    }
  }

for (d in dates)
  model.data.push( { "x": dates[d], "y": range[ dates[d] ] } );

model.xCaption = "";
model.yCaption = "Documents registered";
model.yStyle = 'numbers';
model.yPrecision = '0';
