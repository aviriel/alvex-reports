<#assign htmlId=args.htmlid?js_string>

<div style="margin: 10px 40px 20px 40px; float: left;">
	<h1 id="${htmlId}-graph-header"></h1>
	<h3 id="${htmlId}-graph-desc"></h3>
	<div style="margin: 20px 0px 0px 0px; float:left;" id="alvex-graph"></div>
</div>
<div id="alvex-graph-params" style="margin: 30px 20px 20px 20px; float: right; width:210px;"></div>


<script type="text/javascript">//<![CDATA[
	new Alvex.ReportsGraph("${htmlId}").setOptions({
	}).setMessages(
		${messages}
	);
//]]></script>
