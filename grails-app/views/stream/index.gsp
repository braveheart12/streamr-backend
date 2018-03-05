<html>
<head>
	<meta name="layout" content="main" />

	<title>Stream</title>

	<webpack:cssBundle name="commons"/>
	<webpack:cssBundle name="streamPage"/>
</head>

<body style="height: 100%">
	<script>
		const keyId = '${key.id}'
	</script>
	<div id="streamPageRoot" style="width:100%;height:100%"></div>

	<webpack:jsBundle name="commons"/>
	<webpack:jsBundle name="streamPage"/>
</body>
</html>

