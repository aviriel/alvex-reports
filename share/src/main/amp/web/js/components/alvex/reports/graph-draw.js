/**
 * Copyright © 2012 ITD Systems
 *
 * This file is part of Alvex
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Ensure root object exists
if (typeof Alvex == "undefined" || !Alvex)
{
	var Alvex = {};
}

(function()
{
	var Dom = YAHOO.util.Dom,
		Event = YAHOO.util.Event,
		KeyListener = YAHOO.util.KeyListener;
	var $html = Alfresco.util.encodeHTML,
		$combine = Alfresco.util.combinePaths;

	Alvex.ReportsGraph = function(htmlId)
	{
		Alvex.ReportsGraph.superclass.constructor.call(this, "ReportsGraph", htmlId);
		YAHOO.Bubbling.on("formContentReady", this.onFormContentReady, this);
		return this;
	};

	YAHOO.extend(Alvex.ReportsGraph, Alfresco.component.Base,
	{
		options:
		{
			initialized: false,
			ref: '',
			parameters: [],
			viewType: 'graph',
			groupBy: ''
		},

		onFormContentReady: function()
		{
			if(!this.options.initialized) {
				this.options.initialized = true;
				this.init();
			}
		},

		onReady: function OrgchartViewer_onReady()
		{
			if(!this.options.initialized) {
				this.options.initialized = true;
				this.init();
			}
		},
		
		init: function()
		{
			if( typeof(d3) == 'undefined' )
				this.options.viewType = 'table';
			
			YAHOO.Bubbling.on("changeReport", this.onReportChanged, this);
			YAHOO.Bubbling.on("updateMeta", this.onMetaUpdate, this);
			YAHOO.Bubbling.on("createLegend", this.onCreateLegend, this);
			YAHOO.Bubbling.on("noReportData", this.onEmptyReport, this);
			YAHOO.Bubbling.on("drawGraph", this.onDrawGraph, this);
			YAHOO.Bubbling.on("drawTable", this.onDrawTable, this);
			Dom.get( this.id + '-graph-header' ).innerHTML = this.msg("alvex.reports.selectReport.header");
			Dom.get( this.id + '-graph-desc' ).innerHTML = this.msg("alvex.reports.selectReport.desc")

			// Determine real canvas size
			var areaEl = Dom.get( 'alvex-graph' ).parentNode.parentNode;
			this.options.width = areaEl.clientWidth;

			var header = Dom.get("alf-hd");
			var wrapper = header.parentNode.parentNode;
			var footer = Dom.get("alf-ft").parentNode;

			this.options.height = wrapper.clientHeight - header.clientHeight - footer.clientHeight;
		},

		onEmptyReport: function(layer, args)
		{
			var msgs = args[1];
			var msg;
			if( msgs.msgID )
				msg = this.msg( msgs.msgID );
			else if( msgs.msg )
				msg = msgs.msg;
			else
				msg = this.msg("alvex.reports.emptyReport")
			Alfresco.util.PopupManager.displayMessage( { text: msg } );
		},

		onMetaUpdate: function(layer, args)
		{
			var meta = args[1];
			this.drawControls();
			if( meta.meta )
				this.updateConstraints( meta.meta );
			if( meta.grouping )
				this.updateGrouping( meta.grouping );
			Dom.removeClass( Dom.get( 'alvex-graph-params' ), "hidden" );
		},

		updateGrouping: function(grouping)
		{
			var groupEl = Dom.get( 'alvex-graph-groupby' );
			Dom.removeClass( groupEl, "hidden" );
			for (var g = 0; g < grouping.length; g++)
			{
				groupEl.options.add( 
					new Option(
						this.msg("alvex.reports.show." + grouping[g]), 
						grouping[g]
					)
				);
			}
			groupEl.value = this.options.groupBy;
		},

		updateConstraints: function(meta)
		{
			for (var m = 0; m < meta.length; m++)
			{
				var selectType = true;
				for( var p in this.options.parameters )
				{
					if( ( this.options.parameters[p].field == meta[m].field )
							&& ( this.options.parameters[p].type != 'person' && this.options.parameters[p].type != 'text' ) )
					{
						selectType = false;
						break;
					}
				}
				if( ! selectType )
					continue;

				var el = Dom.get( 'alvex-graph-params-' + meta[m].field );
				var vals = el.value.split(',');
				var parent = el.parentNode;
				parent.removeChild( el );
				var selectEl = document.createElement( 'select' );
				selectEl.multiple = true;
				selectEl.id = 'alvex-graph-params-' + meta[m].field;

				selectEl.options.add( new Option( this.msg("alvex.reports.show.all"), '*' ) );
				for(var o in meta[m].options) {
					selectEl.options.add( 
						new Option(
							meta[m].options[o].label, 
							meta[m].options[o].value
						)
					);
				}
				parent.appendChild( selectEl );

				selectEl = Dom.get( 'alvex-graph-params-' + meta[m].field );
				for( var o = 0; o < selectEl.options.length; o++ )
				{
					selectEl.options[o].selected = false;
					for( var v in vals )
						if( vals[v] == selectEl.options[o].value )
							selectEl.options[o].selected = true;
				}
			}
		},


		onCreateLegend: function(layer, args)
		{
			var me = this;
			var obj = args[1];
			var svg = obj.svg;
			var color = obj.color;
			var width = obj.width;

			var legend = svg.selectAll(".legend")
				.data(color.domain().slice().reverse())
				.enter().append("g")
				.attr("class", "legend")
				.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

			legend.append("rect")
				.attr("x", width - 18)
				.attr("width", 18)
				.attr("height", 18)
				.style("fill", color);

			legend.append("text")
				.attr("x", width - 24)
				.attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text(function(d) { return me.msg("alvex.reports.legend." + d.replace(':','_')); });
		},

		onReportChanged: function(layer, args)
		{
			var report = args[1];

			this.options.ref = report.reportRef;
			this.options.parameters = [];

			if( report.reportParams != '' )
			{
				var paramFields = report.reportParams.split('&');
				for (var p in paramFields)
				{
					var field = paramFields[p].split('=')[0];
					var val = paramFields[p].split('=')[1].replace('{','').replace('}','');
					var type = val.split('|')[0];
					var defVal = val.split('|')[1];
					if( type == 'date' && defVal.match(/-?[0-7]+d/) )
					{
						var days = defVal.match(/(-?[0-7]+)d/)[1];
						var now = (new Date());
						var theValue = new Date( now.getTime() + days*24*60*60*1000 );
						defVal = theValue.getFullYear() + '-' + (theValue.getMonth()+1) + '-' + theValue.getDate();
					}
					this.options.parameters.push( { 'field': field, 'type': type, 'value': defVal } );
				}
			}
			this.options.groupBy = '';
			if( Dom.get( 'alvex-graph-groupby' ) )
				Dom.get( 'alvex-graph-groupby' ).value = '';

			Dom.get( this.id + '-graph-header' ).innerHTML = report.reportTitle;
			Dom.get( this.id + '-graph-desc' ).innerHTML = report.reportDesc;
			this.sendRequest();
		},

		sendRequest: function()
		{
			var url = $combine(Alfresco.constants.PROXY_URI, "api/alvex/reports/data?reportRef=") + this.options.ref;
			for( p in this.options.parameters )
				if( this.options.parameters[p].value != '' )
					url += '&' + encodeURIComponent(this.options.parameters[p].field) 
						+ '=' + encodeURIComponent(this.options.parameters[p].value);
			var el = Dom.get( 'alvex-graph-groupby' );
			if( el && el.value != '' )
				url+= '&groupBy=' + el.value;

			Dom.addClass( Dom.get( 'alvex-graph-params' ), "hidden" );

			this.drawReport(url);
		},

		drawControls: function()
		{
			var el = Dom.get( 'alvex-graph-params' );
			
			el.innerHTML = '';
			if( typeof(d3) != 'undefined' )
			{
				el.innerHTML += '<div style="margin: 0px 10px 10px 0px; float:left"><a href="#" id="' + this.id + '-graph-view">' + this.msg("alvex.reports.graphView") + '</a></div>';
				el.innerHTML +=  '<div style="margin: 0px 10px 10px 10px;"><a href="#" id="' + this.id + '-table-view">' + this.msg("alvex.reports.tableView") + '</a></div>';
			}
			
			for( p in this.options.parameters )
			{
				if( this.options.parameters[p].type == 'date' )
				{
					el.innerHTML += '<div style="margin: 0px 10px 10px 0px;">' 
						+ '<div><label>' + this.msg("alvex.reports.params." + this.options.parameters[p].field) + '</label></div>' 
						+ '<input type="text" id="alvex-graph-params-' + this.options.parameters[p].field + '-date" style="width:10em; margin-right: 10px;"/>'
						+ '<a id="alvex-graph-params-' + this.options.parameters[p].field + '-icon">' 
						+ '<img src="/share/res/components/form/images/calendar.png" ' 
						+ 'class="datepicker-icon" tabindex="0"/></a></div>'
						+ '<div id="alvex-graph-params-' + this.options.parameters[p].field + '" class="datepicker" style="display: none; position: absolute; z-index: 1;"></div>';
					var theValue = this.options.parameters[p].value;
					if( this.options.parameters[p].value.match(/-?[0-7]+d/) )
					{
						var days = this.options.parameters[p].value.match(/(-?[0-7]+)d/)[1];
						var now = (new Date());
						theValue = new Date( now.getTime() + days*24*60*60*1000 );
					} else if( this.options.parameters[p].value.match(/([0-9]+)-([0-9]+)-([0-9]+)/) )
					{
						var parts = this.options.parameters[p].value.match(/([0-9]+)-([0-9]+)-([0-9]+)/);
						theValue = new Date( parts[1], parts[2]-1, parts[3] );
					}
					var dp = new Alfresco.DatePicker( "alvex-graph-params-" + this.options.parameters[p].field,
									"alvex-graph-params-" + this.options.parameters[p].field )
						.setOptions({
							currentValue: Alfresco.util.toISO8601(theValue),
							showTime: false,
							submitTime: false,
							mandatory: false
						}).setMessages(
							{ "form.control.date-picker.entry.date.format": "d.M.yyyy",
							  "form.control.date-picker.choose": '' }
						);
				} else {
					el.innerHTML += '<div style="margin: 0px 10px 10px 0px;">' 
						+ '<label>' + this.msg("alvex.reports.params." + this.options.parameters[p].field) + '</label>' 
						+ '<input type="text" id="alvex-graph-params-' + this.options.parameters[p].field + '"/></div>';
				}
			}
			el.innerHTML += '<div style="margin: 0px 10px 10px 0px;"><label>' + this.msg("alvex.reports.groupBy") + '</label>' 
						+'<select class="hidden" id="alvex-graph-groupby">' 
						+ '<option value="">' + this.msg("alvex.reports.show.all") + '</option>' + '</select></div>';
			el.innerHTML += '<br/><br/><button id="alvex-graph-params-submit">' + this.msg("alvex.reports.updateReport") + '</button>';
			el.innerHTML += '<br/><br/><button id="alvex-report-excel-export">' + this.msg("alvex.reports.exportToExcel") + '</button>';
			// el.innerHTML += '<br/><br/><br/><label><input id="sorter" type="checkbox"> ' + this.msg("alvex.reports.sortValues") + '</label>';
			var btn = new YAHOO.widget.Button('alvex-graph-params-submit');
			btn.on('click', this.onSubmit, null, this);

			var excelBtn = new YAHOO.widget.Button('alvex-report-excel-export');
			excelBtn.on('click', this.onExcelExport, null, this);

			YAHOO.util.Event.on(this.id + '-graph-view', 'click', this.toggleGraphView, null, this);
			YAHOO.util.Event.on(this.id + '-table-view', 'click', this.toggleTableView, null, this);

			for( p in this.options.parameters )
			{
				Dom.get( 'alvex-graph-params-' + this.options.parameters[p].field ).value = this.options.parameters[p].value;
			}
		},

		onExcelExport: function()
		{
			var req = [];
			var row = [];

			var myFields = [];
			myFields.push('');
			myFields.push('Total');

			for( var r in this.options.reportData[0] )
			{
				if( r != 'x' && r != 'y' && r != 'values' && r != 'total' )
				{
					myFields.push( this.msg("alvex.reports.legend." + r.replace(':','_')) );
				}
			}
			req.push(myFields);

			for( var d in this.options.reportData )
			{
				row = [];
				row.push( this.options.reportData[d]['x'] + '' );
				if( this.options.reportData[d]['y'] )
					row.push( this.options.reportData[d]['y'] + '' );
				else
					row.push( this.options.reportData[d]['total'] + '' );
				for( var r in this.options.reportData[d] )
					if( r != 'x' && r != 'y' && r != 'values' && r != 'total' )
						row.push( this.options.reportData[d][r] + '' );
				req.push(row);
			}

			var today = new Date();

			var json = JSON.stringify( {
				fileName: "report-" + today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() 
						+ '-' + today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds(),
				rows: req
			} );

			var xmlHttp_req = new XMLHttpRequest();
			xmlHttp_req.open("PUT", Alfresco.constants.PROXY_URI
				+ "api/alvex/reports/export/xlsx",
				false);
			if (Alfresco.util.CSRFPolicy && Alfresco.util.CSRFPolicy.isFilterEnabled())
				xmlHttp_req.setRequestHeader( Alfresco.util.CSRFPolicy.getHeader(), Alfresco.util.CSRFPolicy.getToken() );
			xmlHttp_req.setRequestHeader("Content-Type", "application/json");

			xmlHttp_req.send( json );

			if (xmlHttp_req.status != 200)
				return;

			var resp = eval('(' + xmlHttp_req.responseText + ')');

			Alfresco.util.PopupManager.displayPrompt(
			{
				title: this.msg("message.report_ready.title"),
				text: this.msg("message.report_ready.body", 
				Alfresco.constants.PROXY_URI + "api/node/content/"
					+ Alfresco.util.NodeRef(resp.nodeRef).uri + "/" + resp.name),
				noEscape: true,
				buttons:
				[ {
					text: this.msg("button.ok"),
					handler: function()
					{
						this.destroy();
					}
				} ]
			});
		},

		toggleGraphView: function()
		{
			this.options.viewType = 'graph';
			this.onSubmit();
		},

		toggleTableView: function()
		{
			this.options.viewType = 'table';
			this.onSubmit();
		},

		getParametersValues: function()
		{
			for( p in this.options.parameters )
			{
				var el = Dom.get( 'alvex-graph-params-' + this.options.parameters[p].field );
				if( el.tagName == 'SELECT' )
				{
					var vals = [];
					for( var v = 0; v < el.options.length; v++ )
						if( el.options[v].selected )
							vals.push(el.options[v].value);
					this.options.parameters[p].value = vals.join(',');
				} else {
					this.options.parameters[p].value = el.value
				}
			}
			this.options.groupBy = Dom.get( 'alvex-graph-groupby' ).value;
		},

		onSubmit: function()
		{
			this.getParametersValues();
			this.sendRequest();
		},

		drawReport: function(dataURL)
		{
			Dom.get( 'alvex-graph' ).innerHTML = '';

			Alfresco.util.Ajax.jsonGet(
			{
				url: dataURL,
				successCallback:
				{
					fn: function (resp)
					{
						var meta = {};
						meta.meta = resp.json.meta;
						meta.grouping = resp.json.grouping;
						YAHOO.Bubbling.fire("updateMeta", meta);

						if( !resp.json || !resp.json.data || resp.json.data.length == 0 )
						{
							YAHOO.Bubbling.fire("noReportData", 
								{ "msg": resp.json.message, "msgID": resp.json.messageID } );
							return;
						}

						if( this.options.viewType == 'graph' )
							YAHOO.Bubbling.fire("drawGraph", resp.json);
						else if( this.options.viewType == 'table' )
							YAHOO.Bubbling.fire("drawTable", resp.json);
					},
					scope: this
				},
				failureCallback:
				{
					fn: function (resp)
					{
						if (resp.serverResponse.statusText)
							Alfresco.util.PopupManager.displayMessage({ text: resp.serverResponse.statusText });
					},
					scope: this
				}
			});
		},

		onDrawGraph: function(layer, args)
		{
			var resp = args[1];
			this.options.reportData = resp.data.slice(0);

			if( typeof(d3) == 'undefined' )
				return;

			var margin = {top: 20, right: 20, bottom: 30, left: 40},
				width = this.options.width - 120 - 250 - margin.left - margin.right,
				height = this.options.height - 120 - margin.top - margin.bottom;

			var fieldPrefix = resp.config.groupBy + '_';

			var svg = d3.select("#alvex-graph").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", 2 * height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + 0 + ")");

			var xCaptionRotation = (resp.xCaptionRotation ? resp.xCaptionRotation : 0);
			var yStyle = (resp.yStyle ? resp.yStyle : 'numbers');
			var yFormatType = (yStyle == 'numbers' ? 'f' : '%');
			var yPrecision = (resp.yPrecision ? resp.yPrecision : '2');
			var yFormat = d3.format("." + yPrecision + yFormatType);

			var yStep = Math.pow(10, -yPrecision);
			if( yStyle == 'percents' )
				yStep /= 100;

			var numberOfFields = -1;
			for (var r in resp.data[0])
				numberOfFields++;
			var showLegend = false;
			if( numberOfFields > 1 || !resp.data[0].y )
				showLegend = true;

			var pallete = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];

			var color = d3.scale.ordinal()
				.range( pallete.slice(0, numberOfFields + 1) );

			color.domain( d3.keys(resp.data[0])
					.filter(function(key) { return key !== "x"; })
					.sort(function(a,b) { 
						return parseInt(a.replace(fieldPrefix,'')) < parseInt(b.replace(fieldPrefix,'')) 
					} )
			);

			var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], .1, 1);

			var y = d3.scale.linear()
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.tickFormat(yFormat);

			resp.data.forEach(function(d) {
				var y0 = 0;
				d.values = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
				d.total = d.values[d.values.length - 1].y1;
			});

			resp.data.sort(function(a, b) { return d3.ascending(a.x, b.x); });

			var maxY = d3.max(resp.data, function(d) { return d.total; });
			var minY = d3.min(resp.data, function(d) { return d.total; });

			x.domain(resp.data.map(function(d) { return d.x; }));
			y.domain([0, maxY]);

			if( (maxY-minY) / yStep < 10 )
			{
				var ticks = [];
				var lowB = parseInt(minY/yStep)*yStep - yStep;
				var upperB = parseInt(maxY/yStep)*yStep + yStep;
				for( var i = lowB; i < upperB; i += yStep )
					ticks.push(i);
				yAxis.tickValues(ticks);
			}

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis)
				.selectAll("text")  
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", ".15em")
				.attr("transform", function(d) { return "rotate(-" + xCaptionRotation + ")" });

			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text($html(resp.yCaption));

			var bar = svg.selectAll(".bar")
				.data(resp.data)
				.enter().append("g")
				.attr("class", "g")
				.attr("transform", function(d) { return "translate(" + x(d.x) + ",0)"; });

			bar.selectAll("rect")
				.data(function(d) { return d.values; })
				.enter().append("rect")
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.y1); })
				.attr("height", function(d) { return y(d.y0) - y(d.y1); })
				.style("fill", function(d) { return color(d.name); });

			if( showLegend )
			{
				var obj = {};
				obj.svg = svg;
				obj.color = color;
				obj.width = width;
				YAHOO.Bubbling.fire("createLegend", obj);
			}

			d3.select("#sorter").on("change", change);

			function change() {
				// Copy-on-write since tweens are evaluated after a delay.
				var x0 = x.domain(resp.data.sort(this.checked
					? function(a, b) { return b.total - a.total; }
					: function(a, b) { return d3.ascending(a.x, b.x); })
					.map(function(d) { return d.x; }))
					.copy();

				var transition = svg.transition().duration(750),
					delay = function(d, i) { return i * 50; };

				transition.selectAll(".bar")
					.delay(delay)
					.attr("x", function(d) { return x0(d.x); });

				transition.select(".x.axis")
					.call(xAxis)
					.selectAll("g")
					.delay(delay);
			}
		},

		onDrawTable: function(layer, args)
		{
			var resp = args[1];
			if( !resp.data[0].y )
			{
				for( var d in resp.data )
				{
					var y = 0;
					for( var r in resp.data[d] )
						if( r != 'x' )
							y += parseInt(resp.data[d][r]);
					resp.data[d]['y'] = y;
				}
			}

			this.options.reportData = resp.data.slice(0);

			var margin = {top: 20, right: 20, bottom: 30, left: 40},
				width = this.options.width - 160 - 250 - margin.left - margin.right,
				height = this.options.height - 120 - margin.top - margin.bottom;

			var fieldPrefix = resp.config.groupBy + '_';

			var numberOfFields = -1;
			for (var r in resp.data[0])
				numberOfFields++;
			var showLegend = false;
			if( numberOfFields > 1 || !resp.data[0].y )
				showLegend = true;

			var myColumnDefs = [];
			var myFields = [];
			var colWidth = width/(numberOfFields+2);

			myColumnDefs.push( { key:'x', label:'', sortable:true, width:2*colWidth, 
				sortOptions: { sortFunction: this.sortByX } } );
			myColumnDefs.push( {key:'y', width:colWidth, label: this.msg("Total"), sortable:true} );
			myFields.push('x');
			myFields.push('y');

			for( var r in resp.data[0] )
			{
				if( r != 'x' && r != 'y' )
				{
					myFields.push(r);
					if( showLegend )
						myColumnDefs.push( {key:r, width:colWidth, 
								label: this.msg("alvex.reports.legend." + r.replace(':','_')), sortable:true} );
				}
			}

			this.widgets.reportDataSource = new YAHOO.util.DataSource(resp.data);
			this.widgets.reportDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
			this.widgets.reportDataSource.responseSchema = {
				fields: myFields
			};
			var sortFunction = this.sortByX;
			this.widgets.reportDataSource.doBeforeParseData = function (oRequest, oFullResponse)
			{
				var resp = oFullResponse.sort(sortFunction);
				return resp;
			};
			
			this.widgets.reportDataTable = new YAHOO.widget.DataTable("alvex-graph",
					myColumnDefs, this.widgets.reportDataSource,
			{
				initialLoad: true,
				initialRequest: '',
				renderLoopSize: 32,
				sortedBy:
				{
					key: "x",
					dir: "asc"
				},
				MSG_EMPTY: this.msg("alvex.report.noData"),
				MSG_LOADING: this.msg("alvex.report.loadingData"),
				MSG_ERROR: this.msg("alvex.report.errorLoadingData")
			});
		},
		
		sortByX: function(a, b, desc) {
			var valA = a.getData ? a.getData()["x"] : a["x"];
			var valB = b.getData ? b.getData()["x"] : b["x"];
			// Deal with empty values
			if (!YAHOO.lang.isValue(valA))
				return (!YAHOO.lang.isValue(valB)) ? 0 : 1;
			else if (!YAHOO.lang.isValue(valB))
				return -1;
			return YAHOO.util.Sort.compare(valA, valB, desc);
		}
		
	});
})();
