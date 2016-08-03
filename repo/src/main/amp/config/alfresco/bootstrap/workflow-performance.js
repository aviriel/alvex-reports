var maxDays = 14;

var fromString = args['from'];
var fromParts = fromString.split('-');
var from = new Date( fromParts[0], fromParts[1]-1, fromParts[2] );
var untilString = args['until'];
var untilParts = untilString.split('-');
var until = new Date( untilParts[0], untilParts[1]-1, untilParts[2] );

var defs = workflow.getLatestDefinitions();

var wfls = [];
for each( def in defs )
  if( workflowHelper.getCompletedWorkflowInstances( def.getId() ).length > 0 )
    wfls.push( { "label": def.getTitle(), "value": def.getName() } );

model.meta = [];
model.meta.push( { "field": "workflow", "type": "select", "values": wfls } );
model.meta.push( { "field": "from", "type": "date", "value": fromString } );
model.meta.push( { "field": "until", "type": "date", "value": untilString } );

var reqTypes = args['workflow'].split(',');

var types = [];
for each( type in reqTypes )
  for each( def in defs )
    if( type == def.getName() || type == '*' )
    {
      types.push( def.getId() );
    }

model.data = [];

var range = [];
for( var i = 0; i <= maxDays; i++ )
  range[i] = 0;

for each( type in types )
{
  var insts = workflowHelper.getCompletedWorkflowInstances( type );
  for each( inst in insts )
  {
    var end = inst.getEndDate();
    end.setHours(0);
    end.setMinutes(0);
    end.setSeconds(0);
    end.setMilliseconds(0);
    var start = inst.getStartDate();
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    if( (end.getTime() >= from.getTime() ) && (end.getTime() <= until.getTime()) )
    {
      var days = parseInt( ( end.getTime() - start.getTime() ) / (24*60*60*1000) );
      if( days > maxDays )
        days = maxDays;
      range[days]++;
    }
  }
}

var total = 0;
for ( var col in range )
  total += range[col];

for ( var col in range )
{
  var x = col;
  if( col == maxDays )
    x = '>=' + col;
  if( col < 10 )
    x = '0' + col;
  model.data.push( { "x": x, "y": parseInt(100*range[col]/total) } );
}

model.xCaption = "Days";
model.yCaption = "Completed, %";
model.yStyle = 'numbers';
model.yPrecision = '0';
