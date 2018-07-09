package com.unifina.controller.security

import com.mashape.unirest.http.Unirest
import com.unifina.domain.security.RegistrationCode
import com.unifina.domain.security.SecUser
import com.unifina.domain.security.SignupInvite
import com.unifina.exceptions.UserCreationFailedException
import com.unifina.service.SignupCodeService
import com.unifina.service.UserService
import grails.converters.JSON
import grails.plugin.mail.MailService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.SpringSecurityUtils
import grails.plugin.springsecurity.annotation.Secured
import grails.plugin.springsecurity.authentication.dao.NullSaltSource
import grails.util.Environment
import org.springframework.security.authentication.dao.SaltSource

@Secured(["permitAll"])
class AuthController {
	UserService userService
	MailService mailService
	SpringSecurityService springSecurityService
	SignupCodeService signupCodeService
	SaltSource saltSource

	static allowedMethods = [
		register      : "POST",
		signup        : "POST",
		forgotPassword: "POST",
		resetPassword : "POST",
	]

	def index = {
		return
	}

	def register(RegisterCommand cmd) {
		SignupInvite invite = SignupInvite.findByCode(cmd.invite)
		if (!invite || invite.used || !invite.sent) {
			response.status = 400
			return render([success: false, error: "Invitation code not valid"] as JSON)
		}

		log.info("Activated invite for ${invite.username}, ${invite.code}")

		def user

		if (cmd.hasErrors()) {
			log.warn("Registration command has errors: ${userService.checkErrors(cmd.errors.getAllErrors())}")
			response.status = 400
			return render([success: false, error: userService.beautifyErrors(cmd.errors.getAllErrors())] as JSON)
		}

		try {
			// TODO: timezone
			user = userService.createUser([:] << cmd.properties << [username: invite.username, timezone: "aapeli"])
		} catch (UserCreationFailedException e) {
			response.status = 500
			return render([success: false, error: e.getMessage()] as JSON)
		}

		invite.used = true
		if (!invite.save(flush: true)) {
			log.warn("Failed to save invite: ${invite.errors}")
			response.status = 500
			return render([success: false, error: "Failed to save invite: ${invite.errors}"] as JSON)
		}

		mailService.sendMail {
			from grailsApplication.config.unifina.email.sender
			to user.username
			subject grailsApplication.config.unifina.email.welcome.subject
			html g.render(template: "email_welcome", model: [user: user])
		}

		log.info("Logging in ${user.username} after registering")
		springSecurityService.reauthenticate(user.username)

		render(user.toMap() as JSON)
	}

	def signup(EmailCommand cmd) {
		if (cmd.hasErrors()) {
			response.status = 400
			return render([success: false, error: userService.beautifyErrors(cmd.errors.getAllErrors())] as JSON)
		}

		// TODO: in the UI the recaptcha is just totally taken away. should we just remove it from here as well?
		if (grailsApplication.config.streamr.signup.requireCaptcha) {
			def response = Unirest.post(grailsApplication.config.recaptcha.verifyUrl)
				.field("secret", (String) grailsApplication.config.recaptchav2.secret)
				.field("response", (String) params."g-recaptcha-response")
				.asJson()
			if (response.body.jsonObject.success != true) {
				response.status = 400
				return render([success: false, error: "Confirming reCaptcha failed for some reason. Please refresh page and refill form."] as JSON)
			}
		}

		def existingUser = SecUser.findByUsername(cmd.username)
		if (existingUser) {
			response.status = 400
			return render([success: false, error: "User exists already"] as JSON)
		}

		SignupInvite invite
		if (Environment.current == Environment.TEST) {
			// kludge needed for RegisterSpec."registering can now be done correctly"()
			invite = new SignupInvite(
				username: cmd.username,
				code: cmd.username.replaceAll("@", "_"),
				sent: true,
				used: false
			)
			invite.save()
		} else {
			invite = signupCodeService.create(cmd.username)
		}

		invite.sent = true
		if (!invite.save(flush: true)) {
			log.warn("Failed to save invite: ${invite.errors}")
			response.status = 500
			return render([success: false, error: "Failed to save invite: ${invite.errors}"] as JSON)
		}

		log.info("Signed up $invite.username")

		mailService.sendMail {
			from grailsApplication.config.unifina.email.sender
			to invite.username
			subject grailsApplication.config.unifina.email.registerLink.subject
			html g.render(template: "email_register_link", model: [user: invite])
		}

		return render([username: cmd.username] as JSON)
	}

