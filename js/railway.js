			var layer;//底图图层
			var map;   //openlayer的map对象
			var railwayLayer;//纯铁路图层
			var railwayBuffer20; //铁路20公里缓冲区
			var haspLayer;//hasp图层
			var localhost="http://localhost:8080/geoserver";
			var remotehost="http://58.215.188.217:8080/geoserver";
			var host=localhost;
			var haspImgIndex=0;//图片计数器，用于图片的自动轮换
			var haspInterval;//图片切换的定时器对象
			
			//地图的边界
			var bounds = new OpenLayers.Bounds(
				103.17303486509098, 17.207625610448765,
				120.82696513490903, 30.58254318474525
			);
			$(document).ready(
				function(){		
							//地图的初始化参数
							var options = {
								projection: new OpenLayers.Projection("EPSG:4326"),
								units: "degrees",
								numZoomLevels: 15, 
								maxExtent:bounds
							};
							//初始化地图对象
							map = new OpenLayers.Map("mapDiv",options);
							haspLayer=new OpenLayers.Layer.Image(
									"nc",
									"20121109/img/09/22.gif",
									new OpenLayers.Bounds(103.17303486509098, 17.207625610448765,120.82696513490903, 30.58254318474525),
									new OpenLayers.Size(1074,800),
									{ // Other options
										isBaseLayer : false,
										maxResolution: 0.06896066511648435,
										minResolution: 0.0001346887990556335
									}
							);
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
										featureType: layerName,
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
							map.addLayers([layer,railwayLayer,railwayBuffer20,haspLayer]);					
							
							map.addControl(mouseP);
							map.addControls([
								new OpenLayers.Control.Navigation(),
								new OpenLayers.Control.Attribution(),
								new OpenLayers.Control.PanZoomBar()
							]);
							mouseP.activate();
							map.zoomToMaxExtent();
							map.setCenter(new OpenLayers.LonLat(113.62678, 23.44851), 3);
				});
			
			function showleidatu(){
				var visibility=haspLayer.visibility;
				 haspLayer.setVisibility(!visibility);
				 if(visibility){
					clearInterval(haspInterval);
				 }
				 else(
					haspInterval=setInterval(
						function(){
							haspLayer.setUrl("20121109/img/09/"+haspImgIndex+".gif");
							haspImgIndex++;
							if(haspImgIndex>=24){
								haspImgIndex=0;
							}
						}
						,1000
					)
				 )
				
			}
