	var LGis={
	
		Init:function()
		{		
			this.localhost="http://localhost:8080/geoserver";
			this.remotehost="http://58.215.188.217:8080/geoserver";
			this.host=this.remotehost;
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
			$("#wd_li").bind("click",function(){
					me.ShowMonitorLabel("wd");
			});
			$("#ws_li").bind("click",function(){
					me.ShowMonitorLabel("ws");
			});
			$("#t_li").bind("click",function(){
					me.ShowMonitorLabel("t");
			});
			$("#weatherWarn").bind("click",function(){
				var visable=me.GetLayerVisible("weather_warn_layer");
				
				me.SetLayerVisibleAllForSingle("weather_warn_layer",!visable);
				me.SetWeatherWarnVisible(!visable);						
			});
			me.BindWeathWarnPlanEven();
		},
		InitMap:function()
		{
			var me=this;
			me.InitMapBase();
			me.InitBaseLayer();
			me.InitMonitorLayer();
			me.InitWeatherWarnLayer();
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
					 {layers: "railway1"},
					 {singleTile:true}
				);
			me.map.addLayers([layer]);
			me.map.setCenter(new OpenLayers.LonLat(113.62678, 23.44851), 0);
		},
		InitMonitorLayer:function(){
			var me=this;
			var MonitorLayer=me.GetLayerAjax("data/montiorGeoJson.js","monitor_layer");			
			MonitorLayer.styleMap=me.MonitorLayerStyle;
			MonitorLayer.setVisibility(false);
			me.map.addLayers([MonitorLayer]);
		},
		ShowMonitorLabel:function(field){
			var me=this;
			var MonitorLayer=me.map.getLayersByName("monitor_layer")[0];
			MonitorLayer.styleMap.styles.default.defaultStyle.label='${'+field+'}';
			MonitorLayer.redraw();
		},
		SetWeatherWarnVisible:function(visable){
			var me=this;
			if(!visable){
				$("#MyMapPanel").hide();
			}
			else{
				$("#MyMapPanel").show();	
			}
		},
		InitWeatherWarnLayer:function(){
			var me=this;
			var WeatherWarnLayer=me.GetLayerAjax("data/weatherWarnGeoJson.js","weather_warn_layer");
			WeatherWarnLayer.styleMap=me.WeatherWarnLayerStyle;	
			WeatherWarnLayer.setVisibility(false);
			me.map.addLayers([WeatherWarnLayer]);
		},
		BindWeathWarnPlanEven:function(){
			var me=this;
			$("#MyMapPanel li").bind("click",function(){
				var sign=$(this).attr("tag");
				
				$.ajax(
					{
						url:"data/WeatherWarn.js",
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
			});
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

		}
	};
	
			
	$(document).ready(
		function(){
			LGis.Init();
		}
	)
