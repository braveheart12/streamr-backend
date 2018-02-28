<html>
<head>
	<meta name="layout" content="sidemenu" />

	<r:require module="streamr-chart"/>
	<r:require module="streamr-map"/>
	<r:require module="streamr-heatmap"/>
	<r:require module="streamr-table"/>

	<r:require module="streamr-app-webpack-bundle"/>

	<style>
	body, #streamrAppRoot {
		height: 100%;
	}
	</style>

</head>

<body class="main-menu-fixed dashboard-show mme editing">
<script>
	const keyId = "${key.id}"
</script>
	<div id="streamrAppRoot"></div>
</body>
</html>

