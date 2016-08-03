<#escape x as jsonUtils.encodeJSONString(x)>
{
	<#if message?has_content>
	"message": "${message}",
	</#if>
	"reports":
	[
		<#if reports??>
		<#list reports as report>
		{
			"title": "${report.title}",
			"desc": "${report.desc}",
			"params": "${report.params}",
			"ref": "${report.ref}"
		}<#if report_has_next>,</#if>
		</#list>
		</#if>
	]
}
</#escape>
