<#include "/org/alfresco/include/alfresco-template.ftl" />

<@templateHeader>
   <@markup id="resizer">
   <script type="text/javascript">//<![CDATA[
      new Alfresco.widget.Resizer("AlvexReports");
   //]]></script>
   </@>
</@>

<@templateBody>
   <div id="alf-hd">
		<@region id="share-header" scope="global" chromeless="true"/>
   </div>
   <div id="bd">
      <div class="yui-t1" id="alvex-reports">
         <div id="yui-main">
            <div class="yui-b" id="alf-content">
               <@region id="report-graph" scope="template" />
            </div>
         </div>
         <div class="yui-b" id="alf-filters">
            <@region id="report-menu" scope="template" />
         </div>
      </div>
   </div>
</@>

<@templateFooter>
   <@markup id="alf-ft">
   <div id="alf-ft">
      <@region id="footer" scope="global" />
   </div>
   </@>
</@>
