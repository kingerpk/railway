			var layer;//底图图层
			var jbLayer;//警报图层
			var map;   //openlayer的map对象
			var railwayLayer;//纯铁路图层
			var railwayBuffer20; //铁路20公里缓冲区
			var haspLayer;//hasp图层
			var localhost="http://localhost:8080/geoserver";
			var remotehost="http://58.215.188.217:8080/geoserver";
			var host=remotehost;
			var haspImgIndex=0;//图片计数器，用于图片的自动轮换
			var haspInterval;//图片切换的定时器对象
			var stationLayer;//自动站图层
			var stationInterval;//自动站数据刷新定时器
			var stationIndex=1;//自动站图层计数器，模拟用
			var station_warning;//警戒图层
			var stationLayerWFS;//自动站图层，矢量格式
			var stationLable;//自动站标注
			var popup;//信息气泡
			var tlyxSelector;
			var	stationSelector;
			
			//地图的边界
			var bounds = new OpenLayers.Bounds(
				103.17303486509098, 17.207625610448765,
				120.82696513490903, 30.58254318474525
			);
			var jbStyle= new OpenLayers.StyleMap({
					"default":new OpenLayers.Style({
					fillColor: "#ffcc66",
					strokeColor: "white",
					fillOpacity: 0.7,
					strokeOpacity:1
								//label:'${NAME99}'
						},
					{
						rules: [
							new OpenLayers.Rule({
								// a rule contains an optional filter
								filter: new OpenLayers.Filter.Comparison({
									type: OpenLayers.Filter.Comparison.EQUAL_TO,
									property: "jb", // the "foo" feature attribute
									value: 1,
									label:'${NAME}',
									labelXOffset: "-15",
									labelYOffset: "15"

								}),
								// if a feature matches the above filter, use this symbolizer
								symbolizer: {
									fillColor: "#0E0CE9"
									
								}
							}),
							new OpenLayers.Rule({
								filter: new OpenLayers.Filter.Comparison({
									type: OpenLayers.Filter.Comparison.EQUAL_TO,
									property: "jb",
									value: 2,
									label:'${NAME}',
									labelXOffset: "-15",
									labelYOffset: "15"

								}),
								symbolizer: {
									fillColor: "#FF8040"
								}
							}),
							new OpenLayers.Rule({
								filter: new OpenLayers.Filter.Comparison({
									type: OpenLayers.Filter.Comparison.EQUAL_TO,
									property: "jb",
									value: 3,
									label:'${NAME}',
									labelXOffset: "-15",
									labelYOffset: "15"

								}),
								symbolizer: {
									fillColor: "#C0B84D"
								}
							}),
							new OpenLayers.Rule({
								// apply this rule if no others apply
								elseFilter: true,
								symbolizer: {
									fillOpacity:0,
									fillColor: "#D4D4D4",
									label:'${NAME}',
									labelXOffset: "-15",
									labelYOffset: "15",
									lableSize:11
								}
							})
						]
					}
					
					)
			});
			
				var warningStyle= new OpenLayers.StyleMap({
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
										type: OpenLayers.Filter.Comparison.BETWEEN,
										property: "r05m",
										lowerBoundary: 4,
										upperBoundary: 11

									}),
									symbolizer: {
										 graphicWidth: 20,
										 graphicHeight: 20,
										 externalGraphic: "images/Warning.gif"
									}
								}),
								new OpenLayers.Rule({
									filter: new OpenLayers.Filter.Comparison({
										type: OpenLayers.Filter.Comparison.BETWEEN,
										property: "r05m",
										lowerBoundary: 11,
										upperBoundary: 97

									}),
									symbolizer: {
										 graphicWidth: 20,
										 graphicHeight: 20,
										 externalGraphic: "images/Warning1.bmp"
									}
								}),
								new OpenLayers.Rule({
									// apply this rule if no others apply
									elseFilter: true,
									symbolizer: {
										pointRadius:2,
										fillColor: "#ff9933",
										strokeColor: "white",
										strokeWidth: 1,
										label:'${r05m}',
										labelXOffset: "-15",
										labelYOffset: "15"
									}
								})
							]
						}			
					)
			});
			
			$(document).ready(
				function(){		
							//地图的初始化参数
							var options = {
								projection: new OpenLayers.Projection("EPSG:4326"),
								units: "degrees",
								numZoomLevels: 15, 
								maxExtent:bounds,
								controls:[]
							};
							//初始化地图对象
							map = new OpenLayers.Map("mapDiv",options);
							//雷达图层
							haspLayer=new OpenLayers.Layer.Image(
									"nc",
									"20121109/img/09/0.gif",
									new OpenLayers.Bounds(104.0951,17.234114484031,120.78096004728,30.269942645969),
									new OpenLayers.Size(1074,800),
									{ // Other options
										isBaseLayer : false,
										maxResolution: 0.06896066511648435,
										minResolution: 0.0001346887990556335
									}
							);
							
							station_warning=new OpenLayers.Layer.Vector("warning", {
								styleMap: new OpenLayers.StyleMap({
										"default":new OpenLayers.Style({
													 graphicWidth: 20,
													 graphicHeight: 20,
													 externalGraphic: "images/Warning.gif"
												})
								})
							});
							
							var warning1=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(113.03199,23.74849));
							station_warning.addFeatures([warning1]);
							//自动站加载
							stationLayerWFS=new  OpenLayers.Layer.Vector("station");
							
							stationLayerWFS.styleMap=warningStyle;
							
							jbLayer=new OpenLayers.Layer.Vector("jb");
							$.get(
								"data/jb.txt",
								function(data){
										var format=new OpenLayers.Format.GML();
										var temfeature=format.read(data);
										jbLayer.addFeatures(temfeature);
										
									}
								);
							jbLayer.styleMap=jbStyle;
						    jbLayer.setVisibility(true);
							haspLayer.setVisibility(false);
							railwayBuffer20=new OpenLayers.Layer.Vector("tem1");
							//加载sld文件，为缓冲区设置风格
										$.get(
											"data/railwayBuff.sld",
											function(req){
												 var format = new OpenLayers.Format.SLD();
												 var sld = format.read(req);
												 var style=sld.namedLayers['railwayBuff'].userStyles[0];
												 var styleMap= new OpenLayers.StyleMap({"default":style});
												 railwayBuffer20.styleMap=styleMap;
											},
											"xml"
										);
							//加载底图图层
							layer = new OpenLayers.Layer.WMS(
								"Global Imagery",
								host+"/cite/wms?service=WMS",
								 {layers: "railway1"},
								 {singleTile:true}
							);
							stationLable=new OpenLayers.Layer.WMS(
								"label",
								host+"/cite/wms?service=WMS",
								 {layers: "rshp12",transparent:true},
								 {singleTile:true}
							);
							stationLable.setVisibility(false);
							//自动站图层
							stationLayer=new OpenLayers.Layer.WMS(
								"stationLayer",
								host+"/cite/wms?service=WMS",
								{layers:"rshp0",transparent:true}
							);
							stationLayer.setVisibility(false);
							//加载铁路图层
							railwayLayer = new OpenLayers.Layer.WMS(
								"Global Imagery",
								host+"/cite/wms?service=WMS",
								 {layers: "1",transparent: true}
							);
							
							//为下拉菜单添加事件
							$("#hc2 li").click(
								function(){
									var id=$(this).attr("id");
									var layerName;
									if(id=="buff10"){
										layerName="railway_buff10";
										railwayBuffer20.removeAllFeatures();
										railwayBuffer20.setVisibility(true);
									}
									else if(id=="buff20"){
										layerName="railway_buff20";
										railwayBuffer20.removeAllFeatures();
										railwayBuffer20.setVisibility(true);
									}
									else{
										railwayBuffer20.setVisibility(false);
										return;
									}
									var protolcol=new OpenLayers.Protocol.WFS({
										url:host+"/cite/ows",
										featureType:layerName,
										featureNS: "http://www.opengeospatial.net/cite",
										callback:function(d){
											railwayBuffer20.addFeatures(d.features);
										}
									});
									protolcol.read();
								}
							);
							
							//鼠标位置control，用于显示当前鼠标位置的经纬度的插件
							var mouseP=new OpenLayers.Control.MousePosition();
							mouseP.displayProjection=new OpenLayers.Projection(4326);
							
							//将上面初始化的一系列图层和control添加到map中去
							map.addLayers([layer,jbLayer,station_warning,stationLable,railwayLayer,railwayBuffer20,stationLayerWFS,stationLayer,haspLayer]);	
							
							var panel = new OpenLayers.Control.Panel({
							createControlMarkup: function() {
										var myControl="<table id='legend'><tr><td><img Style='width:25px;height:25px' src='images/Warning.gif'/></td><td>注意警戒</td></tr><tr><td><img Style='width:25px;height:25px' src='images/Warning.gif'/></td><td>限速警戒</td></tr></table>";
										return $(myControl)[0];			
									}
							});
							
							panel.addControls([new OpenLayers.Control.Button()]);
							
							var hapsLegendpanel = new OpenLayers.Control.Panel({
							createControlMarkup: function() {
										var myControl="<img id='hapsLength' style='margin-left: 730px; display:none' src='images/hapslegend.png'/>";
										return $(myControl)[0];			
									}
							});
							hapsLegendpanel.addControls([new OpenLayers.Control.Button()]);
							stationSelector=new OpenLayers.Control.SelectFeature(								
									stationLayerWFS,
									{
										onSelect:function(e){
											if(popup){
												
												map.removePopup(popup);
											}
											popup=new OpenLayers.Popup.FramedCloud(
												"",
												new  OpenLayers.LonLat(e.geometry.x,e.geometry.y),
												new OpenLayers.Size(100,100),
												"<div><p>站点名："+e.data.name+"</p><p>5分钟滑动雨量："+e.data.r05m+"</p></div>",
												null,
												true,
												null
											);
											map.addPopup(popup);
										}
									}
							);
							
							tlyxSelector=new OpenLayers.Control.SelectFeature(								
									jbLayer,
									{
										onSelect:function(e){
											if(popup){
												map.removePopup(popup);
											}
											popup=new OpenLayers.Popup.FramedCloud(
												"",
												new  OpenLayers.LonLat(e.geometry.getCentroid().x,e.geometry.getCentroid().y),
												new OpenLayers.Size(100,100),
												"<img src='images/yltj.jpg'/>",
												null,
												true,
												null
											);
											map.addPopup(popup);
										}
									}
							);
							
							map.addControls([
								new OpenLayers.Control.Navigation(),
								new OpenLayers.Control.Attribution(),
								new OpenLayers.Control.PanZoomBar(),
								hapsLegendpanel,
								mouseP,
								panel,
								tlyxSelector,
								stationSelector
							]);
							$("#legend").hide();
							tlyxSelector.activate();
							
							
							mouseP.activate();
							map.zoomToMaxExtent();
							map.setCenter(new OpenLayers.LonLat(113.62678, 23.44851), 3);
							map.events.register(
								"zoomend",
								"",
								function(e){
									updateaStation(e);
								}
							);
							map.events.register(
								"moveend",
								"",
								function(e){
									updateaStation(e);
								}
							);
				});
			
			function updateStationLayer(){
				stationLayer.params['LAYERS']='rshp'+stationIndex;
				stationLayer.redraw();
				stationIndex++;
				if(stationIndex>5){
					stationIndex=0;
				}
			}
			
			//根据地图缩放控制wfs的显示
			function updateaStation(e){
					if(e.object.zoom>=7){
							stationLable.setVisibility(true);
							stationSelector.activate();
							tlyxSelector.deactivate();
							var protolcol=new OpenLayers.Protocol.WFS({
								url:host+"/cite/ows",
								featureType: "rshp12",
								featureNS: "http://www.opengeospatial.net/cite",
								callback:function(d){
									stationLayerWFS.removeAllFeatures();
									stationLayerWFS.addFeatures(d.features);
								},
								 filter:new OpenLayers.Filter.Spatial({
										type:OpenLayers.Filter.Spatial.BBOX,
										property:'the_geom',
										value:map.getExtent()
									}
								)
						});
							protolcol.read();
					}
					else{
						stationLable.setVisibility(false);
						stationSelector.deactivate();
						tlyxSelector.activate();
						stationLayerWFS.removeAllFeatures();
					}
				}
			
			function showTJ(){
				if($("#rainTJ").is(":visible")){
					$("#rainTJ").hide();
					$("#mapDiv").show();
				}else{
					$("#rainTJ").show();
					$("#mapDiv").hide();
				}
			}
			
			function showStation(){
				stationLayer.setVisibility(!(stationLayer.visibility));
				if(stationLayer.visibility){
					//stationInterval=setInterval(updateStationLayer,5000);
					$("#legend").show();
					$("#stationTJ").show();
					$("#MyMapPanel").hide();
				}
				else{
					//clearInterval(stationInterval);
					$("#legend").hide();
					$("#stationTJ").hide();
				}
			}
			
			function showleidatu(){
				var visibility=haspLayer.visibility;
				 haspLayer.setVisibility(!visibility);
				 if(visibility){
					clearInterval(haspInterval);
					$("#hapsLength").hide();
				 }
				 else{
					$("#hapsLength").show();
					haspInterval=setInterval(
						function(){
							haspLayer.setUrl(getHaspBaseUrl()+"/"+haspImgIndex+".gif");
							haspImgIndex++;
							if(haspImgIndex>=24){
								haspImgIndex=0;
							}
						}
						,1000
					)
				 }
				
			}
			
			function getHaspBaseUrl(){
				var d=new Date();
				var year=d.getFullYear()+"";
				var day=d.getDate()+"";
				var month=d.getMonth()+1;
				var hours=d.getHours()-2;
				var date=year+month+day;
				var url="http://58.215.188.217:8080/fileupload/receiveFile/img/"+date+"/"+hours;
				return url;
			}
			
			function showQuanshengYujing(){
				var visibility=jbLayer.visibility;
				jbLayer.setVisibility(!visibility);
				if(visibility){
					$("#MyMapPanel").hide();
					$("#hapsLength").show();
				}
				else{
					$("#MyMapPanel").show();
					$("#hapsLength").hide();
				}
				
			}
