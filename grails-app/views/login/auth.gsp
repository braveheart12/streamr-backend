<html>
	<head>
	    <meta name="layout" content="login" />
	    <title><g:message code='springSecurity.ui.login.title'/></title>

		<r:script>
			$(document).ready(function() {
				$('#username').focus();
			});
		</r:script>
	</head>

	<body class="login-page show-sign-up">
		<div class="page-signin-alt">

	<h1 class="form-header"><g:message code="springSecurity.login.header"/></h1>

	<!-- Form -->
	<form action='${postUrl}' method='POST' id='loginForm' autocomplete='off' class="panel">
		<p class='text-danger login-failed-message' ${flash.message ? "" : "style='display:none'"}>${flash.message}</p>
		<div class="form-group">
			<input type="text" name="j_username" id="username" class="form-control input-lg" placeholder="${message(code:"secuser.username.label", default:"Username")}">
		</div> <!-- / Username -->
		<div class="form-group signin-password">
			<input type="password" name="j_password" id="password" class="form-control input-lg" placeholder="Password">
		</div> <!-- / Password -->
		<div class="form-actions">
			<input id="loginButton" type="submit" value="${message(code:'springSecurity.login.button')}" class="btn btn-primary btn-block btn-lg">
		</div> <!-- / .form-actions -->
		<div class="footer">
			<g:if test="${ grailsApplication.config.grails.plugin.springsecurity.rememberMe.enabled == true }">
				<label id="rememberMeCheckbox" class="checkbox-inline">
					<input type="checkbox" class="px" name="_spring_security_remember_me">
					<span class="lbl">Remember me</span>
				</label>
			</g:if>
			<g:else>
				<label></label>
			</g:else>
			<div class="forgot">
				<g:link controller="register" action="forgotPassword">
					Forgot password?
				</g:link>
			</div>
		</div>
	</form>
	<!-- / Form -->

</div>
	</body>
</html>
