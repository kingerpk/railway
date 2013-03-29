	var LGis={
	
		Init:function()
		{		
			this.localhost="http://localhost:8080/geoserver";
			this.remotehost="http://58.215.188.217:8080/geoserver";
			this.host=this.remotehost;
			this.rUrl="data/";
			this.resourceUrl="http://58.215.188.217:8080/fileupload/receiveFile/";
			//this.resourceUrl=this.rUrl;
			this.haspInterval="";//haps图层切换器
			this.map=null;
			this.bounds = new OpenLayers.Bounds(
				109.3753351271,19.76077990234,
				117.84957829116,26.182667300106
			);
			this.InitParameter();
			this.InitMap();
			this.InitEvent();
		},
		InitEvent:function(){
			var me=this;	
			
			me.InitTaiFengEvent();
			me.InitMonitorEvent();
			me.BindWeathWarnPlanEven();
			me.InitHapsDataPanelEvent();		
			me.InitHapsImageEvent();	
		},
		InitMap:function()
		{
			var me=this;
			me.InitMapBase();
			me.InitBaseLayer();

			me.InitMonitorLayer();
			me.InitHapsDataLayer();
			me.InitWeatherWarnLayer();
			me.InitHapsImageLayer();

			me.SetLayerVisibleAllForSingle("monitor_layer",true);
		},
		InitMapBase:function()
		{
			var me=this;
			var options = {
							projection: new OpenLayers.Projection("EPSG:4326"),
							units: "degrees",
							//numZoomLevels: 15, 
							maxExtent:me.bounds,							
							resolutions:[0.008275628089904775,0.004137814044952387,0.0020689070224761937,0.0010344535112380968],
							restrictedExtent:me.bounds
						};
						
			$("#mapDiv").empty();
			//初始化地图对象
			me.map = new OpenLayers.Map("mapDiv",options);
		},
		InitBaseLayer:function()
		{
			var me=this;
			//加载底图图层
			var layer = new OpenLayers.Layer.WMS(
					"base_layer",
					me.host+"/cite/wms?service=WMS",
					 {layers: "basemap"},
					 {singleTile:true}
				);
			me.map.addLayers([layer]);
			me.map.setCenter(new OpenLayers.LonLat(113.62678, 23.44851), 0);
		},
/*>>>TaiFeng<<<*********************************************************************/
		ShowTaiFeng:function(showtaifeng){
			if(showtaifeng){
				$("#mapDiv").hide();
				$("#taifeng_context").show();
			}
			else{
				$("#mapDiv").show();
				$("#taifeng_context").hide();
			}
		},
		InitTaiFengEvent:function(){
			var me=this;
			$("#taifeng_a").bind("click",function(){
				me.ShowTaiFeng(true);
				me.ShowSubMenu("none");
				me.SetControlActivateAllForSingle("none");
			});
		},
/*Montitor******************************************************************/
		InitMonitorLayer:function(){
			var me=this;
			var MonitorLayer=me.GetLayerAjax(me.resourceUrl+"monitorJson/montiorGeoJson.js","monitor_layer");			
			MonitorLayer.styleMap=me.MonitorLayerStyle;
			MonitorLayer.setVisibility(false);
			me.map.addLayers([MonitorLayer]);
		},
		ShowMonitorLabel:function(field){
			var me=this;
			me.SetLayerVisibleAllForSingle("monitor_layer",true);
			me.ShowSubMenu("none");
			var MonitorLayer=me.map.getLayersByName("monitor_layer")[0];
			MonitorLayer.styleMap.styles["default"].defaultStyle.label='${'+field+'}';
			MonitorLayer.redraw();
			me.SetControlActivateAllForSingle("none");
		},
		InitMonitorEvent:function(){
			var me=this;
			$("#wd_li").bind("click",function(){
					me.ShowTaiFeng(false);
					$("#monitorUL a").text("风向");
					me.ShowMonitorLabel("wd");
					me.SetControlActivateAllForSingle("none");
			});
			$("#ws_li").bind("click",function(){
					me.ShowTaiFeng(false);
					$("#monitorUL a").text("风速");
					me.ShowMonitorLabel("ws");
					me.SetControlActivateAllForSingle("none");
			});
			$("#t_li").bind("click",function(){
					me.ShowTaiFeng(false);
					$("#monitorUL a").text("温度");
					me.ShowMonitorLabel("t");
					me.SetControlActivateAllForSingle("none");
			});
			$("#r_li").bind("click",function(){
					me.ShowTaiFeng(false);
					$("#monitorUL a").text("雨量");
					me.ShowMonitorLabel("r05m");
					me.SetControlActivateAllForSingle("none");
			});
		},
/*HapsImage*****************************************************************************/
		InitHapsImageLayer:function(){
			var me=this;
			var haspImageLayer=new OpenLayers.Layer.Image(
									"haps_image_layer",
									me.GetHaspBaseUrl()+"/0.gif",
									new OpenLayers.Bounds(104.0951,17.234114484031,120.78096004728,30.269942645969),
									new OpenLayers.Size(1074,800),
									{
										isBaseLayer : false,
										maxResolution: 0.06896066511648435,
										minResolution: 0.0001346887990556335
									}
							);
			haspImageLayer.setVisibility(false);
			me.map.addLayers([haspImageLayer]);

			var haspTitlePanel=new OpenLayers.Control.Panel({
								createControlMarkup: function() {
											var myControl="<h2 id='haspTitle' style='margin-top:20px;margin-left:60px'></h2>";
											return $(myControl)[0];			
										}
							});
							
			haspTitlePanel.addControls([new OpenLayers.Control.Button()]);
			me.RegisterLonelyControl(haspTitlePanel,"hasp_title_panel");
		},
		InitHapsImageEvent:function(){
			var me=this;
			$("#hapsImage_a").bind("click",function(){
					me.ShowTaiFeng(false);
					me.ShowSubMenu("none");
					me.SetLayerVisibleAllForSingle("haps_image_layer",true);
					clearInterval(me.haspInterval);
					var haspImgIndex=0;
					var hapsImageLayer=me.map.getLayersByName("haps_image_layer")[0];
					me.haspInterval=setInterval(
						function(){
							var d=new Date();
							d.setHours(d.getHours()-1+haspImgIndex);
							var Title=d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日"+d.getHours()+"时";
							$("#haspTitle").text(Title);
							hapsImageLayer.setUrl(me.GetHaspBaseUrl()+"/"+haspImgIndex+".gif");
							haspImgIndex++;
							if(haspImgIndex>=24){
								haspImgIndex=0;
							}
						}
						,1000
					)
				 }
			)
		},
		GetHaspBaseUrl:function(){
				var d=new Date();
				var year=d.getFullYear()+"";
				var day=d.getDate()+"";
				var month=d.getMonth()+1;
				var hours=d.getHours()-2;
				if(month<10){
					month="0"+month;
				}
				
				if(day<10){
					day="0"+day;
				}
				
				if(hours<10){
					hours="0"+hours;
				}
				
				var date=year+month+day;
				var url=this.resourceUrl+"/img/"+date+"/"+hours;
				return url;
			},
/*HaspData**************************************************************************************/
		InitHapsSelecter:function(activate){
			var me=this;
			var hapsLayer=me.map.getLayersByName("haps_data_layer")[0];
			var haspSelecter=new OpenLayers.Control.SelectFeature(								
					hapsLayer,
					{
						clickout:true,
						onSelect:function(e){
							if(me.popup){												
								me.map.removePopup(me.popup);
							}
							var value=e.data.r;
							
							me.popup=new OpenLayers.Popup.FramedCloud(
								"",
								new  OpenLayers.LonLat(e.geometry.getCentroid().x,e.geometry.getCentroid().y),
								new OpenLayers.Size(100,100),
								"雨量："+value,
								null,
								true,
								function(){
									me.map.removePopup(me.popup);
									haspSelecter.unselectAll();
								}
							);	
							me.map.addPopup(me.popup);
						}
					}
			);
			haspSelecter.ControlId="haps_selecter";
			me.RegisterLonelyControl(haspSelecter,"haps_selecter",activate);
		},
		InitHapsDataPanelEvent:function(){
			var me=this;

			$("#hapsdata_a").bind("click",function(){
				me.ShowTaiFeng(false);
				me.ShowSubMenu("hapsDataPanel");
				me.SetLayerVisibleAllForSingle("haps_data_layer",true);
				me.SetControlActivateAllForSingle("haps_selecter");
				me.InitHapsDataPanel();
				$("#haspTitle").html("");
			});			
			$("#hapsDataPanel li").mouseenter(function(){
				$(this).addClass("hapsWarnTimeHover");
			});

			$("#hapsDataPanel li").mouseleave(function(){
				$(this).removeClass("hapsWarnTimeHover");
			});
			$("#hapsDataPanel li").click(function(){
				$("#hapsDataPanel li").removeClass("hapsWarnTimeSelect");
				$(this).addClass("hapsWarnTimeSelect");
				var tag=$(this).attr("tag");
				var hapsLayer=me.map.getLayersByName("haps_data_layer")[0];
				if(hapsLayer){
					me.map.removeLayer(hapsLayer);
				}				

				var newHapsLayer=me.GetLayerAjax(me.resourceUrl+"haspJson/HapsGeoJson"+tag+".js","haps_data_layer");
				newHapsLayer.styleMap=me.HapsDataLayerStyle;
				me.map.addLayers([newHapsLayer]);
				var control=me.map.getControlsBy("ControlId","haps_selecter")[0];
				me.map.removeControl(control);
				me.InitHapsSelecter(true);
			});
			me.InitHapsSelecter(false);
		},
		InitHapsDataPanel:function(){
			var me=this;
			$.ajax(
					{
						url:me.resourceUrl+"haspJson/hapsWarnTime.js",
						dataType:"json",
						success:function(d){
							for(var timeIndex in d){
								var valueRange=d[timeIndex];
								var color="beige";
								if(valueRange=="0.1-1"){
									color="#00EBEB";
								}
								else if(valueRange=="1-5"){
									color="#019FF5";
								}
								else if(valueRange=="5-10"){
									color="#0000F6";
								}
								else if(valueRange=="10-15"){
									color="#00FF00";
								}
								else if(valueRange=="15-20"){
									color="#00C700";
								}
								else if(valueRange=="20-25"){
									color="#009000";
								}
								else if(valueRange=="25-30"){
									color="#FFFF00";
								}
								else if(valueRange=="30-"){
									color="red";
								}
								$("#hapsDataPanel li[tag='"+timeIndex+"']").css("background-color",color);
							}
						}
					}
				);
		},
		InitHapsDataLayer:function(){
			var me=this;
			var HapsDataLayer=me.GetLayerAjax(me.resourceUrl+"haspJson/HapsGeoJson0.js","haps_data_layer");			
			HapsDataLayer.styleMap=me.HapsDataLayerStyle;
			HapsDataLayer.setVisibility(false);
			me.map.addLayers([HapsDataLayer]);
		},
/*WeatherWarn************************************************************************************************/
		InitWeatherWarnLayer:function(){
			var me=this;
			var WeatherWarnLayer=me.GetLayerAjax("data/weatherWarnGeoJson.js","weather_warn_layer");
			WeatherWarnLayer.styleMap=me.WeatherWarnLayerStyle;	
			WeatherWarnLayer.setVisibility(false);
			me.map.addLayers([WeatherWarnLayer]);
		},
		BindWeathWarnPlanEven:function(){
			var me=this;

			$("#weatherWarn").bind("click",function(){			
				me.ShowTaiFeng(false);	
				me.SetLayerVisibleAllForSingle("weather_warn_layer",true);
				me.ShowSubMenu("weatherWarnPanel");				
				me.SetControlActivateAllForSingle("none");
				me.ShowWeatherWarnWithSign("none");
			});

			$("#MyMapPanel td").mouseenter(
						function(){
							$(this).removeClass("weatherWarnMouseOut");
							$(this).addClass("weatherWarnMouseIn"); 
						}
					);
			$("#MyMapPanel td").mouseleave(
				function(){
					$(this).removeClass("weatherWarnMouseIn");
					$(this).addClass("weatherWarnMouseOut"); 
				}
			);

			$("#MyMapPanel td").bind("click",function(){
				var sign=$(this).attr("tag");
				$("#MyMapPanel td").each(
					function(){
						$(this).removeClass("weatherWarnSelecter");
					}
				);
				$(this).addClass("weatherWarnSelecter");
				me.ShowWeatherWarnWithSign(sign);
			});
		},
		ShowWeatherWarnWithSign:function(sign){
			var me=this;
			$.ajax(
					{
						url:me.resourceUrl+"monitorJson/WeatherWarn.js",
						dataType:"json",
						success:function(d){
							var cityColor=d[sign];
							var layer=me.map.getLayersByName("weather_warn_layer")[0];
							var features=layer.features;
							for(var i in features){
								var feature=features[i];
								feature.attributes.color=0;
								feature.data.color=0;
							}

							for(var s in d){
								if(d[s]["has"]=="yes"){
									$("#weatherWarnPanel td[tag='"+s+"']").css("background-color","yellow");
								}								
							}

							if(typeof(cityColor)!="undefined"||cityColor!=null){
								for(var city in cityColor){
										var features=layer.getFeaturesByAttribute("NAME",city);
										if(features.length>0){
											var color=cityColor[city];
											var feature=features[0];
											feature.attributes.color=color;
											feature.data.color=color;
										}
								}
							}
							layer.redraw();							
						}
					}
				);
		},
/*Common***********************************************************************************************************/
		ShowSubMenu:function(menuId){
			$("div.submenuItem").hide();
			$("#"+menuId).show();
		},		
		RegisterLonelyControl:function(Control,ControlId,activate){
			var me=this;
			Control.ControlId=ControlId;
			me.map.addControl(Control);
			if(!me.lonelyControls){
				me.lonelyControls={};
			}
			me.lonelyControls[ControlId]=1;
			if(activate){
				me.SetControlActivateAllForSingle("haps_selecter");
			}
		},
		SetControlActivateAllForSingle:function(ControlId){
			var me=this;
			if(me.lonelyControls){
				for(var id in me.RegisterLonelyControl){
					var control=me.map.getControlsBy("ControlId",id)[0];
					control.deactivate();
				}
				var targetControl=me.map.getControlsBy("ControlId",ControlId)[0];
				if(targetControl){
					targetControl.activate();	
				}				
			}
		},
		GetLayerAjax:function(url,layerName){
			var Layer=new OpenLayers.Layer.Vector(layerName);
				$.ajax(
					{
						url:url,
						dataType:"text",
						success:function(d){
							var format=new OpenLayers.Format.GeoJSON();
							var temFeatures=format.read(d);
							Layer.addFeatures(temFeatures);
						}
					}
				);
				return Layer;
		},
		SetLayerVisibleAllForSingle:function(layerName,visable){
			var me=this;
			var layers=me.map.layers;
			for(var i=0;i<layers.length;i++){
				var layer=layers[i];
				if(layer.isBaseLayer){
					continue;
				}
				if(layer.name==layerName){
					layer.setVisibility(visable);
					if(layerName!="haps_image_layer"){
						clearInterval(me.haspInterval);
					}
					continue;
				}
				layer.setVisibility(!visable);
			}
		},
		ShowLayer:function(layerName){
			var me=this;
			var layer=me.map.getLayersByName(layerName)[0];
			layer.setVisibility(true);
		},
		GetLayerVisible:function(layerName){
			var me=this;
			var layer=me.map.getLayersByName(layerName);
			if(layer.length<1){
				return null;
			}
			else{
				return layer[0].getVisibility();
			}
		},		
		InitParameter:function(){

				this.MonitorLayerStyle= new OpenLayers.StyleMap({
					"default":new OpenLayers.Style({
								pointRadius:2,
								fillColor: "#ff9933",
								strokeColor: "white",
								strokeWidth: 1,
								label:'${r05m}',
								labelXOffset: "-15",
								labelYOffset: "15"
						},
						{
						rules: [
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.GREATER_THAN ,
										property: "r05m",
										value:30
									}),
									symbolizer: {
										 graphicWidth: 20,
										 graphicHeight: 20,
										 externalGraphic: "images/Warning.gif",
										 label:'${r05m}',
										labelXOffset: "-15",
										labelYOffset: "15"
									}
								}),
								new OpenLayers.Rule({
									// apply this rule if no others apply
									elseFilter: true,
									symbolizer: {
										pointRadius:2,
										fillColor: "#ff9933",
										strokeColor: "white",
										strokeWidth: 1
									}
								})
							]
						}			
					)
			});
		this.WeatherWarnLayerStyle= new OpenLayers.StyleMap({
					"default":new OpenLayers.Style({
							fillColor: "#ffcc66",
							strokeColor: "white",
							fillOpacity: 0.7,
							strokeOpacity:1
						},
						{
							rules: [
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.EQUAL_TO,
										property: "color", 
										value: "1"
									}),
									symbolizer: {
										fillColor: "white"									
									}
								}),
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.EQUAL_TO,
										property: "color", 
										value: "2"
									}),
									symbolizer: {
										fillColor: "blue"									
									}
								}),
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.EQUAL_TO,
										property: "color", 
										value: "3"
									}),
									symbolizer: {
										fillColor: "yellow"									
									}
								}),
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.EQUAL_TO,
										property: "color", 
										value: "4"
									}),
									symbolizer: {
										fillColor: "orange"									
									}
								}),
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.EQUAL_TO,
										property: "color", 
										value: "5"
									}),
									symbolizer: {
										fillColor: "red"									
									}
								})
							]
						}					
					)
			});
			this.HapsDataLayerStyle= new OpenLayers.StyleMap({
							"default":new OpenLayers.Style({
									fillColor: "#ffcc66",
												strokeColor: "white",
												strokeOpacity:1,
												strokeWidth:1.5,
												fillOpacity: 0.7
								},
								{
									rules: [
										new OpenLayers.Rule({
											filter: new OpenLayers.Filter.Comparison({
												type: OpenLayers.Filter.Comparison.GREATER_THAN,
												property: "r", 
												value: "30"
											}),
											symbolizer: {
												fillColor: "red"									
											}
										}),
										new OpenLayers.Rule({
											filter: new OpenLayers.Filter.Comparison({
												type: OpenLayers.Filter.Comparison.BETWEEN,
												property: "r", 
												lowerBoundary:0.1,
												upperBoundary:1
											}),
											symbolizer: {
												fillColor: "#00EBEB"									
											}
										}),
											new OpenLayers.Rule({
											filter: new OpenLayers.Filter.Comparison({
												type: OpenLayers.Filter.Comparison.BETWEEN,
												property: "r", 
												lowerBoundary:1,
												upperBoundary:5
											}),
											symbolizer: {
												fillColor: "#019FF5"									
											}
										}),
											new OpenLayers.Rule({
											filter: new OpenLayers.Filter.Comparison({
												type: OpenLayers.Filter.Comparison.BETWEEN,
												property: "r", 
												lowerBoundary:5,
												upperBoundary:10
											}),
											symbolizer: {
												fillColor: "#0000F6"									
											}
										}),
												new OpenLayers.Rule({
											filter: new OpenLayers.Filter.Comparison({
												type: OpenLayers.Filter.Comparison.BETWEEN,
												property: "r", 
												lowerBoundary:10,
												upperBoundary:15
											}),
											symbolizer: {
												fillColor: "#00FF00"									
											}
										}),
												new OpenLayers.Rule({
											filter: new OpenLayers.Filter.Comparison({
												type: OpenLayers.Filter.Comparison.BETWEEN,
												property: "r", 
												lowerBoundary:15,
												upperBoundary:20
											}),
											symbolizer: {
												fillColor: "#00C700"									
											}
										}),
												new OpenLayers.Rule({
											filter: new OpenLayers.Filter.Comparison({
												type: OpenLayers.Filter.Comparison.BETWEEN,
												property: "r", 
												lowerBoundary:20,
												upperBoundary:25
											}),
											symbolizer: {
												fillColor: "#009000"									
											}
										}),
												new OpenLayers.Rule({
											filter: new OpenLayers.Filter.Comparison({
												type: OpenLayers.Filter.Comparison.BETWEEN,
												property: "r", 
												lowerBoundary:25,
												upperBoundary:30
											}),
											symbolizer: {
												fillColor: "#FFFF00"									
											}
										}),											
										new OpenLayers.Rule({
											elseFilter: true,
											symbolizer: {
												fillColor: "#ffcc66",
												strokeColor: "white",
												strokeOpacity:1,
												strokeWidth:0.3,
												fillOpacity: 0.7
											}
										})
									]
								}					
							)
					});
		}
	};
	
			
	$(document).ready(
		function(){
			LGis.Init();
		}
	)