	def forgotPassword(EmailCommand cmd) {
		if (cmd.hasErrors()) {
			response.status = 400
			return render([success: false, error: userService.beautifyErrors(cmd.errors.getAllErrors())] as JSON)
		}

		def user = SecUser.findWhere(username: cmd.username)
		if (!user) {
			return render([emailSent: true] as JSON) // don't reveal users
		}

		def registrationCode = new RegistrationCode(username: user.username)
		registrationCode.save(flush: true)

		String url = generateLink('resetPassword', [t: registrationCode.token])

		mailService.sendMail {
			from grailsApplication.config.unifina.email.sender
			to user.username
			subject grailsApplication.config.unifina.email.forgotPassword.subject
			html g.render(template: "email_forgot_password", model: [token: registrationCode.token])
		}

		return render([emailSent: true] as JSON)
	}

	def resetPassword(ResetPasswordCommand command) {

		String token = params.t

		def registrationCode = token ? RegistrationCode.findByToken(token) : null

		if (!registrationCode) {
			flash.error = message(code: 'spring.security.ui.resetPassword.badCode')
			redirect uri: SpringSecurityUtils.securityConfig.successHandler.defaultTargetUrl
			return
		}

		def user = SecUser.findByUsername(registrationCode.username)
		if (!user)
			throw new RuntimeException("User belonging to the registration code was not found: $registrationCode.username")

		if (!request.post) {
			log.info("Password reset code activated for user $registrationCode.username")
			return [token: token, command: new ResetPasswordCommand(), user: user]
		}

		command.username = registrationCode.username
		command.validate()

		if (command.hasErrors()) {
			return [token: token, command: command, user: user]
		}

		String salt = saltSource instanceof NullSaltSource ? null : registrationCode.username
		RegistrationCode.withTransaction { status ->
			user.password = springSecurityService.encodePassword(command.password, salt)
			user.save()
			registrationCode.delete()
		}

		springSecurityService.reauthenticate registrationCode.username

		flash.message = message(code: 'spring.security.ui.resetPassword.success')

		def conf = SpringSecurityUtils.securityConfig
		String postResetUrl = conf.ui.register.postResetUrl ?: conf.successHandler.defaultTargetUrl
		redirect uri: postResetUrl
	}

	protected String generateLink(String action, linkParams) {
		createLink(base: "$request.scheme://$request.serverName:$request.serverPort$request.contextPath",
			controller: 'register', action: action,
			params: linkParams)
	}

	def ajaxLoginForm = {
		def config = SpringSecurityUtils.securityConfig
		String postUrl = "${request.contextPath}${config.apf.filterProcessesUrl}"
		render(template: "ajaxLoginForm", model: [postUrl: postUrl, rememberMeParameter: config.rememberMe.parameter])
	}
}

class EmailCommand {
	String username
	static constraints = {
		username blank: false, email: true
	}
}

class RegisterCommand {
	String invite
	String name
	String password
	String password2
	String tosConfirmed

	def userService

	static constraints = {
		invite blank: false

		tosConfirmed blank: false, validator: { val -> new Boolean(val) }

		name blank: false

		password validator: { String password, RegisterCommand command ->
			return command.userService.passwordValidator(password, command)
		}

		password2 validator: { String password2, RegisterCommand command ->
			return command.userService.password2Validator(password2, command)
		}
	}
}

class ResetPasswordCommand {
	String username
	String password
	String password2

	def userService

	static constraints = {
		username blank: false
		password validator: { String password, ResetPasswordCommand command ->
			return command.userService.passwordValidator(password, command)
		}
		password2 validator: { value, ResetPasswordCommand command ->
			return command.userService.password2Validator(value, command)
		}
	}
}