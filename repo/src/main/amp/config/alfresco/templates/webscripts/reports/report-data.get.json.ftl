<#escape x as jsonUtils.encodeJSONString(x)>
{
	<#if message?has_content>
	"message": "${message}",
	</#if>
	<#if messageID?has_content>
	"messageID": "${messageID}",
	</#if>
	"config":
	{
		"reportRef": "${config.reportRef}",
		"groupBy": "${config.groupBy}"
	},
	<#if xCaption??>
	"xCaption": "${xCaption}",
	</#if>
	<#if yCaption??>
	"yCaption": "${yCaption}",
	</#if>
	<#if yStyle??>
	"yStyle": "${yStyle}",
	</#if>
	<#if yPrecision??>
	"yPrecision": "${yPrecision}",
	</#if>
	<#if xCaptionRotation??>
	"xCaptionRotation": "${xCaptionRotation}",
	</#if>
	<#if meta??>
	"meta":
	[
		<#list meta as item>
		{
			"field": "${item.field}",
			"type": "${item.type}",
			<#if item.values??>
			"options":
			[
				<#list item.values as value>
				{
					"value": "${value.value}",
					"label": "${value.label}"
				}<#if value_has_next>,</#if>
				</#list>
			]
			<#else>
			"value": "${item.value}"
			</#if>
		}<#if item_has_next>,</#if>
		</#list>
	],
	</#if>
	<#if grouping??>
	"grouping":
	[
		<#list grouping as opt>
		"${opt}"<#if opt_has_next>,</#if>
		</#list>
	],
	</#if>
	<#if data??>
	"data":
	[
		<#list data as item>
		{
			<#list item?keys as key>
			"${key}": "${item[key]}"<#if key_has_next>,</#if>
			</#list>
		}<#if item_has_next>,</#if>
		</#list>
	]
	</#if>
}
</#escape>
