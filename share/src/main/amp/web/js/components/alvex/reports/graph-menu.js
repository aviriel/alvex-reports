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

	Alvex.ReportsMenu = function(htmlId)
	{
		Alvex.ReportsMenu.superclass.constructor.call(this, "ReportsMenu", htmlId);
		YAHOO.Bubbling.on("formContentReady", this.onFormContentReady, this);
		return this;
	};

	YAHOO.extend(Alvex.ReportsMenu, Alfresco.component.Base,
	{
		options:
		{
			initialized: false
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
			Alfresco.util.Ajax.jsonGet(
			{
				url: $combine(Alfresco.constants.PROXY_URI, "api/alvex/reports/list"),
				successCallback:
				{
					fn: this.onReportListGet,
					scope: this
				},
				failureCallback:
				{
					fn: function(resp)
					{
						if (resp.serverResponse.statusText)
							Alfresco.util.PopupManager.displayMessage({ text: resp.serverResponse.statusText });
					},
					scope: this
				}
			});
		},

		onReportListGet: function(resp)
		{
			var me = this;
			var reports = resp.json.reports;
			var listEl = Dom.get( this.id + '-report-list' );
			for( var r in reports)
			{
				listEl.innerHTML += '<li><span class="' + reports[r].params + '"><a class="filter-link filter2 report-item" rel="' 
					+ reports[r].ref + '" title="' + reports[r].desc + '" href="#">' + reports[r].title + '</a></span></li>';
			}

			YAHOO.Bubbling.addDefaultAction('report-item', function(layer, args)
			{
				var anchor = args[1].anchor,
					owner = YAHOO.Bubbling.getOwnerByTagName(anchor, "span");

				var reportRef = anchor.rel,
					reportParams = owner.className,
					reportTitle = Alvex.util.getElementText(anchor),
					reportDesc = anchor.title,
					reportObj =
					{
						"reportRef": reportRef,
						"reportParams": reportParams,
						"reportTitle": reportTitle,
						"reportDesc": reportDesc
					};

				YAHOO.Bubbling.fire("changeReport", reportObj);
				var filterLinks = YUISelector.query("li", me.id);
				for (var i = 0, ii = filterLinks.length; i < ii; i++)
				{
					Dom.removeClass(filterLinks[i], 'selected');
				}
				Dom.addClass(owner.parentNode, 'selected');

				args[1].stop = true;

				return true;
			});
		}
	});
})();
