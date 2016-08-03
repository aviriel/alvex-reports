(function() {
	try {
		var reports = companyhome.childrenByXPath('/app:company_home/app:dictionary/app:alvex/app:reports')[0].children;
		model.reports = []
		for each(report in reports)
		{
			var isUniq = true;
			var name = report.name.replace(".js","");
			for each(rep in reports) {
				var re = new RegExp("^" + name + "-v[0-9]+.js", 'g');
				if( re.test(rep.name) )
					isUniq = false;
			}

			if( report.isDocument && isUniq )
				model.reports.push( {
					"title": (report.properties.title ? report.properties.title : report.properties.name),
					"desc": (report.properties.description ? report.properties.description : ''), 
					"params": (report.properties['alvexrp:parametersString'] ? report.properties['alvexrp:parametersString'] : ''),
					"ref": report.nodeRef.toString()
				} );
		}
	} catch (e) {
		status.code = 500;
		status.message = e.message;
		model.message = e.message;
	}
})();
