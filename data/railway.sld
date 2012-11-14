<?xml version="1.0" encoding="UTF-8"?>
<sld:StyledLayerDescriptor version="1.0.0" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
	<sld:NamedLayer>
		<sld:Name>railway</sld:Name>
		<sld:UserStyle>
			<sld:Name>railway</sld:Name>
			<sld:Title/>
			<sld:FeatureTypeStyle>
				<sld:Name>group 0</sld:Name>
				<sld:FeatureTypeName>Feature</sld:FeatureTypeName>
				<sld:SemanticTypeIdentifier>generic:geometry</sld:SemanticTypeIdentifier>
				<sld:SemanticTypeIdentifier>simple</sld:SemanticTypeIdentifier>
				<sld:Rule>
					<sld:Name>New Rule (1)</sld:Name>
					<sld:LineSymbolizer>
						<sld:Stroke>
							<sld:CssParameter name="stroke">#747474</sld:CssParameter>
							<sld:CssParameter name="stroke-width">4.0</sld:CssParameter>
						</sld:Stroke>
					</sld:LineSymbolizer>
				</sld:Rule>
				<sld:Rule>
					<sld:Name>default rule</sld:Name>
					<sld:LineSymbolizer>
						<sld:Stroke>
							<sld:CssParameter name="stroke">#FFFFFF</sld:CssParameter>
							<sld:CssParameter name="stroke-dashoffset">1</sld:CssParameter>
						</sld:Stroke>
					</sld:LineSymbolizer>
				</sld:Rule>
				<sld:Rule>
					<sld:Name>New Rule</sld:Name>
					<sld:LineSymbolizer>						
						<sld:Stroke>
							<sld:CssParameter name="stroke">#868686</sld:CssParameter>
							<sld:CssParameter name="stroke-width">4.0</sld:CssParameter>
							<sld:CssParameter name="stroke-dasharray">10.0</sld:CssParameter>
						</sld:Stroke>
					</sld:LineSymbolizer>
				</sld:Rule>
			</sld:FeatureTypeStyle>
		</sld:UserStyle>
		
	</sld:NamedLayer>
</sld:StyledLayerDescriptor>
