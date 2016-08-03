<#assign htmlId=args.htmlid?js_string>

<div class="filter">
	<h2 class="alfresco-twister alfresco-twister-open">${msg("alvex.reports.availableReports")}</h2>
	<ul id="${htmlId}-report-list" class="filterLink" style="display: block;">
	</ul>
</div>

<script type="text/javascript">//<![CDATA[
	new Alvex.ReportsMenu("${htmlId}").setOptions({
	}).setMessages(
		${messages}
	);
//]]></script>
