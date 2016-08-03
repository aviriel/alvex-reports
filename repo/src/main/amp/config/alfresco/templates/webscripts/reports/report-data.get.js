function processMeta()
{
	if( !model.meta )
		return;

	var meta = model.meta;
	model.meta = [];
	for each( item in meta )
	{
		if( !item.values || item.values.length <= 0 )
		{
			var locItem = item;
			if( typeof(item["type"]) != undefined )
				locItem["type"] = "select";
			model.meta.push( locItem );
			continue;
		}
		var opts = item.values;
		opts = opts.sort(function (a, b) { return a.value.localeCompare(b.value); });
		var ret = [opts[0]];
		for (var i = 1; i < opts.length; i++)
			if (opts[i-1].value !== opts[i].value)
				ret.push(opts[i]);
		model.meta.push( { "field": item.field, "type": "select", "values": ret } );
	}
}

function processData()
{
	if( !model.data || model.data.length == 0 )
		return;

	var data = model.data;
	model.data = [];
	data = data.sort(function (a, b) { return a.x.localeCompare(b.x); });
	model.data.push(data[0]);
	for (var i = 1; i < data.length; i++)
		if (data[i-1].x !== data[i].x)
			model.data.push(data[i]);
}

function prepareSimpleResp()
{
	model.grouping = [];

	for each( item in model.data )
		if( item.objects && item.objects.length > 0 )
		{
			for( var opt in item.objects[0] )
				model.grouping.push(opt);
			break;
		}

	var resp = [];
	for( var d in model.data )
	{
		var obj = { 'x': model.data[d].x };
		if( model.data[d].objects )
			obj['y'] = model.data[d].objects.length;
		else 
			obj['y'] = ( !isNaN(model.data[d].y) ? model.data[d].y : 0 );
		resp.push( obj );
	}
	model.data = resp;
};

function processGrouping( showBy )
{
	var types = {};
	var byType = {};

	model.grouping = [];

	for each( item in model.data )
		if( item.objects.length > 0 )
		{
			for( var opt in item.objects[0] )
				model.grouping.push(opt);
			break;
		}

	for each( el in model.data )
	{
		byType[el.x] = {};
		for each(item in el.objects)
		{
			item[showBy] = showBy + '_' + item[showBy];
			if( byType[el.x][item[showBy]] ) {
				byType[el.x][item[showBy]]++;
			} else {
				byType[el.x][item[showBy]] = 1;
				types[item[showBy]] = item[showBy];
			}
		}
	}

	model.data = [];

	for (el in byType)
	{
		var obj = {};
		obj['x'] = el;
		for (type in types)
		{
			if( byType[el][type] )
				obj[type] = byType[el][type];
			else
				obj[type] = 0;
		}
		model.data.push( obj );
	}
};

(function() {
	try {
		model.config = {};

		model.config.reportRef = args['reportRef'].replace(' ' ,'');
		var report = search.findNode(model.config.reportRef);
		var script = (String)(report.content);
		eval( script );

		processMeta();
		processData();

		var groupBy = model.showBy;
		groupBy = ( groupBy ? groupBy : args['groupBy'] );
		if( groupBy ) {
			processGrouping( groupBy );
			model.config.groupBy = groupBy;
		} else {
			prepareSimpleResp();
			model.config.groupBy = '';
		}

	} catch (e) {
		status.code = 500;
		status.message = e.message;
		model.message = e.message;
	}
})();
