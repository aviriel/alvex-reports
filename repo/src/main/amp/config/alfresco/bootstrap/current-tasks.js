model.data = [];

var now = new Date();
var ticket = session.getTicket();
var managees = orgchart.getPerson( person.properties.userName ).managees;

var userConstraint = [];
for each( user in managees )
	userConstraint.push( { "label": user.firstName + ' ' + user.lastName, "value": user.userName } );

model.meta = [];
model.meta.push( { "field": "user", "type": "select", "values": userConstraint } );

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
  var resp = eval('(' + connector.get('/api/task-instances?authority=' + encodeURIComponent(user.userName) + '&alf_ticket=' + ticket) + ')');
  var tasks = [];
  for each(task in resp.data)
  {
    if( task.properties['bpm_dueDate'] )
    {
      var dueDate = utils.fromISO8601( task.properties['bpm_dueDate'] );
      var daysDiff = parseInt( (dueDate.getTime() - now.getTime()) / ( 1000 * 60 * 60 * 24 ) );
      if( daysDiff < 0 )
        daysDiff = -1
      if( daysDiff > 7 )
        daysDiff = 7;
    } else {
      daysDiff = 7;
    }
    tasks.push({/*'type': task.name,*/ 'prio': task.properties['bpm_priority'], 'due': daysDiff});
  }
  model.data.push( {"x": user.firstName + ' ' + user.lastName, "y": tasks.length, "objects": tasks} );
}


model.xCaption = 'Person';
model.yCaption = 'Current Tasks';
model.yStyle = 'numbers';
model.yPrecision = '0';
model.xCaptionRotation = '90';
