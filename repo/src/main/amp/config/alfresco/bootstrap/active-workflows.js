var defs = workflow.getLatestDefinitions();

model.data = [];

for ( d in defs )
{
  var title = defs[d].getTitle();
  var num = defs[d].getActiveInstances().length;
  if( num > 0 )
    model.data.push( { "x": title, "y": num } );
}

model.xCaption = "Workflows";
model.yCaption = "Active instances";
model.yStyle = 'numbers';
model.yPrecision = '0';
