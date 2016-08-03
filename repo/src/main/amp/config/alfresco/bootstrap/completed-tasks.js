model.data = [];

var now = new Date();
var ticket = session.getTicket();
var managees = orgchart.getPerson( person.properties.userName ).managees;

var userConstraint = [];
for each( user in managees )
	userConstraint.push( { "label": user.firstName + ' ' + user.lastName, "value": user.userName } );

var fromString = args['from'];
var fromParts = fromString.split('-');
var from = new Date( fromParts[0], fromParts[1]-1, fromParts[2] );
var untilString = args['until'];
var untilParts = untilString.split('-');
var until = new Date( untilParts[0], untilParts[1]-1, untilParts[2] );

model.meta = [];
model.meta.push( { "field": "user", "type": "select", "values": userConstraint } );
model.meta.push( { "field": "from", "type": "date", "value": fromString } );
model.meta.push( { "field": "until", "type": "date", "value": untilString } );

var reqUsers = args['user'].split(',');

var users = [];
for each( user in managees )
  for each( ruser in reqUsers )
    if( user.userName == ruser || ruser == '*' )
    {
      users.push( user );
      break;
    }

if( users.length == 0 )
	model.messageID = "alvex.reports.error.noManagees";

model.data = [];

for each( user in users)
{
  var connector = remoteService.connect("alfresco");
  var resp = eval('(' + connector.get('/api/task-instances?authority=' + encodeURIComponent(user.userName) + '&state=COMPLETED&alf_ticket=' + ticket) + ')');
  var tasks = [];
  for each(task in resp.data)
  {
    if( task.properties['bpm_completionDate'] == null )
      continue;
    var completionDate = utils.fromISO8601( task.properties['bpm_completionDate'] );
    completionDate.setHours(0);
    completionDate.setMinutes(0);
    completionDate.setSeconds(0);
    completionDate.setTime( completionDate.getTime() - completionDate.getTime() % 1000 );
    if( (from.getTime() - completionDate.getTime() > 0 ) || (until.getTime() - completionDate.getTime() < 0 ) )
      continue;
    if( task.properties['bpm_dueDate'] )
    {
      var dueDate = utils.fromISO8601( task.properties['bpm_dueDate'] );
      var daysDiff = parseInt( (dueDate.getTime() - completionDate.getTime()) / ( 1000 * 60 * 60 * 24 ) );
      if( daysDiff < -7 )
        daysDiff = -7
      if( daysDiff >= 0 )
        daysDiff = 0;
    } else {
      daysDiff = 0;
    }
    tasks.push({/*'type': task.name,*/ 'prio': task.properties['bpm_priority'], 'inTime': daysDiff});
  }
  model.data.push( {"x": user.firstName + ' ' + user.lastName, "y": tasks.length, "objects": tasks} );
}


model.xCaption = 'Person';
model.yCaption = 'Completed Tasks';
model.yStyle = 'numbers';
model.yPrecision = '0';
model.xCaptionRotation = '90';
