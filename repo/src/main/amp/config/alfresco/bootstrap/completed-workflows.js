var fromString = args['from'];
var fromParts = fromString.split('-');
var from = new Date( fromParts[0], fromParts[1]-1, fromParts[2] );
var untilString = args['until'];
var untilParts = untilString.split('-');
var until = new Date( untilParts[0], untilParts[1]-1, untilParts[2] );

model.meta = [];
model.meta.push( { "field": "from", "type": "date", "value": fromString } );
model.meta.push( { "field": "until", "type": "date", "value": untilString } );

var defs = workflow.getLatestDefinitions();

model.data = [];

for ( d in defs )
{
  var title = defs[d].getTitle();
  var insts = workflowHelper.getCompletedWorkflowInstances( defs[d].getId() );
  var num = 0;
  for each( inst in insts )
  {
    var end = inst.endDate;
    end.setHours(0);
    end.setMinutes(0);
    end.setSeconds(0);
    if( (end.getTime() >= from.getTime() ) && (end.getTime() <= until.getTime()) )
      num++;
  }
  if( num > 0 )
    model.data.push( { "x": title, "y": num } );
}

model.xCaption = "Workflows";
model.yCaption = "Completed instances";
model.yStyle = 'numbers';
model.yPrecision = '0';
